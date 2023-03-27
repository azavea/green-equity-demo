import fs from 'node:fs';
import path from 'node:path';

import statesLowRes from '../src/data/states.lowres.geo.json';
import statesHighRes from '../src/data/states.highres.geo.json';
import { dataDir } from './nodeConstants';

function removeBbox(thing: any): any {
    for (const prop in thing) {
        if (prop === 'bbox') {
            delete thing['bbox'];
        }

        if (typeof thing[prop] === 'object') {
            removeBbox(thing[prop]);
        }
    }
}

console.log('removing bbox from high res');
removeBbox(statesHighRes);

console.log('removing bbox from low res');
removeBbox(statesLowRes);

console.log('writing high res');
fs.writeFileSync(
    path.join(dataDir, 'states.highres.geo.json.nobbox'),
    JSON.stringify(statesHighRes)
);

console.log('writing low res');
fs.writeFileSync(
    path.join(dataDir, 'states.lowres.geo.json.nobbox'),
    JSON.stringify(statesLowRes)
);
