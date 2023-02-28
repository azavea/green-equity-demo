import { createApi } from '@reduxjs/toolkit/query/react';
import {
    SpendingByGeographyRequest,
    SpendingByGeographyResponse,
    State,
} from './types/api';

/* Uncomment this to use the api */
/* import {  fetchBaseQuery } from '@reduxjs/toolkit/query/react'; */

/* Uncomment this to use cached data */
import fetchBaseQuery from './cachedApiQuery';

export const spendingApiUrl = 'https://api.usaspending.gov/api/v2';

export const spendingApi = createApi({
    reducerPath: 'spendingApi',
    baseQuery: fetchBaseQuery({ baseUrl: spendingApiUrl }),
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
