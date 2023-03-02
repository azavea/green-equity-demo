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
import { SpendingByGeographyResponse } from '../types/api';
import { STATE_STYLE_BASE, STATE_STYLE_HOVER, MARKER_OVERRIDES } from '../constants';
import { Category } from '../enums';



export default function PerCapitaMap() {
    const [spendingCategory, setSpendingCategory] = useState<Category>();

    const spendingRequest = useMemo(() => {
        const baseRequest = getDefaultSpendingByGeographyRequest();

        if (spendingCategory) {
            baseRequest.filters.agencies =
                getAgenciesForCategory(spendingCategory);
        }

        return baseRequest;
    }, [spendingCategory]);

    const { data, isFetching } =
        useGetSpendingByGeographyQuery(spendingRequest);
    const { data: states, isFetching: isFetchingStates } = useGetStatesQuery();

    const requestForCategory = (category: Category) => {
        const baseRequest = getDefaultSpendingByGeographyRequest();
        baseRequest.filters.agencies =
            getAgenciesForCategory(category);
        return baseRequest;
    };

    const { data: broadbandData, isFetching: isFetchingBroadband } = 
        useGetSpendingByGeographyQuery(
            requestForCategory(Category.BROADBAND)
        );

    const { data: climateData, isFetching: isFetchingClimate } = 
        useGetSpendingByGeographyQuery(
            requestForCategory(Category.CLIMATE)
        );

    const { data: transportationData, isFetching: isFetchingTransportation } = 
        useGetSpendingByGeographyQuery(
            requestForCategory(Category.TRANSPORTATION)
        );

    const { data: otherData, isFetching: isFetchingOther } = 
        useGetSpendingByGeographyQuery(
            requestForCategory(Category.OTHER)
        );

    const spendingByCategoryByState = new Map<String, Map<Category, number>>();
    const anyIsFetching = (
        isFetching ||
        isFetchingStates ||
        isFetchingBroadband ||
        isFetchingClimate ||
        isFetchingTransportation ||
        isFetchingOther
    );

    if (!anyIsFetching) {
        // Reshape the data: organize by state
        states!.forEach(state => {
            spendingByCategoryByState.set(state.code, new Map<Category, number>());
            Object.values(Category).filter(cat => cat !== Category.CIVIL_WORKS).forEach(
                cat => spendingByCategoryByState.get(state.code)!.set(cat as Category, 0));
        });
        broadbandData!.results.forEach(stateData => {
            spendingByCategoryByState.get(stateData.shape_code)?.set(Category.BROADBAND, stateData.aggregated_amount);
        });
        climateData!.results.forEach(stateData => {
            spendingByCategoryByState.get(stateData.shape_code)?.set(Category.CLIMATE, stateData.aggregated_amount);
        });
        transportationData!.results.forEach(stateData => {
            spendingByCategoryByState.get(stateData.shape_code)?.set(Category.TRANSPORTATION, stateData.aggregated_amount);
        });
        otherData!.results.forEach(stateData => {
            spendingByCategoryByState.get(stateData.shape_code)?.set(Category.OTHER, stateData.aggregated_amount);
        });
    }

    return (
        <VStack width='100%'>
            <SpendingCategorySelector
                value={spendingCategory}
                onChange={setSpendingCategory}
            />
            <UsaMapContainer>
                {data && !anyIsFetching ? (
                    <StatesAndMarkersLayer
                        spending={data.results}
                        spendingByCategoryByState={spendingByCategoryByState}
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
    spending,
    spendingByCategoryByState,
}: {
    spending: SpendingByGeographyResponse['results'];
    spendingByCategoryByState: Map<String, Map<Category, number>>,
}) {
    const map = useMap();
    const markerReference = useRef<L.Marker[]>([]);
    const cheatLineReference = useRef<L.Polyline[]>([]);

    const spendingByState = useMemo(
        () =>
            Object.fromEntries(
                spending.map(stateSpending => [
                    stateSpending.shape_code,
                    stateSpending,
                ])
            ),
        [spending]
    );

    const tooltips = Object.keys(spendingByState).map(stateCode => {
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
        const largestPolygon = asPolygons.reduce(
            (prev, current) => (
                L.GeometryUtil.geodesicArea(prev.getLatLngs()[0] as LatLngLiteral[]) >
                L.GeometryUtil.geodesicArea(current.getLatLngs()[0] as LatLngLiteral[]))
                ? prev : current
            );
        const poleOfInaccessibility = polylabel(largestPolygon.toGeoJSON().geometry.coordinates as number[][][]) as LatLngTuple;
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
            {tooltipsAttached && tooltips.map(tooltip => {
                const stateSpending = spendingByState[tooltip.dataset?.stateCode!];
                if (stateSpending === undefined) { return null; }
                const spendingByCategory = spendingByCategoryByState.get(stateSpending.shape_code);
                if (spendingByCategory === undefined) { return null; }

                return createPortal(
                    <SpendingTooltip
                        state={stateSpending.display_name ?? ''}
                        stateCode={stateSpending.shape_code ?? ''}
                        population={stateSpending.population ?? 0}
                        dollarsPerCapita={stateSpending.per_capita ?? 0}
                        funding={stateSpending.aggregated_amount ?? 0}
                        spendingByCategory={spendingByCategory} />
                , tooltip);
                }
            )}
            <StatesLayer
                onEachFeature={(feature, layer) => {
                    layer.on('add', event => {
                        const stateSpending = spendingByState[feature.properties.STUSPS];
                        const perCapitaSpending = stateSpending?.per_capita;

                        if (!perCapitaSpending) {
                            console.warn(
                                `No spending data for state: ${feature.properties.STUSPS}`
                            );
                            return;
                        }

                        const amountCategory = getAmountCategory(perCapitaSpending);

                        // pole of inaccessibility: point (in largest polygon) furthest from edges
                        // some states have overrides for marker locations in the Atlantic
                        const markerLocation = (
                            feature.properties.MRKOVERRIDE ??
                            getMarkerOverride(feature) ??
                            feature.properties.INACSPOLE ??
                            findPoleofInaccessibility(feature)
                        );

                        const marker = new L.Marker(
                            markerLocation,
                            {
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
                            }
                        );
                        marker.addTo(map);
                        markerReference.current.push(marker);

                        if (feature.properties.MRKOVERRIDE) {
                            const polygonCenter = (event.sourceTarget as L.Polygon).getBounds().getCenter();
                            const fudgeFactor = amountCategory.size / 30;
                            const line = new L.Polyline(
                                [polygonCenter, [
                                        // stop short of the marker
                                        feature.properties.MRKOVERRIDE[0] - fudgeFactor,
                                        feature.properties.MRKOVERRIDE[1] - fudgeFactor,
                                    ]
                                ],
                                { color: '#465EB5', weight: 1, interactive: false }
                            );
                            line.addTo(map);
                            cheatLineReference.current.push(line);
                        }

                        const tooltipForState = tooltips.find(
                            tooltip => tooltip.id === `tooltip-${feature.properties.STUSPS}`);
                        if (tooltipForState !== undefined) {
                            tooltipForState.dataset.stateName = feature.properties.NAME;
                            layer.bindTooltip(
                                tooltipForState,
                                { opacity: 1.0, sticky: true, offset: new L.Point(15, 15) },
                            );
                            setTooltipsAttached(true);
                        }
                    });

                    layer.on('mouseover', () => {
                        (layer as any).setStyle(STATE_STYLE_HOVER)
                    });

                    layer.on('mouseout', () => {
                        (layer as any).setStyle(STATE_STYLE_BASE)
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
