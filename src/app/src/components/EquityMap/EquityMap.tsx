import L from 'leaflet';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import StatesLayer from '../StatesLayer';

import UsaMapContainer from '../UsaMapContainer';

export default function EquityMap() {
    return (
        <>
            <div style={{ height: 75 }} />
            <UsaMapContainer negativeMargin>
                <StatesLayer />
                <DisadvantagedCommunitiesLayer />
            </UsaMapContainer>
        </>
    );
}

function DisadvantagedCommunitiesLayer() {
    const map = useMap();
    const [svg, setSvg] = useState<SVGElement | undefined>();
    const [disadvantagedCommunitiesData, setDisadvantagedCommunitiesData] =
        useState<GeoJSON.GeoJSON | undefined>();

    useEffect(() => {
        import('../../data/disadvantagedCommunities.json').then(data => {
            setDisadvantagedCommunitiesData(data as unknown as GeoJSON.GeoJSON);
        });
    }, []);

    useEffect(() => {
        if (disadvantagedCommunitiesData) {
            const layer = L.geoJSON(disadvantagedCommunitiesData, {
                style: {
                    fill: true,
                    fillColor: 'url(#stripes)',
                    fillOpacity: 1,
                    weight: 1,
                    color: 'black',
                },
            });

            map.addLayer(layer);

            return () => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            };
        }
    }, [map, disadvantagedCommunitiesData]);

    useEffect(() => {
        var svg = map
            .getContainer()
            .querySelector<SVGElement>('.leaflet-overlay-pane svg');

        if (!svg) {
            throw new Error('Could not find overlay pane svg element');
        }

        setSvg(svg);
    }, [map]);

    if (svg) {
        return createPortal(
            <defs>
                <pattern
                    id='stripes'
                    width='8'
                    height='4'
                    patternTransform='rotate(290 0 0)'
                    patternUnits='userSpaceOnUse'
                >
                    <line
                        x1='0'
                        y1='0'
                        x2='8'
                        y2='0'
                        style={{
                            stroke: 'black',
                            strokeWidth: 3,
                        }}
                    />
                </pattern>
            </defs>,
            svg
        );
    }

    return null;
}
