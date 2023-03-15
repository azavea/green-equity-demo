import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { StateGeometry, StateProperties } from '../states.geojson';
import '@elfalem/leaflet-curve';

import StatesLayer from '../StatesLayer';

import {
    MonthlySpendingOverTimeByState,
    SpendingByGeographyAtMonth,
} from '../../types/api';

export default function AnimatedMap({
    animationEnabled,
    spending,
    timeValue,
    setTimeValue,
}: {
    animationEnabled: boolean;
    spending: MonthlySpendingOverTimeByState;
    timeValue: number;
    setTimeValue: React.Dispatch<React.SetStateAction<number>>;
}) {
    const map = useMap();
    const [spendingAtTimeByState, setSpendingAtTimeByState] = useState(() =>
        getSpendingByStateAtTime(1, spending)
    );

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
    }, [animationEnabled, setTimeValue]);

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
