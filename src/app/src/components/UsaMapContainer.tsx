import { ReactNode } from 'react';
import { MapContainer } from 'react-leaflet';

import { AMERICA_CENTER } from '../constants';

export default function UsaMapContainer({
    children,
}: {
    children?: ReactNode;
}) {
    return (
        <MapContainer
            center={AMERICA_CENTER}
            zoom={4}
            zoomControl={false}
            scrollWheelZoom={false}
            boxZoom={false}
            doubleClickZoom={false}
            dragging={false}
            style={{ height: '460px', width: '100%' }}
        >
            {children}
        </MapContainer>
    );
}
