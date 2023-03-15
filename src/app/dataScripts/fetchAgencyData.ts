import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { spendingApiUrl } from '../src/constants';

import { dataDir } from './nodeConstants';
import { httpsRequestJson } from './httpsRequest';

type TopTierAgency = {
    name: string;
    toptier_agency_id: number;
    toptier_code: string;
};

type TopTierAgencies = {
    agencies: {
        cfo_agencies: TopTierAgency[];
        other_agencies: TopTierAgency[];
    };
};

type SubAgency = {
    name: string;
    abbreviation: string;
    total_obligations: number;
    transaction_count: number;
    new_award_count: number;
    children?: SubAgency[];
};

type TopTierAgencySubAgencies = {
    page_metadata: {
        page: number;
        total: number;
        limit: number;
        next: number;
        previous: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    results: SubAgency[];
};

async function fetchAgencyData() {
    console.log('Fetching agency data...');

    await fetchTopTeirAgencies().then(fetchSubAgencies);
}

async function fetchTopTeirAgencies(): Promise<TopTierAgencies> {
    const filename = path.join(dataDir, 'topTierAgencies.json');

    if (existsSync(filename)) {
        console.warn(
            ' Skipping top tier agency data because the file already exists.'
        );

        return await fs
            .readFile(filename)
            .then(buffer => JSON.parse(buffer.toString()));
    }

    const fileHandle = await fs.open(filename, 'w');

    const data = await httpsRequestJson<TopTierAgencies>({
        url: `${spendingApiUrl}/bulk_download/list_agencies`,
        options: { method: 'POST' },
        body: JSON.stringify({ type: 'award_agencies' }),
    });

    await fileHandle.write(JSON.stringify(data));
    await fileHandle.close();

    return data;
}

async function fetchSubAgencies(topTierAgencies: TopTierAgencies) {
    const filename = path.join(dataDir, 'subAgencies.json');

    if (existsSync(filename)) {
        console.warn(
            ' Skipping subagency data because the file already exists.'
        );
        return;
    }

    await Promise.all(
        [
            ...topTierAgencies.agencies.cfo_agencies,
            ...topTierAgencies.agencies.other_agencies,
        ].map(fetchSubAgenciesForTopTierAgency)
    )
        .then(filterEmptyTopTierAgencies)
        .then(mergeSubAgencies)
        .then(writeSubAgencies(filename))
        .catch(console.error);
}

async function fetchSubAgenciesForTopTierAgency(topTierAgency: TopTierAgency) {
    console.log(`  Fetching sub agencies for ${topTierAgency.name}`);

    let data: TopTierAgencySubAgencies | undefined;
    let page = 1;
    const results: SubAgency[] = [];

    do {
        try {
            data = await httpsRequestJson<TopTierAgencySubAgencies>({
                url: `${spendingApiUrl}/agency/${topTierAgency.toptier_code}/sub_agency/?page=${page}&limit=100`,
            });

            if (data?.results) {
                results.push(...data.results);
            }
        } catch (error) {
            data = undefined;
            console.error(error);
        } finally {
            page += 1;
        }
    } while (data?.page_metadata?.hasNext);

    return results;
}

async function filterEmptyTopTierAgencies(subAgencies: SubAgency[][]) {
    return subAgencies.filter(subAgencies => subAgencies.length > 0);
}

async function mergeSubAgencies(subAgencies: SubAgency[][]) {
    return subAgencies.flatMap(subAgencies =>
        subAgencies.flatMap(({ children, ...subAgency }) => [
            subAgency,
            ...(children ?? []),
        ])
    );
}

function writeSubAgencies(filename: string) {
    return async (subAgencies: SubAgency[]) => {
        fs.writeFile(filename, JSON.stringify(subAgencies));
    };
}

fetchAgencyData();
