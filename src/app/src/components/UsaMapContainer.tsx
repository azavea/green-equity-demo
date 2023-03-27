import { useBreakpointValue } from '@chakra-ui/react';
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
    const startingZoom = useMapZoom();

    return (
        <MapContainer
            center={[0, 0]} // Albers USA is not a "real" projection
            zoom={startingZoom}
            zoomSnap={0.5}
            zoomControl={false}
            scrollWheelZoom={false}
            boxZoom={false}
            doubleClickZoom={false}
            dragging={false}
            attributionControl={false}
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
            <MobileZoomer />
            {children}
        </MapContainer>
    );
}

function MobileZoomer() {
    const map = useMap();
    const mapZoom = useMapZoom();

    useEffect(() => {
        map.setZoom(mapZoom);
    }, [mapZoom, map]);

    return null;
}

function useMapZoom() {
    return (
        useBreakpointValue({
            xs: 3.5,
            sm: 4.0,
            md: 4.5,
        }) ?? 4.5
    );
}
