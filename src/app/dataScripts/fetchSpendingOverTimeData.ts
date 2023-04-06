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
    SpendingByGeographySingleResult,
} from '../src/types/api';

import { dataDir, statesJSON, perCapitaJSON } from './nodeConstants';
import { httpsRequestJson } from './httpsRequest';

export default async function fetchSpendingOverTimeData() {
    console.log('Fetching spending over time data for each state...');
    if (!existsSync(dataDir)) {
        await mkdir(dataDir);
    }

    if (!existsSync(statesJSON)) {
        console.warn('Exiting because states json does not exist');
        return;
    }
    if (!existsSync(perCapitaJSON)) {
        console.warn('Exiting because per capita json does not exist');
        return;
    }

    const states = await fs.readFile(statesJSON);
    const stateCodes: string[] = JSON.parse(states.toString()).map(
        (state: State) => state.code
    );
    const perCapitaData = await fs.readFile(perCapitaJSON);
    const perCapitaDataParsed = JSON.parse(perCapitaData.toString());
    const statePopulations: Map<string, number> = new Map(
        perCapitaDataParsed.results.map(
            (result: SpendingByGeographySingleResult) => [
                result.shape_code,
                result.population,
            ]
        )
    );

    const filename = path.join(dataDir, `monthly.spending.json`);

    if (existsSync(filename)) {
        console.warn(
            `  Skipping spending over time because the file already exists.`
        );
        return;
    }

    const consolidatedStateSpendingResults: MonthlySpendingOverTimeByState = [];

    const pushResultsToArrayPerState = stateCodes.map(state =>
        fetchSpendingData(
            state,
            (dataDump: MonthlySpendingOverTimeResponse) => {
                const cleanedResults = cleanDataDump(
                    dataDump,
                    statePopulations.get(state) ?? -1
                );
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
    dataDump: MonthlySpendingOverTimeResponse,
    population: number
): MonthlySpendingOverTime {
    // Aggregate spending value across months
    // Make String types into Number
    const perCapitaSpendingOverMonths: MonthlySpendingOverTime = [];
    dataDump.results.reduce(
        (sum, { aggregated_amount, time_period: { fiscal_year, month } }) => {
            const aggregatedPerCapita = sum + aggregated_amount / population;
            perCapitaSpendingOverMonths.push({
                per_capita: aggregatedPerCapita,
                time_period: {
                    fiscal_year: parseInt(fiscal_year),
                    month: parseInt(month),
                },
            });
            return aggregatedPerCapita;
        },
        0
    );
    return perCapitaSpendingOverMonths;
}
