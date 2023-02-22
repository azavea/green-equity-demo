import { ReactNode, useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';

import { AMERICA_CENTER } from '../constants';

export default function UsaMapContainer({
    children,
}: {
    children?: ReactNode;
}) {
    return (
        <MapContainer
            center={AMERICA_CENTER}
            zoom={4.5}
            zoomSnap={0.5}
            zoomControl={false}
            scrollWheelZoom={false}
            boxZoom={false}
            doubleClickZoom={false}
            dragging={false}
            style={{ height: '600px', width: '100%' }}
        >
            <AttributionMover />
            {children}
        </MapContainer>
    );
}

function AttributionMover() {
    const map = useMap();

    useEffect(() => {
        map.attributionControl.setPosition('topright');
    }, [map]);

    return null;
}
