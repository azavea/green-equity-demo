import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { spendingApiUrl } from '../src/constants';

import { dataDir } from './nodeConstants';
import httpsRequestToFile from './httpRequestToFile';

export default async function fetchStatesData() {
    console.log('Fetching state data...');

    const filename = path.join(dataDir, 'states.json');

    if (existsSync(filename)) {
        console.warn(' Skipping states data because the file already exists.');
        return;
    }

    await fs.open(filename, 'w').then(async fileHandle => {
        await httpsRequestToFile({
            url: `${spendingApiUrl}/recipient/state/`,
            fileHandle,
        });

        fileHandle.close();
    });
}
