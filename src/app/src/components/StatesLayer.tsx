import L, { GeoJSONOptions } from 'leaflet';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { STATE_STYLE_BASE } from '../constants';

import {
    StateGeometry,
    StateProperties,
    StatesCollection,
} from '../types/states';

import lowresStateData from '../data/states.lowres.geo.json';

export default function StatesLayer({
    onEachFeature,
}: {
    onEachFeature?: GeoJSONOptions<
        StateProperties,
        StateGeometry
    >['onEachFeature'];
}) {
    const map = useMap();
    const [stateData, setStateData] = useState<StatesCollection>(
        lowresStateData as StatesCollection
    );

    useEffect(() => {
        import('../data/states.highres.geo.json').then(highResStateData => {
            setStateData(highResStateData as unknown as StatesCollection);
        });
    }, []);

    useEffect(() => {
        const layer = L.geoJSON<StateProperties, StateGeometry>(stateData, {
            style: STATE_STYLE_BASE,
            interactive: true,
            onEachFeature,
        });

        map.addLayer(layer);

        return () => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        };
    }, [map, onEachFeature, stateData]);

    return null;
}
