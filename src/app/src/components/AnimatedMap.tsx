import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Slider, Box, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark } from '@chakra-ui/react';

import UsaMapContainer from './UsaMapContainer';
import StatesLayer from './StatesLayer';

import { MonthlySpendingOverTimeResponse, SpendingByGeographyAtMonth } from '../types/api';
import {spendingDataByMonth} from './dummySpendingDataByMonth';

export default function AnimatedMap() {
    return (
        <UsaMapContainer>
            <StatesAndSliderLayer spending={spendingDataByMonth} />
        </UsaMapContainer>
    );
}

function StatesAndSliderLayer({
    spending,
}: {
    spending: MonthlySpendingOverTimeResponse;
}) {
    const [timeValue, setTimeValue] = useState(0);
    const map = useMap();
    const [spendingAtTimeByState, setSpendingAtTimeByState] = useState(() => getspendingByStateAtTime(1, spending));

    useEffect(()=>{
        setSpendingAtTimeByState(getspendingByStateAtTime(timeValue, spending));
        // @ts-ignore
        map && !!timeValue && map.eachLayer((l) => l.feature && l.setStyle({fillcolor: getColor(spendingAtTimeByState[l.feature.properties.STUSPS]?.aggregated_amount)}));
    }, [map, timeValue])

    const labelStyles = {
        mt: '2',
        ml: '-2.5',
        fontSize: 'sm',
    };

    return (
        <Box>
            <StatesLayer
                onEachFeature={(feature, layer) => {
                    const defaultFillColor = getColor(spendingAtTimeByState[feature.properties.STUSPS]?.aggregated_amount)
                    // maybe need to update geojson types?
                    // @ts-ignore
                    layer && layer.setStyle({fill: true, fillColor: defaultFillColor, fillOpacity: 100 });
                }}
            />
            <Slider aria-label='slider-ex-6' defaultValue={0} min={0} max={26} onChange={(val) => setTimeValue(val)} step={1} width='80%'>
                <SliderThumb />
                <SliderTrack>
                    <SliderMark value={0} {...labelStyles}>
                        2022
                    </SliderMark>
                    <SliderMark value={14} {...labelStyles}>
                        present
                    </SliderMark>
                <SliderFilledTrack />
                </SliderTrack>
            </Slider>
        </Box>
    );
}

function getColor(amount: number | undefined): string {
    const fractionOfTotalAwards = amount ? (amount/TOTAL_BIL_AWARD_AMOUNT) : 0;
    return fractionOfTotalAwards > .15  ? '#465EB5' :
          fractionOfTotalAwards > .10  ? '#94A4DF' :
           'white';
}

function getspendingByStateAtTime(timeValue: number, spending: MonthlySpendingOverTimeResponse): SpendingByGeographyAtMonth{
    const isDecember = timeValue % 12 === 0;
    const fiscalYearSelection = 2021 + Math.floor(isDecember ? (timeValue)/13 : (timeValue)/12);
    const monthSelection = !!timeValue && isDecember ? 12 : timeValue % 12;
    const spendingAtTimeValue = spending.map(stateSpending => {
        const resultAtTimeValue = stateSpending.results.filter(entry => entry.time_period.fiscal_year === fiscalYearSelection && entry.time_period.month === monthSelection)[0];
        return {...stateSpending, results: resultAtTimeValue}
    })
    return Object.fromEntries(
                spendingAtTimeValue.map(stateSpending => [
                    stateSpending.shape_code,
                    stateSpending.results,
                ])
            )
};

