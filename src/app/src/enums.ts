export enum DefCode {
    INFRASTRUCTURE_EMERGENCY = 'Z',
    INFRASTRUCTURE_NON_EMERGENCY = '1',
}

export enum Scope {
    PLACE_OF_PERFORMANCE = 'place_of_performance',
    RECIPIENT_LOCATION = 'recipient_location',
}

export enum GeoLayer {
    STATE = 'state',
    COUNTY = 'county',
    DISTRICT = 'district',
}

export enum Category {
    BROADBAND = 'Broadband',
    CIVIL_WORKS = 'Civil Works',
    CLIMATE = 'Climate',
    TRANSPORTATION = 'Transportation',
    OTHER = 'Other',
}

export function isCategory(value: string): value is Category {
    return [
        Category.CLIMATE.toString(),
        Category.CIVIL_WORKS.toString(),
        Category.TRANSPORTATION.toString(),
        Category.BROADBAND.toString(),
        Category.OTHER.toString(),
    ].includes(value);
}

export enum AgencyType {
    AWARDING = 'awarding',
    FUNDING = 'funding',
}

export enum AgencyTier {
    TOP = 'toptier',
    SUB = 'subtier',
}
