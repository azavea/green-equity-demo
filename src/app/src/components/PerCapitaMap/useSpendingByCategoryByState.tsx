import { useGetStatesQuery, useGetSpendingByGeographyQuery } from '../../api';
import { Category, isCategory } from '../../enums';
import { SpendingByGeographySingleResult } from '../../types/api';
import {
    getDefaultSpendingByGeographyRequest,
    getAgenciesForCategory,
} from '../../util';

export default function useSpendingByCategoryByState() {
    const { data: states } = useGetStatesQuery();

    const spendingDataRequests = {
        [Category.ALL]: useCategoryData(Category.ALL),
        [Category.BROADBAND]: useCategoryData(Category.BROADBAND),
        [Category.CIVIL_WORKS]: useCategoryData(Category.CIVIL_WORKS),
        [Category.CLIMATE]: useCategoryData(Category.CLIMATE),
        [Category.TRANSPORTATION]: useCategoryData(Category.TRANSPORTATION),
        [Category.OTHER]: useCategoryData(Category.OTHER),
    };

    if (!states) {
        return;
    }

    if (
        Object.values(spendingDataRequests).some(
            response => response === undefined
        )
    ) {
        return;
    }

    return Object.entries(spendingDataRequests).reduce(
        (spendingByCategoryByState, [category, spendingByCategory]) => {
            if (!isCategory(category)) {
                throw new Error('Unreachable code');
            }

            if (spendingByCategory === undefined) {
                throw new Error('Unreachable code');
            }

            for (const stateCategorySpending of spendingByCategory) {
                spendingByCategoryByState[stateCategorySpending.shape_code]![
                    category
                ] = stateCategorySpending;
            }

            return spendingByCategoryByState;
        },
        Object.fromEntries(
            states.map(state => [
                state.code,
                {} as Record<Category, SpendingByGeographySingleResult>,
            ])
        )
    );
}

function useCategoryData(category: Category) {
    const request = getDefaultSpendingByGeographyRequest();
    request.filters.agencies = getAgenciesForCategory(category);

    const { data, isFetching } = useGetSpendingByGeographyQuery(request);

    if (!isFetching && data) {
        return data.results;
    }
}
