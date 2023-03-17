import L, { GeoJSONOptions } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { STATE_STYLE_BASE } from '../constants';

import {
    StateGeometry,
    StateProperties,
    StatesCollection,
} from '../types/states';

import stateGeoJson from '../data/states.lowres.geo.json';

export default function StatesLayer({
    onEachFeature,
}: {
    onEachFeature?: GeoJSONOptions<
        StateProperties,
        StateGeometry
    >['onEachFeature'];
}) {
    const map = useMap();

    useEffect(() => {
        const layer = L.geoJSON<StateProperties, StateGeometry>(
            stateGeoJson as StatesCollection,
            {
                style: STATE_STYLE_BASE,
                interactive: true,
                onEachFeature,
            }
        );

        map.addLayer(layer);

        return () => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        };
    }, [map, onEachFeature]);

    return null;
}
