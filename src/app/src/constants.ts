import { PathOptions } from 'leaflet';

import { AmountCategory } from './types';

export const spendingApiUrl = 'https://api.usaspending.gov/api/v2';

export const AMOUNT_CATEGORIES: AmountCategory[] = [
    { min: 3001, color: '#81B06B' },
    { min: 2001, color: '#D330B0' },
    { min: 1001, color: '#D7671E' },
    { min: 0, color: '#465EB5' },
];

export const STATE_STYLE_BASE = Object.freeze({
    color: 'black',
    weight: 0.62,
    fill: true,
    fillColor: 'white',
});

export const STATE_STYLE_HOVER: PathOptions = Object.freeze({
    fill: true,
    fillColor: '#D0DAFF',
    color: '#465EB5',
    weight: 2,
});

export const MAP_CONTAINER_NEGATIVE_MARGIN = 290;
