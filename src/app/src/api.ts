import { createApi } from '@reduxjs/toolkit/query/react';
import {
    MonthlySpendingOverTimeByState,
    SpendingByGeographyRequest,
    SpendingByGeographyResponse,
    State,
} from './types/api';
import { spendingApiUrl } from './constants';

/* Uncomment this to use the api */
/* import {  fetchBaseQuery } from '@reduxjs/toolkit/query/react'; */

/* Uncomment this to use cached data */
import fetchBaseQuery from './cachedApiQuery';

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
        getSpendingOverTime: builder.query<
            MonthlySpendingOverTimeByState,
            void
        >({
            query: getSpendingOverTimeByStateRequest => ({
                url: '/search/spending_over_time/',
                method: 'POST',
                body: getSpendingOverTimeByStateRequest,
            }),
        }),
    }),
});

export const {
    useGetStatesQuery,
    useGetSpendingByGeographyQuery,
    useGetSpendingOverTimeQuery,
} = spendingApi;
