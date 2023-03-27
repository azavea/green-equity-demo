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

    // fetchSpendingOverTimeData relies on json product of fetchStatesData
    await fetchStatesData();

    const [perCapitaResult] = await Promise.allSettled([
        fetchPerCapitaSpendingData(),
        fetchSpendingOverTimeData(),
    ]);

    if (perCapitaResult.status === 'fulfilled') {
        const today = new Date();
        const todayJson = JSON.stringify({
            lastUpdated: today.toISOString().substring(0, 10),
        });
        writeFile(
            'src/data/lastUpdated.json',
            todayJson,
            { flag: 'w+' },
            _err => {
                // do nothing.
            }
        );
    }
}

fetchData();
