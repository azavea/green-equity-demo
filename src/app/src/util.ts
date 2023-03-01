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
import { Agency, SpendingByGeographyRequest } from './types/api';

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

const baseAgency = {
    type: AgencyType.AWARDING,
    tier: AgencyTier.SUB,
};

export function getAgenciesForCategory(category: Category): Agency[] {
    switch (category) {
        case Category.CLIMATE:
            return [
                { ...baseAgency, name: 'Bureau of Reclamation' },
                {
                    ...baseAgency,
                    name: 'Natural Resources Conservation Service',
                },
                { ...baseAgency, name: 'Bureau of Indian Affairs' },
                { ...baseAgency, name: 'State and Tribal Assistance Grants' }, // EP
                { ...baseAgency, name: 'Department-Wide Programs' }, // Interio
                { ...baseAgency, name: 'Hazardous Substance Superfund' },
                { ...baseAgency, name: 'Forest Service' },
                { ...baseAgency, name: 'Federal Emergency Management Agency' },
                {
                    ...baseAgency,
                    name: 'National Oceanic and Atmospheric Administration',
                },
                {
                    ...baseAgency,
                    name: 'Energy Efficiency and Renewable Energy',
                },
                { ...baseAgency, name: 'Indian Health Service' },
                { ...baseAgency, name: 'Nuclear Energy' },
                {
                    ...baseAgency,
                    name: 'United States Fish and Wildlife Service',
                },
                {
                    ...baseAgency,
                    name: 'Environmental Programs and Management',
                },
                { ...baseAgency, name: 'United States Geological Survey' },
                {
                    ...baseAgency,
                    name: 'Office of the Secretary',
                    toptier_name: 'Department of Interior',
                },
            ];
        case Category.CIVIL_WORKS:
            return [
                { ...baseAgency, name: 'Corps of Engineers - Civil Works' },
            ];
        case Category.TRANSPORTATION:
            return [
                { ...baseAgency, name: 'Federal Aviation Administration' },
                { ...baseAgency, name: 'Federal Highway Administration' },
                { ...baseAgency, name: 'Federal Transit Administration' },
                { ...baseAgency, name: 'Real Property Activities' },
                { ...baseAgency, name: 'Maritime Administration' },
                {
                    ...baseAgency,
                    name: 'Office of the Secretary',
                    toptier_name: 'Department of Transportation',
                },
                {
                    ...baseAgency,
                    name: 'Federal Motor Carrier Safety Administration',
                },
                {
                    ...baseAgency,
                    name: 'Energy Efficiency and Renewable Energy',
                }, // electric vehicles
            ];
        case Category.BROADBAND:
            return [
                { ...baseAgency, name: 'Rural Utilities Service' },
                {
                    ...baseAgency,
                    name: 'National Telecommunications and Information Administration',
                },
            ];
        case Category.OTHER:
            return [
                { ...baseAgency, name: 'Denali Commission' },
                {
                    ...baseAgency,
                    name: 'Office of the Secretary',
                    toptier_name: 'Department of Agriculture',
                },
                { ...baseAgency, name: 'Delta Regional Authority' },
            ];
    }
}

export function getCategoryForAgencies(agencies: Agency[]): Category {
    const anAgencyInEachCategory: Record<string, Category> = {
        'Bureau of Reclamation': Category.CLIMATE,
        'Corps of Engineers - Civil Works': Category.CIVIL_WORKS,
        'Federal Aviation Administration': Category.TRANSPORTATION,
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
