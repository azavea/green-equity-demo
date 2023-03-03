import fs, { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import path from 'node:path';

import { spendingApiUrl } from '../src/constants';
import { getSpendingOverTimeByStateRequest } from '../src/util';
import {
    MonthlySpendingOverTimeByState,
    MonthlySpendingOverTimeResponse,
} from '../src/types/api';

import { dataDir } from './nodeConstants';
import { STATE_CODES } from './stateCodes';
import httpsRequestToCallback from './httpsRequestToCallback';

export default async function fetchSpendingOverTimeData() {
    console.log('Fetching spending over time data for each state...');
    if (!existsSync(dataDir)) {
        await mkdir(dataDir);
    }

    const filename = path.join(dataDir, `monthly.spending.json`);

    if (existsSync(filename)) {
        console.warn(
            `  Skipping spending over time because the file already exists.`
        );
        return;
    }

    const consolidatedStateSpendingResults: MonthlySpendingOverTimeByState = [];

    const pushResultsToArrayPerState = STATE_CODES.map(state =>
        fetchSpendingData(
            state,
            (dataDump: MonthlySpendingOverTimeResponse) => {
                const cleanedResults = cleanDataDump(dataDump);
                consolidatedStateSpendingResults.push({
                    shape_code: state,
                    results: cleanedResults,
                });
            }
        )
    );

    await Promise.all(pushResultsToArrayPerState);

    await fs.open(filename, 'w').then(async fileHandle => {
        await fileHandle.write(
            JSON.stringify(consolidatedStateSpendingResults)
        );
        fileHandle.close();
        return;
    });
}

async function fetchSpendingData(state: string, responseCallback: any) {
    console.log(`Fetching ${state} spending.`);

    const requestBody = getSpendingOverTimeByStateRequest();

    requestBody.filters.place_of_performance_locations[0]!.state = state;

    return await httpsRequestToCallback({
        url: `${spendingApiUrl}/search/spending_over_time/`,
        options: {
            method: 'POST',
        },
        body: JSON.stringify(requestBody),
        onDataResponse: responseCallback,
    });
}

function cleanDataDump(dataDump: MonthlySpendingOverTimeResponse) {
    // aggregate spending value across months
    const aggregatedOverMonths = [...dataDump.results];
    dataDump.results.reduce((sum, { aggregated_amount }, i) => {
        const aggregated = sum + aggregated_amount;
        aggregatedOverMonths[i] = {
            ...aggregatedOverMonths[i]!,
            aggregated_amount: aggregated,
        };
        return aggregated;
    }, 0);
    return aggregatedOverMonths;
}
