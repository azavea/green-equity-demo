import { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { Select, Text, VStack } from '@chakra-ui/react';

import {
    getAgenciesForCategory,
    getDefaultSpendingByGeographyRequest,
} from '../util';
import { useGetSpendingByGeographyQuery, useGetStatesQuery } from '../api';
import { SpendingByGeographyRequest } from '../types/api';
import { Category, isCategory } from '../enums';

export default function DataSandbox() {
    const [stateOrTerritory, setStateOrTerritory] = useState<string>();
    const [category, setCategory] = useState<Category>();

    const spendingRequestBody = useMemo((): SpendingByGeographyRequest => {
        const defaultBody = getDefaultSpendingByGeographyRequest();

        if (stateOrTerritory) {
            defaultBody.geo_layer_filters = [stateOrTerritory];
        }

        if (category) {
            defaultBody.filters.agencies = getAgenciesForCategory(category);
        }

        return defaultBody;
    }, [category, stateOrTerritory]);

    const { data: states, isFetching: isFetchingStates } = useGetStatesQuery();
    const { data: spending, isFetching: isFetchingSpending } =
        useGetSpendingByGeographyQuery(
            isFetchingStates ? skipToken : spendingRequestBody
        );

    const CategorySelect = (
        <Select
            value={category}
            onChange={({ target: { value } }) => {
                if (isCategory(value)) {
                    setCategory(value);
                } else {
                    setCategory(undefined);
                }
            }}
            size='sm'
        >
            <option>All categories</option>
            <option value={Category.BROADBAND}>{Category.BROADBAND}</option>
            <option value={Category.CIVIL_WORKS}>{Category.CIVIL_WORKS}</option>
            <option value={Category.CLIMATE}>{Category.CLIMATE}</option>
            <option value={Category.TRANSPORTATION}>
                {Category.TRANSPORTATION}
            </option>
            <option value={Category.OTHER}>{Category.OTHER}</option>
        </Select>
    );

    const StateSelect =
        !isFetchingStates && states ? (
            <Select
                value={stateOrTerritory}
                onChange={({ target: { value } }) => setStateOrTerritory(value)}
                size='sm'
            >
                <option>All states</option>
                {states.map(state => (
                    <option key={state.fips} value={state.code}>
                        {state.name}
                    </option>
                ))}
            </Select>
        ) : (
            <Text>Loading states...</Text>
        );

    const Results =
        !isFetchingSpending || isFetchingStates ? (
            spending ? (
                <>
                    <Text>
                        {category ? `${category} spending` : 'Spending'} for{' '}
                        {stateOrTerritory ?? 'all states'}:
                    </Text>
                    <pre style={{ textAlign: 'left', width: '100%' }}>
                        {JSON.stringify(spending, null, 4)}
                    </pre>
                </>
            ) : (
                <Text>
                    Select a state to see spending details for that state.
                </Text>
            )
        ) : (
            <Text>Loading spending...</Text>
        );

    return (
        <VStack spacing={4} w='100%'>
            {CategorySelect}
            {StateSelect}
            {Results}
        </VStack>
    );
}
