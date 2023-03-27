import { FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
    SpendingByGeographyRequest,
    SpendingByGeographyResponse,
    MonthlySpendingOverTimeByState,
} from './types/api';
import { getCategoryForAgencies } from './util';
import { Category } from './enums';

import states from './data/states.json';
import allSpending from './data/All categories.spending.json';
import broadbandSpending from './data/Broadband.spending.json';
import civilWorksSpending from './data/Civil Works.spending.json';
import climateSpending from './data/Climate.spending.json';
import otherSpending from './data/Other.spending.json';
import transportationSpending from './data/Transportation.spending.json';
import allSpendingOverTime from './data/monthly.spending.json';

const cachedApiQuery: typeof fetchBaseQuery = _ => {
    return stringOrArgs => {
        const args = isFetchArgs(stringOrArgs)
            ? stringOrArgs
            : { url: stringOrArgs };

        switch (args.url) {
            case '/recipient/state/':
                return wrapIntoData(getStates());
            case '/search/spending_by_geography/':
                return wrapIntoData(
                    getSpendingByGeography(
                        args.body as SpendingByGeographyRequest
                    )
                );
            case '/search/spending_over_time/':
                return wrapIntoData(getSpendingOverTime());

            default:
                throw new Error(`Unknown url: ${args.url}`);
        }
    };
};

function isFetchArgs(args: string | FetchArgs): args is FetchArgs {
    return typeof args !== 'string';
}

function wrapIntoData<T>(response: T): { data: T } {
    return { data: response };
}

function getStates() {
    return states;
}

function getSpendingByGeography(
    request: SpendingByGeographyRequest
): SpendingByGeographyResponse {
    const category = request.filters.agencies
        ? getCategoryForAgencies(request.filters.agencies)
        : Category.ALL;

    const spending = getSpendingForCategory(category);

    if (request.geo_layer_filters) {
        return {
            ...spending,
            results: spending.results.filter(result =>
                request.geo_layer_filters!.includes(result.shape_code)
            ),
        };
    }

    return spending;
}

function getSpendingForCategory(
    category: Category
): SpendingByGeographyResponse {
    switch (category) {
        case Category.BROADBAND:
            return broadbandSpending as SpendingByGeographyResponse;
        case Category.CIVIL_WORKS:
            return civilWorksSpending as SpendingByGeographyResponse;
        case Category.CLIMATE:
            return climateSpending as SpendingByGeographyResponse;
        case Category.OTHER:
            return otherSpending as SpendingByGeographyResponse;
        case Category.TRANSPORTATION:
            return transportationSpending as SpendingByGeographyResponse;
        case Category.ALL:
            return allSpending as SpendingByGeographyResponse;
    }
}

function getSpendingOverTime() {
    return allSpendingOverTime as MonthlySpendingOverTimeByState;
}

export default cachedApiQuery;
