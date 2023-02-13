import { AgencyTier, AgencyType, GeoLayer } from '../enums';

export type State = {
    fips: string,
    code: string,
    name: string,
    type: string,
    amount: number,
    count: number,
};

export type Agency = {
    type: AgencyType,
    name: string,
} & (
    | { tier: AgencyTier.SUB, toptier_name?: string }
    | { tier: AgencyTier.TOP }
);

export type SpendingByGeographyRequest = {
    filters: {
        def_codes: DefCode[],
        time_period?: {
            start_date: string,
            end_date: string,
        }[],
        agencies?: Agency[],
    },
    subawards?: boolean,
    scope: Scope,
    geo_layer: GeoLayer,
    geo_layer_filters?: string[],
};

export type SpendingByGeographyResponse = {
    geo_layer: GeoLayer,
    scope: Scope,
    results: {
        shape_code: string,
        display_name: string,
        aggregated_amount: number,
        population: number,
        per_capita: number,
    }[],
};
