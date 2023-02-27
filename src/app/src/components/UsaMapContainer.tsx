import { ReactNode, useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
export default function UsaMapContainer({
    children,
}: {
    children?: ReactNode;
}) {
    return (
        <MapContainer
            center={[0, 0]} // Albers USA is not a "real" projection
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
