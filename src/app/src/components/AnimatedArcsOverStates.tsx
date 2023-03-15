import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';

import L from 'leaflet';
import '@elfalem/leaflet-curve';
import { StateGeometry, StateProperties } from './states.geojson';

import StatesLayer from './StatesLayer';

const DC_CENTER: L.LatLngTuple = [1.6467356667879738, 14.997499934940763];

function getBezierOffsetLatLng(end: L.LatLngTuple): L.LatLngTuple {
    // Modified Bezier curve function from https://gist.github.com/ryancatalani/6091e50bf756088bf9bf5de2017b32e6
    const start: L.LatLngTuple = DC_CENTER;
    var offsetX = end[1] - start[1],
        offsetY = end[0] - start[0];

    var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
        theta = Math.atan2(offsetY, offsetX);

    var thetaOffset = 3.14 / 10;

    var r2 = r / 2 / Math.cos(thetaOffset),
        theta2 = theta + thetaOffset;

    var midpointX = r2 * Math.cos(theta2) + start[1],
        midpointY = r2 * Math.sin(theta2) + start[0];

    return [midpointY, midpointX];
}

export default function AnimatedArcsOverStates({
    animationEnabled,
}: {
    animationEnabled: boolean;
}) {
    const map = useMap();
    const arcPathsReference = useRef<
        { shape_code: string; curve: L.Curve; start: number }[]
    >([]);

    map.createPane('arcPathsPane');

    const createArcPath = useCallback(
        (event: any) => {
            const state = event.sourceTarget.feature.properties.STUSPS;
            if (
                arcPathsReference.current.find(
                    path => path.shape_code === state
                )
            ) {
                return;
            }
            const polygonCenter = (event.sourceTarget as L.Polygon)
                .getBounds()
                .getCenter();
            const polygonCenterTuple: L.LatLngTuple = [
                polygonCenter.lat,
                polygonCenter.lng,
            ];
            const midpoint: L.LatLngTuple =
                getBezierOffsetLatLng(polygonCenterTuple);

            arcPathsReference.current.push({
                shape_code: state,
                curve: new L.Curve(
                    ['M', DC_CENTER, 'Q', midpoint, polygonCenterTuple],
                    {
                        color: '#2051FF',
                        weight: 1,
                        pane: 'arcPathsPane',
                        animate: {
                            duration: 2000,
                        },
                    }
                ),
                start: 3,
            });
        },
        [arcPathsReference]
    );

    useEffect(() => {
        if (!animationEnabled && arcPathsReference.current.length > 0) {
            arcPathsReference.current.forEach(path => {
                path.curve.removeFrom(map);
            });
            arcPathsReference.current = [];
        }
        animationEnabled &&
            arcPathsReference.current.forEach(path => {
                path.curve.addTo(map).bringToFront();
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
                }}
            />
        </>
    );
}
