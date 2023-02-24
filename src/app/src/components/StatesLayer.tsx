import L, { GeoJSONOptions } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { STATE_STYLE_BASE } from '../constants';

import stateGeoJson, { StateGeometry, StateProperties } from './states.geojson';

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
        const layer = L.geoJSON<StateProperties, StateGeometry>(stateGeoJson, {
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
    }, [map, onEachFeature]);

    return null;
}
