import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import { dataDir } from './nodeConstants';

import fetchPerCapitaSpendingData from './fetchPerCapitaSpendingData';
import fetchStatesData from './fetchStatesData';

async function fetchData() {
    if (!existsSync(dataDir)) {
        await mkdir(dataDir);
    }

    await Promise.all([fetchStatesData(), fetchPerCapitaSpendingData()]);
}

fetchData();
