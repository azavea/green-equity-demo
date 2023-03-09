import { PathOptions } from 'leaflet';

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
