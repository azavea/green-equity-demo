import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    SpendingByGeographyRequest,
    SpendingByGeographyResponse,
    State,
} from './types/api';

export const spendingApi = createApi({
    reducerPath: 'spendingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://api.usaspending.gov/api/v2',
    }),
    endpoints: builder => ({
        getStates: builder.query<State[], void>({
            query: () => '/recipient/state/',
        }),
        getSpendingByGeography: builder.query<
            SpendingByGeographyResponse,
            SpendingByGeographyRequest
        >({
            query: spendingByGeographyRequest => ({
                url: '/search/spending_by_geography/',
                method: 'POST',
                body: spendingByGeographyRequest,
            }),
        }),
    }),
});

export const { useGetStatesQuery, useGetSpendingByGeographyQuery } =
    spendingApi;
