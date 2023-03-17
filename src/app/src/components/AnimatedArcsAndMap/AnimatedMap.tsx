import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { StateGeometry, StateProperties } from '../../types/states';
import '@elfalem/leaflet-curve';

import StatesLayer from '../StatesLayer';

import { SpendingByGeographyAtMonth } from '../../types/api';

import { TOTAL_BIL_AMOUNT } from '../../constants';
import useCreateArcPath from './useCreateArcPath';

export default function AnimatedMap({
    spendingAtTimeByState,
    animationEnabled,
}: {
    spendingAtTimeByState: SpendingByGeographyAtMonth;
    animationEnabled: boolean;
}) {
    const map = useMap();
    const arcPathsReference = useRef<Record<string, L.Curve>>({});
    const createArcPath = useCreateArcPath(arcPathsReference);

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
        if (
            !animationEnabled &&
            Object.keys(arcPathsReference.current).length > 0
        ) {
            Object.values(arcPathsReference.current).forEach(path => {
                path.removeFrom(map);
            });
            arcPathsReference.current = {};
        }
        animationEnabled &&
            Object.values(arcPathsReference.current).forEach(path => {
                path.addTo(map);
            });
    }, [map, animationEnabled]);

    return (
        <>
            <StatesLayer
                onEachFeature={(
                    feature,
                    layer: L.GeoJSON<StateProperties, StateGeometry>
                ) => {
                    layer.on('add', createArcPath);
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
