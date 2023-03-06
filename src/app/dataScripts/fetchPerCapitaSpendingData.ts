import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

import path from 'node:path';

import { spendingApiUrl } from '../src/constants';
import { Category } from '../src/enums';
import {
    getAgenciesForCategory,
    getDefaultSpendingByGeographyRequest,
} from '../src/util';

import { dataDir } from './nodeConstants';
import httpsRequestToCallback from './httpsRequestToCallback';

export default async function fetchPerCapitaSpendingData() {
    console.log('Fetching per-capita spending data...');

    await Promise.all([
        writeSpendingDataFile(Category.ALL),
        writeSpendingDataFile(Category.CLIMATE),
        writeSpendingDataFile(Category.CIVIL_WORKS),
        writeSpendingDataFile(Category.TRANSPORTATION),
        writeSpendingDataFile(Category.BROADBAND),
        writeSpendingDataFile(Category.OTHER),
    ]);
}

async function writeSpendingDataFile(category: Category) {
    const filename = path.join(dataDir, `${category}.spending.json`);

    if (existsSync(filename)) {
        console.warn(
            `  Skipping ${category} spending because the file already exists.`
        );
        return Promise.reject();
    }

    const requestBody = getDefaultSpendingByGeographyRequest();

    if (category) {
        requestBody.filters.agencies = getAgenciesForCategory(category);
    }

    return fs.open(filename, 'w').then(async fileHandle => {
        await httpsRequestToCallback({
            url: `${spendingApiUrl}/search/spending_by_geography/`,
            options: {
                method: 'POST',
            },
            body: JSON.stringify(requestBody),
            onDataResponse: data => fileHandle.write(JSON.stringify(data)),
        });

        fileHandle.close();
    });
}
