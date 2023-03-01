import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import {
    Heading,
    Spacer,
    HStack,
    Box,
    IconButton,
    Progress,
    Tag,
    TagLabel,
} from '@chakra-ui/react';

import L from 'leaflet';
import UsaMapContainer from './UsaMapContainer';
import { StateGeometry, StateProperties } from './states.geojson';

import StatesLayer from './StatesLayer';
import TimeControlIcon from './TimeControlIcon';

import {
    MonthlySpendingOverTimeResponse,
    SpendingByGeographyAtMonth,
} from '../types/api';
import { spendingDataByMonth } from './dummySpendingDataByMonth';

export default function AnimatedMap() {
    return (
        <>
            <Heading variant='subtitle'>
                Allocation of announced award funding over time
            </Heading>
            <Spacer></Spacer>
            <Box width='100%' pl='20%'>
                <HStack spacing='0px' border={'1px'} width='210px'>
                    <Box w='70px' h='40px' bg='white'></Box>
                    <Box
                        w='70px'
                        h='40px'
                        bg='#94A4DF'
                        textAlign={'center'}
                        color={'white'}
                        fontSize={'sm'}
                        pt='8px'
                    >
                        ≥1% BIL
                    </Box>
                    <Box
                        w='70px'
                        h='40px'
                        bg='#465EB5'
                        textAlign={'center'}
                        color={'white'}
                        fontSize={'sm'}
                        pt='8px'
                    >
                        ≥2% BIL
                    </Box>
                </HStack>
            </Box>
            <UsaMapContainer>
                <StatesAndSliderLayer spending={spendingDataByMonth} />
            </UsaMapContainer>
        </>
    );
}

function StatesAndSliderLayer({
    spending,
}: {
    spending: MonthlySpendingOverTimeResponse;
}) {
    const PROGRESS_FINAL_MONTH = 26;
    const map = useMap();
    const [timeValue, setTimeValue] = useState(0);
    const [spendingAtTimeByState, setSpendingAtTimeByState] = useState(() =>
        getSpendingByStateAtTime(1, spending)
    );
    const [animationEnabled, setAnimationEnabled] = useState(false);
    const [restartTimeControl, setRestartTimeControl] = useState(false);

    useEffect(() => {
        map &&
            map.eachLayer(l => {
                const asGeoJson = l as L.GeoJSON<
                    StateProperties,
                    StateGeometry
                >;
                asGeoJson.feature &&
                    asGeoJson.setStyle({
                        fillColor: getColor(
                            spendingAtTimeByState[
                                (
                                    asGeoJson.feature as GeoJSON.Feature<
                                        GeoJSON.MultiPoint,
                                        StateProperties
                                    >
                                ).properties.STUSPS
                            ]?.aggregated_amount
                        ),
                    });
            });
    }, [map, spendingAtTimeByState]);

    useEffect(() => {
        (timeValue % 1 === 0) && spending && setSpendingAtTimeByState(getSpendingByStateAtTime(timeValue, spending));
        if(timeValue === PROGRESS_FINAL_MONTH){
            setAnimationEnabled(false);
            setRestartTimeControl(true);
        }
    }, [timeValue, spending])

    useEffect(() => {
        if(animationEnabled){
            const monthlyInterval = setInterval(() => {
                setTimeValue(currentTimeValue => Math.round((currentTimeValue + 0.1)*10)/10);
            },
                25
            );
            return () => {
                clearInterval(monthlyInterval);
            };
        }
    }, [animationEnabled]);

    function onSelectTimeAnimation(){
        if(restartTimeControl){
            setTimeValue(0);
            setRestartTimeControl(false);
        }
        setAnimationEnabled(true);
    }

    return (
        <>
            <StatesLayer
                onEachFeature={(
                    feature,
                    layer: L.GeoJSON<StateProperties, StateGeometry>
                ) => {
                    const defaultFillColor = getColor(
                        spendingAtTimeByState[feature.properties.STUSPS]
                            ?.aggregated_amount
                    );
                    layer &&
                        layer.setStyle({
                            fill: true,
                            fillColor: defaultFillColor,
                            fillOpacity: 100,
                        });
                }}
            />
            <Box mt='575px' textAlign={'center'}>
                <IconButton aria-label='Play time progress animation' icon={<TimeControlIcon restart={restartTimeControl} />} mr='25px' background='none' onClick={onSelectTimeAnimation} isDisabled={animationEnabled} />
                <Tag width='60%' maxWidth={'750px'} background='none'>
                    <TagLabel mt='-30px' mr='-35px' overflow={'none'}>2021</TagLabel>
                    <Progress
                        value={timeValue}
                        opacity={100}
                        colorScheme={'progress'}
                        aria-label='date-time-progress-bar'
                        min={0}
                        max={PROGRESS_FINAL_MONTH}
                        width='100%'
                        maxWidth={'750px'}
                        height='20px'
                        mt='10px'
                        display={'inline-block'}
                    />
                    <TagLabel mt='-30px' ml='-35px' overflow={'none'}>Now</TagLabel>
                </Tag>
            </Box>
        </>
    );
}

function getColor(amount: number | undefined): string {
    const fractionOfTotalAwards = amount ? amount / 550000000000 : 0;
    return fractionOfTotalAwards > 0.02
        ? '#465EB5'
        : fractionOfTotalAwards > 0.01
        ? '#94A4DF'
        : 'white';
}

function getSpendingByStateAtTime(
    timeValue: number,
    spending: MonthlySpendingOverTimeResponse
): SpendingByGeographyAtMonth {
    const isDecember = timeValue % 12 === 0;
    const fiscalYearSelection =
        2021 + Math.floor(isDecember ? timeValue / 13 : timeValue / 12);
    const monthSelection = !!timeValue && isDecember ? 12 : timeValue % 12;
    const spendingAtTimeValue = spending.map(stateSpending => {
        const resultAtTimeValue = stateSpending.results.find(
            entry =>
                entry.time_period.fiscal_year === fiscalYearSelection &&
                entry.time_period.month === monthSelection
        )!;
        return { ...stateSpending, results: resultAtTimeValue };
    });
    return Object.fromEntries(
        spendingAtTimeValue.map(stateSpending => [
            stateSpending.shape_code,
            stateSpending.results,
        ])
    );
}
