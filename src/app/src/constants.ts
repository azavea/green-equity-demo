import { AmountCategory } from './types';
import { PathOptions } from 'leaflet';

export const AMERICA_CENTER: [number, number] = [37.09024, -95.712891];

export const AMOUNT_CATEGORIES: AmountCategory[] = [
    {
        min: 3000,
        color: '#81B06B',
        size: 45,
    },
    {
        min: 2000,
        color: '#D330B0',
        size: 35,
    },
    {
        min: 1000,
        color: '#D7671E',
        size: 25,
    },
    {
        min: 0,
        color: '#465EB5',
        size: 15,
    },
];

export const STATE_STYLE_BASE = Object.freeze(
    { color: 'black', weight: 0.62, fill: true, fillColor: 'white' }
);

export const STATE_STYLE_HOVER: PathOptions = Object.freeze(
    {
        fill: true,
        fillColor: '#D0DAFF',
        color: '#465EB5',
        weight: 2,
    }
);
