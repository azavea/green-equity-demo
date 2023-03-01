import path from 'node:path';

export const dataDir = path.join(__dirname, '..', 'src', 'data');

export const dataByMonthDir = path.join(
    __dirname,
    '..',
    'src',
    'data',
    'monthlySpendingByState'
);
