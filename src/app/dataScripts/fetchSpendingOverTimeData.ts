import fs, { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import path from 'node:path';

import { spendingApiUrl } from '../src/constants';
import { getSpendingOverTimeByStateRequest } from '../src/util';
import {
    State,
    MonthlySpendingOverTime,
    MonthlySpendingOverTimeByState,
    MonthlySpendingOverTimeResponse,
} from '../src/types/api';

import { dataDir, statesJSON } from './nodeConstants';
import { httpsRequestJson } from './httpsRequest';

export default async function fetchSpendingOverTimeData() {
    console.log('Fetching spending over time data for each state...');
    if (!existsSync(dataDir)) {
        await mkdir(dataDir);
    }

    let STATE_CODES: string[];
    if (!existsSync(statesJSON)) {
        console.warn('Exiting because states json does not exist');
        return;
    } else {
        const states = await fs.readFile(statesJSON);
        STATE_CODES = JSON.parse(states.toString()).map(
            (state: State) => state.code
        );
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

async function fetchSpendingData(
    state: string,
    responseCallback: (data: any) => void
) {
    console.log(`Fetching ${state} spending.`);

    const requestBody = getSpendingOverTimeByStateRequest();

    requestBody.filters.place_of_performance_locations[0]!.state = state;

    return await httpsRequestJson({
        url: `${spendingApiUrl}/search/spending_over_time/`,
        options: {
            method: 'POST',
        },
        body: JSON.stringify(requestBody),
    }).then(responseCallback);
}

function cleanDataDump(
    dataDump: MonthlySpendingOverTimeResponse
): MonthlySpendingOverTime {
    // Aggregate spending value across months
    // Make String types into Number
    const aggregatedOverMonths: MonthlySpendingOverTime = [];
    dataDump.results.reduce(
        (
            sum,
            { aggregated_amount, time_period: { fiscal_year, month } },
            i
        ) => {
            const aggregated = sum + aggregated_amount;
            aggregatedOverMonths.push({
                aggregated_amount: aggregated,
                time_period: {
                    fiscal_year: parseInt(fiscal_year),
                    month: parseInt(month),
                },
            });
            return aggregated;
        },
        0
    );
    return aggregatedOverMonths;
}
