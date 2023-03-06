import { mkdir } from 'node:fs/promises';
import { existsSync, writeFile } from 'node:fs';

import { dataDir } from './nodeConstants';

import fetchPerCapitaSpendingData from './fetchPerCapitaSpendingData';
import fetchStatesData from './fetchStatesData';
import fetchSpendingOverTimeData from './fetchSpendingOverTimeData';

async function fetchData() {
    if (!existsSync(dataDir)) {
        await mkdir(dataDir);
    }

    try {
        await Promise.all([fetchStatesData(), fetchPerCapitaSpendingData()]);
        // fetchSpendingOverTimeData relies on json product of fetchStatesData
        await fetchSpendingOverTimeData();
    } catch {
        // Data not fetched.
        return;
    }

    const today = new Date();
    const todayJson = JSON.stringify({
        lastUpdated: today.toISOString().substring(0, 10),
    });
    writeFile(
        'src/data/lastUpdated.json',
        todayJson,
        { flag: 'w+' },
        err => {}
    );
}

fetchData();
