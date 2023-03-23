import { useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L, { LatLngLiteral, LatLngTuple } from 'leaflet';
import { useGetSpendingOverTimeQuery } from '../../api';
import { MonthlySpendingOverTime } from '../../types/api';
import { PROGRESS_FINAL_STEP } from '../../util';
import { DC_CENTER, MONTHLY_TIME_DURATION } from '../../constants';
import { StateFeature } from '../states.geojson';

import polylabel from 'polylabel';

export default function useCreateArcPath(
    arcPathsReference: React.MutableRefObject<
        {
            shape_code: string;
            curve: L.Curve;
        }[]
    >
) {
    const { data: spending } = useGetSpendingOverTimeQuery();
    const map = useMap();
    !map.getPane('arcPathsPane') && map.createPane('arcPathsPane');

    return useCallback(
        (event: any) => {
            const state = event.sourceTarget.feature.properties.STUSPS;
            if (
                arcPathsReference.current.find(
                    path => path.shape_code === state
                ) ||
                !spending
            ) {
                return;
            }
            const polygonCenterTuple: LatLngTuple = findPoleofInaccessibility(
                event.sourceTarget.feature
            );
            const midpoint: L.LatLngTuple =
                getBezierOffsetLatLng(polygonCenterTuple);

            const { startMonth, playDuration } = getPathAnimationValues({
                spendingForState: spending.find(
                    data => data.shape_code === state
                )!,
                totalTimeSteps: PROGRESS_FINAL_STEP,
            });

            arcPathsReference.current.push({
                shape_code: state,
                curve: new L.Curve(
                    ['M', DC_CENTER, 'Q', midpoint, polygonCenterTuple],
                    {
                        color: '#2051FF',
                        weight: 1,
                        pane: 'arcPathsPane',
                        animate: {
                            duration: playDuration,
                            iterationStart: startMonth,
                            iterations: 1,
                            easing: 'ease-out',
                        },
                    }
                ),
            });
        },
        [arcPathsReference, spending]
    );
}

function getPathAnimationValues({
    spendingForState,
    totalTimeSteps,
}: {
    spendingForState: {
        shape_code: string;
        results: MonthlySpendingOverTime;
    };
    totalTimeSteps: number;
}) {
    const totalTime = totalTimeSteps * MONTHLY_TIME_DURATION;
    const firstAward = spendingForState.results.find(
        data => data.aggregated_amount > 0
    );
    if (!firstAward) {
        return {
            startMonth: totalTime,
            playDuration: totalTime,
        };
    }
    if (firstAward.time_period.fiscal_year < 2021) {
        return {
            startMonth: 0,
            playDuration: totalTime,
        };
    }
    const startAtTime =
        (firstAward.time_period.fiscal_year -
            2021 +
            firstAward.time_period.month) *
        MONTHLY_TIME_DURATION;

    return {
        startMonth: startAtTime,
        playDuration: totalTime - startAtTime,
    };
}

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

const findPoleofInaccessibility = (feature: StateFeature) => {
    const asPolygons = feature.geometry.coordinates.map(
        polygonCoords => new L.Polygon(polygonCoords as LatLngTuple[])
    );
    const largestPolygon = asPolygons.reduce((prev, current) =>
        L.GeometryUtil.geodesicArea(prev.getLatLngs()[0] as LatLngLiteral[]) >
        L.GeometryUtil.geodesicArea(current.getLatLngs()[0] as LatLngLiteral[])
            ? prev
            : current
    );
    return polylabel(
        largestPolygon.toGeoJSON().geometry.coordinates as number[][][]
    ) as LatLngTuple;
};
