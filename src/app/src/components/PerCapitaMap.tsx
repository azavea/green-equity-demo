import { useMemo, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { Center, CircularProgress, VStack } from '@chakra-ui/react';
import L, { LatLngLiteral, LatLngTuple } from 'leaflet';
import 'leaflet-draw';
import polylabel from 'polylabel';

import UsaMapContainer from './UsaMapContainer';
import StatesLayer from './StatesLayer';
import PersonIcon from './PersonIcon';
import PerCapitaMapLegend from './PerCapitaMapLegend';
import SpendingTooltip from './SpendingTooltip';
import SpendingCategorySelector from './SpendingCategorySelector';
import { StateFeature } from './states.geojson';

import { useGetSpendingByGeographyQuery, useGetStatesQuery } from '../api';
import {
    getAgenciesForCategory,
    getAmountCategory,
    getDefaultSpendingByGeographyRequest,
} from '../util';
import { SpendingByGeographySingleResult } from '../types/api';
import {
    STATE_STYLE_BASE,
    STATE_STYLE_HOVER,
    MARKER_OVERRIDES,
} from '../constants';
import { Category } from '../enums';

export default function PerCapitaMap() {
    const [spendingCategory, setSpendingCategory] = useState<Category>(
        Category.ALL
    );

    const { data: states, isFetching: isFetchingStates } = useGetStatesQuery();

    const { data, isFetching } = useGetSpendingByGeographyQuery(
        getDefaultSpendingByGeographyRequest()
    );

    const requestForCategory = (category: Category) => {
        const baseRequest = getDefaultSpendingByGeographyRequest();
        baseRequest.filters.agencies = getAgenciesForCategory(category);
        return baseRequest;
    };

    const { data: broadbandData, isFetching: isFetchingBroadband } =
        useGetSpendingByGeographyQuery(requestForCategory(Category.BROADBAND));

    const { data: civilWorksData, isFetching: isFetchingCivilWorks } =
        useGetSpendingByGeographyQuery(
            requestForCategory(Category.CIVIL_WORKS)
        );

    const { data: climateData, isFetching: isFetchingClimate } =
        useGetSpendingByGeographyQuery(requestForCategory(Category.CLIMATE));

    const { data: transportationData, isFetching: isFetchingTransportation } =
        useGetSpendingByGeographyQuery(
            requestForCategory(Category.TRANSPORTATION)
        );

    const { data: otherData, isFetching: isFetchingOther } =
        useGetSpendingByGeographyQuery(requestForCategory(Category.OTHER));

    const spendingByCategoryByState = new Map<
        String,
        Map<Category, SpendingByGeographySingleResult | undefined>
    >();
    const anyIsFetching =
        isFetching ||
        isFetchingStates ||
        isFetchingBroadband ||
        isFetchingCivilWorks ||
        isFetchingClimate ||
        isFetchingTransportation ||
        isFetchingOther;

    if (!anyIsFetching) {
        // Reshape the data: organize by state
        states!.forEach(state => {
            spendingByCategoryByState.set(
                state.code,
                new Map<Category, SpendingByGeographySingleResult>()
            );
            Object.values(Category).forEach(cat =>
                spendingByCategoryByState
                    .get(state.code)!
                    .set(cat as Category, undefined)
            );
        });
        data!.results.forEach(stateData => {
            spendingByCategoryByState
                .get(stateData.shape_code)
                ?.set(Category.ALL, stateData);
        });
        broadbandData!.results.forEach(stateData => {
            spendingByCategoryByState
                .get(stateData.shape_code)
                ?.set(Category.BROADBAND, stateData);
        });
        civilWorksData!.results.forEach(stateData => {
            spendingByCategoryByState
                .get(stateData.shape_code)
                ?.set(Category.CIVIL_WORKS, stateData);
        });
        climateData!.results.forEach(stateData => {
            spendingByCategoryByState
                .get(stateData.shape_code)
                ?.set(Category.CLIMATE, stateData);
        });
        transportationData!.results.forEach(stateData => {
            spendingByCategoryByState
                .get(stateData.shape_code)
                ?.set(Category.TRANSPORTATION, stateData);
        });
        otherData!.results.forEach(stateData => {
            spendingByCategoryByState
                .get(stateData.shape_code)
                ?.set(Category.OTHER, stateData);
        });
    }

    return (
        <VStack width='100%'>
            <SpendingCategorySelector
                value={spendingCategory}
                onChange={setSpendingCategory}
            />
            <UsaMapContainer negativeMargin>
                {data && spendingByCategoryByState && !anyIsFetching ? (
                    <StatesAndMarkersLayer
                        allSpending={data.results}
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
    allSpending,
    spendingByCategoryByState,
    selectedCategory,
}: {
    allSpending: SpendingByGeographySingleResult[];
    spendingByCategoryByState: Map<
        String,
        Map<Category, SpendingByGeographySingleResult | undefined>
    >;
    selectedCategory: Category;
}) {
    const map = useMap();
    const markerReference = useRef<L.Marker[]>([]);
    const cheatLineReference = useRef<L.Polyline[]>([]);

    const allSpendingByState = useMemo(
        () =>
            Object.fromEntries(
                allSpending.map(stateSpending => [
                    stateSpending.shape_code,
                    stateSpending,
                ])
            ),
        [allSpending]
    );

    const tooltips = Object.keys(allSpendingByState).map(stateCode => {
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
                    const allStateSpending =
                        allSpendingByState[tooltip.dataset?.stateCode!];
                    if (allStateSpending === undefined) {
                        return null;
                    }
                    const spendingByCategory = spendingByCategoryByState.get(
                        allStateSpending.shape_code
                    );
                    if (spendingByCategory === undefined) {
                        return null;
                    }

                    return createPortal(
                        <SpendingTooltip
                            state={allStateSpending.display_name ?? ''}
                            stateCode={allStateSpending.shape_code ?? ''}
                            population={allStateSpending.population ?? 0}
                            allSpending={
                                allStateSpending.aggregated_amount ?? 0
                            }
                            spendingByCategory={spendingByCategory}
                            selectedCategory={selectedCategory}
                        />,
                        tooltip
                    );
                })}
            <StatesLayer
                onEachFeature={(feature, layer) => {
                    layer.on('add', event => {
                        const stateSpending = spendingByCategoryByState
                            .get(feature.properties.STUSPS)
                            ?.get(selectedCategory);
                        const perCapitaSpending = stateSpending?.per_capita;

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

                        const marker = new L.Marker(markerLocation, {
                            icon: new L.DivIcon({
                                html: renderToStaticMarkup(
                                    <PersonIcon color={amountCategory.color} />
                                ),
                                iconSize: [
                                    amountCategory.size,
                                    amountCategory.size,
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
