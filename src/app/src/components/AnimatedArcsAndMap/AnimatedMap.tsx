import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { StateGeometry, StateProperties } from '../states.geojson';
import '@elfalem/leaflet-curve';

import StatesLayer from '../StatesLayer';

import { SpendingByGeographyAtMonth } from '../../types/api';

import { MONTHLY_TIME_DURATION, TOTAL_BIL_AMOUNT } from '../../constants';

export default function AnimatedMap({
    animationEnabled,
    spendingAtTimeByState,
    setTimeValue,
}: {
    animationEnabled: boolean;
    spendingAtTimeByState: SpendingByGeographyAtMonth;
    setTimeValue: React.Dispatch<React.SetStateAction<number>>;
}) {
    const map = useMap();

    useEffect(() => {
        if (animationEnabled) {
            const monthlyInterval = setInterval(() => {
                setTimeValue(
                    currentTimeValue =>
                        Math.round((currentTimeValue + 0.1) * 10) / 10
                );
            }, MONTHLY_TIME_DURATION / 10);
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
    const fractionOfTotalAwards = amount ? amount / TOTAL_BIL_AMOUNT : 0;
    return fractionOfTotalAwards > 0.1
        ? '#465EB5'
        : fractionOfTotalAwards > 0.05
        ? '#94A4DF'
        : 'white';
}
