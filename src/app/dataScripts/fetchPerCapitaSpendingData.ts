import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

import path from 'node:path';

import { spendingApiUrl } from '../src/api';
import { Category } from '../src/enums';
import {
    getAgenciesForCategory,
    getDefaultSpendingByGeographyRequest,
} from '../src/util';

import { dataDir } from './constants';
import httpsRequestToFile from './httpRequestToFile';

export default async function fetchPerCapitaSpendingData() {
    console.log('Fetching per-capita spending data...');

    await Promise.all([
        writeSpendingDataFile(),
        writeSpendingDataFile(Category.CLIMATE),
        writeSpendingDataFile(Category.CIVIL_WORKS),
        writeSpendingDataFile(Category.TRANSPORTATION),
        writeSpendingDataFile(Category.BROADBAND),
        writeSpendingDataFile(Category.OTHER),
    ]);
}

async function writeSpendingDataFile(category?: Category) {
    const filename = path.join(dataDir, `${category ?? 'all'}.spending.json`);

    if (existsSync(filename)) {
        console.warn(
            `  Skipping ${
                category ?? 'All'
            } spending because the file already exists.`
        );
        return;
    }

    const requestBody = getDefaultSpendingByGeographyRequest();

    if (category) {
        requestBody.filters.agencies = getAgenciesForCategory(category);
    }

    return fs.open(filename, 'w').then(async fileHandle => {
        await httpsRequestToFile({
            url: `${spendingApiUrl}/search/spending_by_geography/`,
            fileHandle,
            options: {
                method: 'POST',
            },
            body: JSON.stringify(requestBody),
        });

        fileHandle.close();
    });
}
