import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { spendingApiUrl } from '../src/constants';

import { dataDir } from './nodeConstants';
import { httpsRequestJson } from './httpsRequest';

export default async function fetchStatesData() {
    console.log('Fetching state data...');

    const filename = path.join(dataDir, 'states.json');

    if (existsSync(filename)) {
        console.warn(' Skipping states data because the file already exists.');
        return;
    }

    await fs.open(filename, 'w').then(async fileHandle => {
        const data = await httpsRequestJson({
            url: `${spendingApiUrl}/recipient/state/`,
        });

        await fileHandle.write(JSON.stringify(data));
        await fileHandle.close();
    });
}
