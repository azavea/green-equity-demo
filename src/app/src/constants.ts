import { LatLngTuple, PathOptions } from 'leaflet';

import { AmountCategory } from './types';

export const spendingApiUrl = 'https://api.usaspending.gov/api/v2';

export const AMOUNT_CATEGORIES: AmountCategory[] = [
    {
        min: 3001,
        color: '#81B06B',
        size: 45,
    },
    {
        min: 2001,
        color: '#D330B0',
        size: 35,
    },
    {
        min: 1001,
        color: '#D7671E',
        size: 25,
    },
    {
        min: 0,
        color: '#465EB5',
        size: 15,
    },
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

export const MAP_CONTAINER_NEGATIVE_MARGIN = 250;

export const MARKER_OVERRIDES: { [stateCode: string]: LatLngTuple } =
    Object.freeze({
        MA: [7.25, 20.5],
        RI: [5.5, 21],
        CT: [4.5, 20],
        NJ: [3.6, 18.6],
        DE: [2.5, 17.75],
        DC: [1.5, 21],
    });
