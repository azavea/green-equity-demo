import fs, { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import path from 'node:path';

import { spendingApiUrl } from '../src/constants';
import { getSpendingOverTimeByStateRequest } from '../src/util';

import { dataByMonthDir } from './nodeConstants';
import { STATE_CODES } from './stateCodes';
import httpsRequestToFile from './httpRequestToFile';

export default async function fetchSpendingOverTimeData() {
    console.log('Fetching spending over time data for each state...');
    if (!existsSync(dataByMonthDir)) {
        await mkdir(dataByMonthDir);
    }

    const writeFilePerState = STATE_CODES.map(state =>
        writeSpendingDataFile(state)
    );

    await Promise.all([writeFilePerState]);

    consolidateAndCleanStatesJsons();
}

async function writeSpendingDataFile(state: string) {
    const filename = path.join(dataByMonthDir, `${state}.spending.json`);

    if (existsSync(filename)) {
        console.warn(
            `  Skipping ${state} spending because the file already exists.`
        );
        return;
    }
    console.log(`Fetching ${state} spending.`);

    const requestBody = getSpendingOverTimeByStateRequest();

    requestBody.filters.place_of_performance_locations[0]!.state = state;

    return fs.open(filename, 'w').then(async fileHandle => {
        await httpsRequestToFile({
            url: `${spendingApiUrl}/search/spending_over_time/`,
            fileHandle,
            options: {
                method: 'POST',
            },
            body: JSON.stringify(requestBody),
        });

        fileHandle.close();
    });
}

function consolidateAndCleanStatesJsons() {
    // edit aggregated amounts to include previous sums
    // merge jsons into one reference with state code as key
    // new one file all.spending.by.month.json
    // delete monthlySpendingByStateDir
}
