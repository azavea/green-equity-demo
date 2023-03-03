import { ReactNode, useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import { MAP_CONTAINER_NEGATIVE_MARGIN } from '../constants';
export default function UsaMapContainer({
    negativeMargin = false,
    children,
}: {
    negativeMargin?: boolean;
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
            style={{
                height: `${
                    600 + (negativeMargin ? MAP_CONTAINER_NEGATIVE_MARGIN : 0)
                }px`,
                width: '100%',
                ...(negativeMargin
                    ? {
                          marginTop: `-${MAP_CONTAINER_NEGATIVE_MARGIN}px`,
                          marginBottom: `-${MAP_CONTAINER_NEGATIVE_MARGIN}px`,
                      }
                    : {}),
            }}
        >
            <AttributionMover />
            {children}
        </MapContainer>
    );
}

function AttributionMover() {
    const map = useMap();

    useEffect(() => {
        map.attributionControl.setPosition('bottomleft');
    }, [map]);

    return null;
}
