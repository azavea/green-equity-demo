import path from 'node:path';

import { Category } from '../src/enums';

export const dataDir = path.join(__dirname, '..', 'src', 'data');

export const statesJSON = path.join(
    __dirname,
    '..',
    'src',
    'data',
    'states.json'
);

export const perCapitaJSON = path.join(
    __dirname,
    '..',
    'src',
    'data',
    `${Category.ALL}.spending.json`
);
