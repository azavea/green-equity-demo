import { useBreakpointValue } from '@chakra-ui/react';
import { ReactNode, useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';

import { MAP_CONTAINER_NEGATIVE_MARGIN, DC_CENTER } from '../constants';

export default function UsaMapContainer({
    negativeMargin = false,
    children,
    containerRef,
}: {
    negativeMargin?: boolean;
    children?: ReactNode;
    containerRef?: React.MutableRefObject<Element | undefined>;
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
            <PortalContainerSetter containerRef={containerRef} />
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

function PortalContainerSetter({
    containerRef,
}: {
    containerRef?: React.MutableRefObject<Element | undefined>;
}) {
    const map = useMap();
    if (containerRef && !containerRef.current) {
        // Create container div for spending bucket animation
        const popupContainer = document.createElement('div');
        L.popup({ className: 'portal-container', closeButton: false })
            .setLatLng(DC_CENTER)
            .setContent(popupContainer)
            .openOn(map);
        containerRef.current = popupContainer;
    }
    return null;
}
