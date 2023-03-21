import { AMOUNT_CATEGORIES } from './constants';
import {
    AgencyTier,
    AgencyType,
    Category,
    DefCode,
    GeoLayer,
    Scope,
} from './enums';
import { AmountCategory } from './types';
import {
    Agency,
    MonthlySpendingOverTimeByState,
    SpendingByGeographyAtMonth,
    SpendingByGeographyRequest,
    SpendingOverTimeByStateRequest,
} from './types/api';

export function getDefaultSpendingByGeographyRequest(): SpendingByGeographyRequest {
    return {
        filters: {
            def_codes: [
                DefCode.INFRASTRUCTURE_EMERGENCY,
                DefCode.INFRASTRUCTURE_NON_EMERGENCY,
            ],
            time_period: [
                {
                    start_date: '2008-01-01',
                    end_date: '2024-01-01',
                },
            ],
        },
        geo_layer: GeoLayer.STATE,
        scope: Scope.PLACE_OF_PERFORMANCE,
    };
}

export function getSpendingOverTimeByStateRequest(): SpendingOverTimeByStateRequest {
    return {
        group: 'month',
        filters: {
            def_codes: [
                DefCode.INFRASTRUCTURE_EMERGENCY,
                DefCode.INFRASTRUCTURE_NON_EMERGENCY,
            ],
            time_period: [
                {
                    start_date: '2008-01-01',
                    end_date: '2024-01-01',
                    date_type: 'action_date',
                },
            ],
            place_of_performance_locations: [
                {
                    country: 'USA',
                },
            ],
        },
    };
}

const baseSubAgency = {
    type: AgencyType.AWARDING,
    tier: AgencyTier.SUB,
};

const baseTopAgency = {
    type: AgencyType.AWARDING,
    tier: AgencyTier.TOP,
};

// These agencies cross-cut among our categories. So we filter
// on their subagencies instead.
const USDA = 'Department of Agriculture';
const COMMERCE = 'Department of Commerce';
const DHS = 'Department of Homeland Security';

export function getAgenciesForCategory(
    category: Category
): Agency[] | undefined {
    switch (category) {
        case Category.CLIMATE:
            return [
                { ...baseTopAgency, name: 'Department of Energy' },
                { ...baseTopAgency, name: 'Department of the Interior' },
                {
                    ...baseTopAgency,
                    name: 'Department of Health and Human Services',
                },
                { ...baseTopAgency, name: 'Environmental Protection Agency' },
                {
                    ...baseSubAgency,
                    name: 'Forest Service',
                    toptier_name: USDA,
                },
                {
                    ...baseSubAgency,
                    name: 'Natural Resources Conservation Service',
                    toptier_name: USDA,
                },
                {
                    ...baseSubAgency,
                    name: 'Under Secretary for Farm and Foreign Agricultural Services',
                    toptier_name: USDA,
                },
                {
                    ...baseSubAgency,
                    name: 'Federal Emergency Management Agency',
                    toptier_name: DHS,
                },
                {
                    ...baseSubAgency,
                    name: 'National Oceanic and Atmospheric Administration',
                    toptier_name: COMMERCE,
                },
            ];
        case Category.CIVIL_WORKS:
            return [
                { ...baseTopAgency, name: 'Department of Defense' },
                { ...baseTopAgency, name: 'General Services Administration' },
                { ...baseTopAgency, name: 'Corps of Engineers - Civil Works' },
                {
                    ...baseSubAgency,
                    name: 'U.S. Customs and Border Protection',
                    toptier_name: DHS,
                },
            ];
        case Category.TRANSPORTATION:
            return [{ ...baseTopAgency, name: 'Department of Transportation' }];
        case Category.BROADBAND:
            return [
                {
                    ...baseSubAgency,
                    name: 'Rural Utilities Service',
                    toptier_name: USDA,
                },
                {
                    ...baseSubAgency,
                    name: 'National Institute of Standards and Technology',
                    toptier_name: COMMERCE,
                },
                {
                    ...baseSubAgency,
                    name: 'National Telecommunications and Information Administration',
                    toptier_name: COMMERCE,
                },
            ];
        case Category.OTHER:
            return [
                { ...baseTopAgency, name: 'Department of Education' }, // none yet
                {
                    ...baseTopAgency,
                    name: 'Department of Housing and Urban Development',
                }, // none yet
                { ...baseTopAgency, name: 'Department of Justice' }, // none yet
                { ...baseTopAgency, name: 'Department of Labor' }, // none yet
                { ...baseTopAgency, name: 'Department of State' }, // none yet
                { ...baseTopAgency, name: 'Department of the Treasury' },
                { ...baseTopAgency, name: 'Department of Veterans Affairs' }, // none yet
                { ...baseTopAgency, name: 'Executive Office of the President' },
                {
                    ...baseSubAgency,
                    name: 'Office of the Secretary',
                    toptier_name: USDA,
                },
                { ...baseTopAgency, name: 'Delta Regional Authority' },
                {
                    ...baseSubAgency,
                    name: 'Office of Procurement Services',
                    toptier_name: DHS,
                },
                { ...baseTopAgency, name: 'Denali Commission' },
            ];
    }
}

export function getCategoryForAgencies(agencies: Agency[]): Category {
    const anAgencyInEachCategory: Record<string, Category> = {
        'Department of Energy': Category.CLIMATE,
        'Department of Defense': Category.CIVIL_WORKS,
        'Department of Transportation': Category.TRANSPORTATION,
        'Rural Utilities Service': Category.BROADBAND,
        'Denali Commission': Category.OTHER,
    };

    for (const [agencyName, category] of Object.entries(
        anAgencyInEachCategory
    )) {
        if (agencies.some(agency => agency.name === agencyName)) {
            return category;
        }
    }

    throw new Error(`Category not found for this agency list ${agencies}`);
}

export function getAmountCategory(amount: number): AmountCategory {
    const category =
        AMOUNT_CATEGORIES.find(
            amountCategory => amount >= amountCategory.min
        ) ?? AMOUNT_CATEGORIES[AMOUNT_CATEGORIES.length - 1];

    if (!category) {
        throw Error(`Could not find amount category for amount: ${amount}`);
    }

    return category;
}

export function abbreviateNumber(amount: number): string {
    if (1e12 <= amount && amount < 1e15) {
        return Math.round(amount / 1e12).toLocaleString() + 'T';
    }
    if (1e9 <= amount && amount < 1e12) {
        return Math.round(amount / 1e9).toLocaleString() + 'B';
    }
    if (1e6 <= amount && amount < 1e9) {
        return Math.round(amount / 1e6).toLocaleString() + 'M';
    }
    if (1e3 <= amount && amount < 1e6) {
        return Math.round(amount / 1e3).toLocaleString() + 'K';
    }
    return Math.round(amount).toLocaleString();
}

const START_YEAR = 2021;
const END_DATE = new Date();
export const PROGRESS_FINAL_STEP = (() => {
    const final_month_step = END_DATE.getMonth();
    const final_year_step = END_DATE.getFullYear();
    return 12 * (final_year_step - START_YEAR) + final_month_step;
})();

export function getSpendingByStateAtTime(
    timeValue: number,
    spending: MonthlySpendingOverTimeByState
): SpendingByGeographyAtMonth {
    const isDecember = timeValue % 12 === 0;
    const fiscalYearSelection =
        2021 + Math.floor(isDecember ? timeValue / 13 : timeValue / 12);
    const monthSelection = !!timeValue && isDecember ? 12 : timeValue % 12;
    const spendingAtTimeValue = spending.map(stateSpending => {
        const resultAtTimeValue = stateSpending.results.find(entry => {
            return (
                entry.time_period.fiscal_year === fiscalYearSelection &&
                entry.time_period.month === monthSelection
            );
        })!;
        return { ...stateSpending, results: resultAtTimeValue };
    });
    return Object.fromEntries(
        spendingAtTimeValue.map(stateSpending => [
            stateSpending.shape_code,
            stateSpending.results,
        ])
    );
}
