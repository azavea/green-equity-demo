import fs from 'node:fs/promises';
import path from 'node:path';

import { spendingApiUrl } from '../src/api';

import { dataDir } from './constants';
import httpsRequestToFile from './httpRequestToFile';

export default async function fetchStatesData() {
    console.log('Fetching state data...');

    await fs
        .open(path.join(dataDir, 'states.json'), 'w')
        .then(async fileHandle => {
            await httpsRequestToFile({
                url: `${spendingApiUrl}/recipient/state/`,
                fileHandle,
            });

            fileHandle.close();
        });
}
