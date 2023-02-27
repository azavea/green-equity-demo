import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import {
    HStack,
    Slider,
    Box,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
} from '@chakra-ui/react';

import L from 'leaflet';
import UsaMapContainer from './UsaMapContainer';
import { StateGeometry, StateProperties } from './states.geojson';

import StatesLayer from './StatesLayer';

import {
    MonthlySpendingOverTimeResponse,
    SpendingByGeographyAtMonth,
} from '../types/api';
import { spendingDataByMonth } from './dummySpendingDataByMonth';

export default function AnimatedMap() {
    return (
        <>
            <UsaMapContainer>
                <StatesAndSliderLayer spending={spendingDataByMonth} />
            </UsaMapContainer>
            <HStack spacing='0px' border={'1px'}>
                <Box w='40px' h='40px' bg='white'></Box>
                <Box
                    w='40px'
                    h='40px'
                    bg='#94A4DF'
                    textAlign={'center'}
                    color={'white'}
                    fontSize={'sm'}
                >
                    ≥1% BIL
                </Box>
                <Box
                    w='40px'
                    h='40px'
                    bg='#465EB5'
                    textAlign={'center'}
                    color={'white'}
                    fontSize={'sm'}
                >
                    ≥2% BIL
                </Box>
            </HStack>
        </>
    );
}

function StatesAndSliderLayer({
    spending,
}: {
    spending: MonthlySpendingOverTimeResponse;
}) {
    const SLIDER_PRESENT_STEP = 26;
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

    function onSliderChange(timeValue: number) {
        setSpendingAtTimeByState(getSpendingByStateAtTime(timeValue, spending));
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
            <Slider
                colorScheme={'blackAlpha'}
                aria-label='date-time-slider'
                defaultValue={0}
                min={0}
                max={SLIDER_PRESENT_STEP}
                onChange={val => onSliderChange(val)}
                step={1}
                mt='575px'
                width='50%'
                ml='20%'
            >
                <SliderThumb ml='50px' />
                <SliderMark value={0} mt='-2' mr='15' fontSize='m'>
                    2021
                </SliderMark>
                <SliderMark
                    value={SLIDER_PRESENT_STEP}
                    mt='-2'
                    ml='70'
                    fontSize='m'
                >
                    present
                </SliderMark>
                <SliderTrack ml='50px'>
                    <SliderFilledTrack />
                </SliderTrack>
            </Slider>
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
        const resultAtTimeValue = stateSpending.results.filter(
            entry =>
                entry.time_period.fiscal_year === fiscalYearSelection &&
                entry.time_period.month === monthSelection
        )[0];
        return { ...stateSpending, results: resultAtTimeValue };
    });
    return Object.fromEntries(
        spendingAtTimeValue.map(stateSpending => [
            stateSpending.shape_code,
            stateSpending.results,
        ])
    );
}
