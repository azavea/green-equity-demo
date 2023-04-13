import { AmountCategory } from './types';
import theme from './theme';

export const spendingApiUrl = 'https://api.usaspending.gov/api/v2';

export const AMOUNT_CATEGORIES: AmountCategory[] = [
    { min: 3001, color: theme.colors.green[900] },
    { min: 2001, color: theme.colors.green[600] },
    { min: 1001, color: theme.colors.green[300] },
    { min: 0, color: theme.colors.green[100] },
];

export const QUARTILE_CATEGORIES: AmountCategory[] = [
    { min: 0.75, color: theme.colors.green[900] },
    { min: 0.5, color: theme.colors.green[600] },
    { min: 0.25, color: theme.colors.green[300] },
    { min: 0, color: theme.colors.green[100] },
];

export const STATE_STYLE_BASE = Object.freeze({
    color: 'white',
    weight: 0.62,
    fill: true,
    fillColor: 'lightgray',
    fillOpacity: 1,
});

export const MAP_CONTAINER_NEGATIVE_MARGIN = 290;

export const DC_CENTER: L.LatLngTuple = [
    1.6467356667879738, 14.997499934940763,
];

export const MONTHLY_TIME_DURATION = 250;

export const TOTAL_BIL_AMOUNT = 550000000000;
