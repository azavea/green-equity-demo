import { useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Center, CircularProgress } from '@chakra-ui/react';
import L from 'leaflet';

import UsaMapContainer from './UsaMapContainer';
import StatesLayer from './StatesLayer';
import PersonIcon from './PersonIcon';
import PerCapitaMapLegend from './PerCapitaMapLegend';

import { useGetSpendingByGeographyQuery } from '../api';
import {
    getAmountCategory,
    getDefaultSpendingByGeographyRequest,
} from '../util';
import { SpendingByGeographyResponse } from '../types/api';

export default function PerCapitaMap() {
    const { data, isFetching } = useGetSpendingByGeographyQuery(
        getDefaultSpendingByGeographyRequest()
    );

    return (
        <>
            <UsaMapContainer>
                {data && !isFetching ? (
                    <StatesAndMarkersLayer spending={data.results} />
                ) : (
                    <Center p={4}>
                        <CircularProgress isIndeterminate />
                    </Center>
                )}
            </UsaMapContainer>
            <PerCapitaMapLegend />
        </>
    );
}

function StatesAndMarkersLayer({
    spending,
}: {
    spending: SpendingByGeographyResponse['results'];
}) {
    const map = useMap();
    const markerReference = useRef<L.Marker[]>([]);

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

    return (
        <StatesLayer
            onEachFeature={(feature, layer) => {
                layer.on('add', event => {
                    const perCapitaSpending =
                        spendingByState[feature.properties.STUSPS]?.per_capita;

                    if (!perCapitaSpending) {
                        console.warn(
                            `No spending data for state: ${feature.properties.STUSPS}`
                        );
                        return;
                    }

                    const amountCategory = getAmountCategory(perCapitaSpending);

                    const marker = new L.Marker(
                        (event.sourceTarget as L.Polygon)
                            .getBounds()
                            .getCenter(),
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
                        }
                    );
                    marker.addTo(map);
                    markerReference.current.push(marker);
                });

                layer.on('remove', () => {
                    markerReference.current
                        .splice(0)
                        .forEach(marker => marker.removeFrom(map));
                });
            }}
        />
    );
}
