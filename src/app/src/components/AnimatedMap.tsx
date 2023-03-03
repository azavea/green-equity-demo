import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import {
    Center,
    CircularProgress,
    Heading,
    Spacer,
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
    MonthlySpendingOverTimeByState,
    SpendingByGeographyAtMonth,
} from '../types/api';
import AnimatedMapLegend from './AnimatedMapLegend';
import { useGetSpendingOverTimeQuery } from '../api';

const START_YEAR = 2021;
const END_DATE = new Date();
const PROGRESS_FINAL_STEP = (() => {
    const final_month_step = END_DATE.getMonth();
    const final_year_step = END_DATE.getFullYear();
    return 12 * (final_year_step - START_YEAR) + final_month_step;
})();

export default function AnimatedMap() {
    const { data, isFetching } = useGetSpendingOverTimeQuery();

    const [timeValue, setTimeValue] = useState(0);
    const [animationEnabled, setAnimationEnabled] = useState(false);
    const [restartTimeControl, setRestartTimeControl] = useState(false);

    useEffect(() => {
        if (animationEnabled) {
            const monthlyInterval = setInterval(() => {
                setTimeValue(
                    currentTimeValue =>
                        Math.round((currentTimeValue + 0.1) * 10) / 10
                );
            }, 25);
            return () => {
                clearInterval(monthlyInterval);
            };
        }
    }, [animationEnabled]);

    useEffect(() => {
        if (timeValue === PROGRESS_FINAL_STEP) {
            setAnimationEnabled(false);
            setRestartTimeControl(true);
        }
    }, [timeValue]);

    function onSelectTimeAnimation() {
        if (restartTimeControl) {
            setTimeValue(0);
            setRestartTimeControl(false);
        }
        setAnimationEnabled(true);
    }

    return (
        <>
            <Heading variant='subtitle'>
                Allocation of awarded funding over time
            </Heading>
            <Spacer></Spacer>
            {data && !isFetching ? (
                <>
                    <AnimatedMapLegend />
                    <UsaMapContainer>
                        <StatesAndSliderLayer
                            spending={data}
                            timeValue={timeValue}
                        />
                    </UsaMapContainer>
                    <Box width='100%' textAlign={'center'}>
                        <IconButton
                            aria-label='Play time progress animation'
                            icon={
                                <TimeControlIcon restart={restartTimeControl} />
                            }
                            mr='25px'
                            background='none'
                            onClick={onSelectTimeAnimation}
                            isDisabled={animationEnabled}
                            size='lg'
                        />
                        <Tag width='60%' maxWidth={'750px'} background='none'>
                            <TagLabel mt='-30px' mr='-35px' overflow={'none'}>
                                2021
                            </TagLabel>
                            <Progress
                                value={timeValue}
                                opacity={100}
                                colorScheme={'progress'}
                                aria-label='date-time-progress-bar'
                                min={0}
                                max={PROGRESS_FINAL_STEP}
                                width='100%'
                                maxWidth={'750px'}
                                height='20px'
                                mt='10px'
                                display={'inline-block'}
                            />
                            <TagLabel mt='-30px' ml='-35px' overflow={'none'}>
                                Now
                            </TagLabel>
                        </Tag>
                    </Box>
                </>
            ) : (
                <Center p={4}>
                    <CircularProgress isIndeterminate />
                </Center>
            )}
        </>
    );
}

function StatesAndSliderLayer({
    spending,
    timeValue,
}: {
    spending: MonthlySpendingOverTimeByState;
    timeValue: number;
}) {
    const map = useMap();

    const [spendingAtTimeByState, setSpendingAtTimeByState] = useState(() =>
        getSpendingByStateAtTime(1, spending)
    );

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
        timeValue % 1 === 0 &&
            spending &&
            setSpendingAtTimeByState(
                getSpendingByStateAtTime(timeValue, spending)
            );
    }, [timeValue, spending]);

    return (
        <>
            <StatesLayer
                onEachFeature={(
                    feature,
                    layer: L.GeoJSON<StateProperties, StateGeometry>
                ) => {
                    const defaultFillColor = getColor(
                        spendingAtTimeByState[
                            feature.properties.STUSPS.toString()
                        ]?.aggregated_amount
                    );
                    layer &&
                        layer.setStyle({
                            fill: true,
                            fillColor: defaultFillColor,
                            fillOpacity: 100,
                        });
                }}
            />
        </>
    );
}

function getColor(amount: number | undefined): string {
    const fractionOfTotalAwards = amount ? amount / 550000000000 : 0;
    return fractionOfTotalAwards > 0.1
        ? '#465EB5'
        : fractionOfTotalAwards > 0.05
        ? '#94A4DF'
        : 'white';
}

function getSpendingByStateAtTime(
    timeValue: number,
    spending: MonthlySpendingOverTimeByState
): SpendingByGeographyAtMonth {
    const isDecember = timeValue % 12 === 0;
    const fiscalYearSelection =
        2021 + Math.floor(isDecember ? timeValue / 13 : timeValue / 12);
    const monthSelection = !!timeValue && isDecember ? 12 : timeValue % 12;
    const spendingAtTimeValue = spending.map(stateSpending => {
        const resultAtTimeValue = stateSpending.results.find(entry => {
            return (
                entry.time_period.fiscal_year === fiscalYearSelection &&
                entry.time_period.month === monthSelection
            );
        })!;
        return { ...stateSpending, results: resultAtTimeValue };
    });
    return Object.fromEntries(
        spendingAtTimeValue.map(stateSpending => [
            stateSpending.shape_code,
            stateSpending.results,
        ])
    );
}
