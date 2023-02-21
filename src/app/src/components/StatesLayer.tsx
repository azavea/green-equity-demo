import L, { GeoJSONOptions } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

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
            style: { color: 'black', weight: 0.62, fill: false },
            interactive: false,
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
