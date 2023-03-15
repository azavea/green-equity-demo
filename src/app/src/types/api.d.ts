import { AgencyTier, AgencyType, GeoLayer } from '../enums';

export type State = {
    fips: string;
    code: string;
    name: string;
    type: string;
    amount: number;
    count: number;
};

export type Agency = {
    type: AgencyType;
    name: string;
} & (
    | { tier: AgencyTier.SUB; toptier_name?: string }
    | { tier: AgencyTier.TOP }
);

export type SpendingByGeographyRequest = {
    filters: {
        def_codes: DefCode[];
        time_period?: {
            start_date: string;
            end_date?: string;
        }[];
        agencies?: Agency[];
    };
    subawards?: boolean;
    scope: Scope;
    geo_layer: GeoLayer;
    geo_layer_filters?: string[];
};

export type SpendingByGeographySingleResult = {
    shape_code: string;
    display_name: string;
    aggregated_amount: number;
    population: number;
    per_capita: number;
};

export type SpendingByGeographyResponse = {
    geo_layer: GeoLayer;
    scope: Scope;
    results: SpendingByGeographySingleResult[];
};

export type StateSpending = Record<Category, SpendingByGeographySingleResult>;

export type SpendingOverTimeByStateRequest = {
    filters: {
        def_codes: DefCode[];
        time_period?: {
            start_date: string;
            end_date: string;
            date_type: string;
        }[];
        place_of_performance_locations: {
            country: string;
            state?: string;
        }[];
    };
    group: string;
};

export type MonthlySpendingOverTime = {
    aggregated_amount: number;
    time_period: {
        fiscal_year: number;
        month: number;
    };
}[];

export type MonthlySpendingOverTimeResponse = {
    group: 'month';
    results: {
        aggregated_amount: number;
        time_period: {
            fiscal_year: string;
            month: string;
        };
    }[];
    messages?: string[];
};

export type MonthlySpendingOverTimeByState = {
    shape_code: string;
    results: MonthlySpendingOverTime;
}[];

export type SpendingByGeographyAtMonth = {
    [k: string]: {
        aggregated_amount: number;
        time_period: {
            fiscal_year: number;
            month: number;
        };
    };
};
