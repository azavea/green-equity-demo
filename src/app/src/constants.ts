import { AmountCategory } from './types';

export const spendingApiUrl = 'https://api.usaspending.gov/api/v2';

export const AMOUNT_CATEGORIES: AmountCategory[] = [
    { min: 3001, color: '#263E95' },
    { min: 2001, color: '#3E5DCE' },
    { min: 1001, color: '#7E93DE' },
    { min: 0, color: '#BFC9EF' },
];

export const STATE_STYLE_BASE = Object.freeze({
    color: 'black',
    weight: 0.62,
    fill: true,
    fillColor: 'white',
    fillOpacity: 1,
});

export const MAP_CONTAINER_NEGATIVE_MARGIN = 290;

export const DC_CENTER: L.LatLngTuple = [
    1.6467356667879738, 14.997499934940763,
];

export const MONTHLY_TIME_DURATION = 250;

export const TOTAL_BIL_AMOUNT = 550000000000;
