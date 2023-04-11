import { useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L, { LatLngLiteral, LatLngTuple } from 'leaflet';
import { useGetSpendingOverTimeQuery } from '../../api';
import { MonthlySpendingOverTime } from '../../types/api';
import { PROGRESS_FINAL_STEP } from '../../util';
import { DC_CENTER, MONTHLY_TIME_DURATION } from '../../constants';
import { StateFeature } from '../../types/states';

import polylabel from 'polylabel';

export default function useCreateArcPath(
    arcPathsReference: React.MutableRefObject<Record<string, L.Curve>>
) {
    const { data: spending } = useGetSpendingOverTimeQuery();
    const map = useMap();
    !map.getPane('arcPathsPane') && map.createPane('arcPathsPane');

    return useCallback(
        (event: any) => {
            const state = event.sourceTarget.feature.properties.STUSPS;
            if (arcPathsReference.current[state] || !spending) {
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

            arcPathsReference.current[state] = new L.Curve(
                ['M', DC_CENTER, 'Q', midpoint, polygonCenterTuple],
                {
                    color: '#85bb65', // the actual shade of US legal tender :-O
                    weight: 1,
                    pane: 'arcPathsPane',
                    animate: {
                        duration: playDuration,
                        iterationStart: startMonth,
                        iterations: 1,
                        easing: 'ease-out',
                    },
                }
            );
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
        data => data.per_capita > 0
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
    const offsetX = end[1] - start[1];
    const offsetY = end[0] - start[0];

    const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
    const theta = Math.atan2(offsetY, offsetX);

    const thetaOffset = 3.14 / 10;

    const r2 = r / 2 / Math.cos(thetaOffset);
    const theta2 = theta + thetaOffset;

    const midpointX = r2 * Math.cos(theta2) + start[1];
    const midpointY = r2 * Math.sin(theta2) + start[0];

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
