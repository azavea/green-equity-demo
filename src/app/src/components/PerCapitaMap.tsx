import { useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Center, CircularProgress } from '@chakra-ui/react';
import L from 'leaflet';

import UsaMapContainer from './UsaMapContainer';
import StatesLayer from './StatesLayer';
import PersonIcon from './PersonIcon';

import { useGetSpendingByGeographyQuery } from '../api';
import { getDefaultSpendingByGeographyRequest } from '../util';
import { SpendingByGeographyResponse } from '../types/api';

export default function PerCapitaMap() {
    const { data, isFetching } = useGetSpendingByGeographyQuery(
        getDefaultSpendingByGeographyRequest()
    );

    return (
        <UsaMapContainer>
            {data && !isFetching ? (
                <StatesAndMarkersLayer spending={data.results} />
            ) : (
                <Center p={4}>
                    <CircularProgress isIndeterminate />
                </Center>
            )}
        </UsaMapContainer>
    );
}

function StatesAndMarkersLayer({
    spending,
}: {
    spending: SpendingByGeographyResponse['results'];
}) {
    const map = useMap();
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

                    new L.Marker(
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
                    ).addTo(map);
                });
            }}
        />
    );
}

function getAmountCategory(amount: number): AmountCategory {
    const category = AMOUNT_CATEGORIES.find(
        amountCategory => amount > amountCategory.min
    );

    if (!category) {
        throw Error(`Could not find amount category for amount: ${amount}`);
    }

    return category;
}

type AmountCategory = {
    min: number;
    color: string;
    size: number;
};

const AMOUNT_CATEGORIES: AmountCategory[] = [
    {
        min: 3000,
        color: '#81B06B',
        size: 45,
    },
    {
        min: 2000,
        color: '#D330B0',
        size: 35,
    },
    {
        min: 1000,
        color: '#D7671E',
        size: 25,
    },
    {
        min: 0,
        color: '#465EB5',
        size: 15,
    },
];
