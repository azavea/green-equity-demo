import { useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { Center, CircularProgress, VStack } from '@chakra-ui/react';
import L, { LatLngLiteral, LatLngTuple } from 'leaflet';
import 'leaflet-draw';
import polylabel from 'polylabel';

import UsaMapContainer from '../UsaMapContainer';
import StatesLayer from '../StatesLayer';
import PersonIcon from './PersonIcon';
import PerCapitaMapLegend, { useMarkerSizeReducer } from './PerCapitaMapLegend';
import SpendingTooltip from './SpendingTooltip';
import SpendingCategorySelector from './SpendingCategorySelector';
import { StateFeature } from '../states.geojson';

import { getAmountCategory } from '../../util';
import { SpendingByGeographySingleResult } from '../../types/api';
import {
    STATE_STYLE_BASE,
    STATE_STYLE_HOVER,
    MARKER_OVERRIDES,
} from '../../constants';
import { Category } from '../../enums';
import useSpendingByCategoryByState from './useSpendingByCategoryByState';

export default function PerCapitaMap() {
    const [spendingCategory, setSpendingCategory] = useState(Category.ALL);
    const spendingByCategoryByState = useSpendingByCategoryByState();

    return (
        <VStack width='100%' justifyContent='center'>
            <SpendingCategorySelector
                value={spendingCategory}
                onChange={setSpendingCategory}
            />
            <UsaMapContainer negativeMargin>
                {spendingByCategoryByState ? (
                    <StatesAndMarkersLayer
                        spendingByCategoryByState={spendingByCategoryByState}
                        selectedCategory={spendingCategory}
                    />
                ) : (
                    <Center p={4}>
                        <CircularProgress isIndeterminate />
                    </Center>
                )}
            </UsaMapContainer>
            <PerCapitaMapLegend />
        </VStack>
    );
}

function StatesAndMarkersLayer({
    spendingByCategoryByState,
    selectedCategory,
}: {
    spendingByCategoryByState: Record<
        string,
        Record<Category, SpendingByGeographySingleResult>
    >;
    selectedCategory: Category;
}) {
    const map = useMap();
    const markerReference = useRef<L.Marker[]>([]);
    const cheatLineReference = useRef<L.Polyline[]>([]);
    const markerSizeReducer = useMarkerSizeReducer();

    const tooltips = Object.keys(spendingByCategoryByState).map(stateCode => {
        const tooltipDiv = document.createElement('div');
        tooltipDiv.dataset.stateCode = stateCode;
        tooltipDiv.id = `tooltip-${stateCode}`;
        return tooltipDiv;
    });
    const [tooltipsAttached, setTooltipsAttached] = useState(false);

    const findPoleofInaccessibility = (feature: StateFeature) => {
        const asPolygons = feature.geometry.coordinates.map(
            polygonCoords => new L.Polygon(polygonCoords as LatLngTuple[])
        );
        const largestPolygon = asPolygons.reduce((prev, current) =>
            L.GeometryUtil.geodesicArea(
                prev.getLatLngs()[0] as LatLngLiteral[]
            ) >
            L.GeometryUtil.geodesicArea(
                current.getLatLngs()[0] as LatLngLiteral[]
            )
                ? prev
                : current
        );
        const poleOfInaccessibility = polylabel(
            largestPolygon.toGeoJSON().geometry.coordinates as number[][][]
        ) as LatLngTuple;
        feature.properties.INACSPOLE = poleOfInaccessibility;
        return poleOfInaccessibility;
    };

    const getMarkerOverride = (feature: StateFeature) => {
        const override = MARKER_OVERRIDES[feature.properties.STUSPS];
        feature.properties.MRKOVERRIDE = override;
        return override;
    };

    return (
        <>
            {tooltipsAttached &&
                tooltips.map(tooltip => {
                    if (!tooltip.dataset.stateCode) {
                        throw new Error('Unreachable code');
                    }

                    const spendingByCategory =
                        spendingByCategoryByState[tooltip.dataset.stateCode];
                    if (spendingByCategory === undefined) {
                        return null;
                    }

                    const allStateSpending =
                        spendingByCategoryByState[
                            tooltip.dataset?.stateCode!
                        ]?.[Category.ALL];

                    if (allStateSpending === undefined) {
                        return null;
                    }

                    return createPortal(
                        <SpendingTooltip
                            state={allStateSpending.display_name ?? ''}
                            population={allStateSpending.population ?? 0}
                            spendingByCategory={spendingByCategory}
                            selectedCategory={selectedCategory}
                        />,
                        tooltip
                    );
                })}
            <StatesLayer
                onEachFeature={(feature, layer) => {
                    layer.on('add', event => {
                        const perCapitaSpending =
                            spendingByCategoryByState[
                                feature.properties.STUSPS
                            ]?.[selectedCategory].per_capita;

                        if (!perCapitaSpending) {
                            return;
                        }

                        const amountCategory =
                            getAmountCategory(perCapitaSpending);

                        // pole of inaccessibility: point (in largest polygon) furthest from edges
                        // some states have overrides for marker locations in the Atlantic
                        const markerLocation =
                            feature.properties.MRKOVERRIDE ??
                            getMarkerOverride(feature) ??
                            feature.properties.INACSPOLE ??
                            findPoleofInaccessibility(feature);

                        const responsiveMarkerSize =
                            amountCategory.size - markerSizeReducer;

                        const marker = new L.Marker(markerLocation, {
                            icon: new L.DivIcon({
                                html: renderToStaticMarkup(
                                    <PersonIcon color={amountCategory.color} />
                                ),
                                iconSize: [
                                    responsiveMarkerSize,
                                    responsiveMarkerSize,
                                ],
                                className: '',
                            }),
                            interactive: false,
                        });
                        marker.addTo(map);
                        markerReference.current.push(marker);

                        if (feature.properties.MRKOVERRIDE) {
                            const polygonCenter = (
                                event.sourceTarget as L.Polygon
                            )
                                .getBounds()
                                .getCenter();
                            const fudgeFactor = amountCategory.size / 30;
                            const line = new L.Polyline(
                                [
                                    polygonCenter,
                                    [
                                        // stop short of the marker
                                        feature.properties.MRKOVERRIDE[0] -
                                            fudgeFactor,
                                        feature.properties.MRKOVERRIDE[1] -
                                            fudgeFactor,
                                    ],
                                ],
                                {
                                    color: '#465EB5',
                                    weight: 1,
                                    interactive: false,
                                }
                            );
                            line.addTo(map);
                            cheatLineReference.current.push(line);
                        }

                        const tooltipForState = tooltips.find(
                            tooltip =>
                                tooltip.id ===
                                `tooltip-${feature.properties.STUSPS}`
                        );
                        if (tooltipForState !== undefined) {
                            tooltipForState.dataset.stateName =
                                feature.properties.NAME;
                            layer.bindTooltip(tooltipForState, {
                                opacity: 1.0,
                                sticky: true,
                                offset: new L.Point(15, 15),
                            });
                            setTooltipsAttached(true);
                        }
                    });

                    layer.on('mouseover', () => {
                        (layer as any).setStyle(STATE_STYLE_HOVER);
                    });

                    layer.on('mouseout', () => {
                        (layer as any).setStyle(STATE_STYLE_BASE);
                    });

                    layer.on('remove', () => {
                        markerReference.current
                            .splice(0)
                            .forEach(marker => marker.removeFrom(map));
                        cheatLineReference.current
                            .splice(0)
                            .forEach(line => line.removeFrom(map));
                    });
                }}
            />
        </>
    );
}
