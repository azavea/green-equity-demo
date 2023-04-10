import { useCallback } from 'react';
import StatesLayer from '../StatesLayer';
import {
    StateFeature,
    StatesLayer as StatesLayerType,
} from '../../types/states';

import MapLegend from '../MapLegend';
import UsaMapContainer from '../UsaMapContainer';
import * as disadvantagedTractsJson from '../../data/disadvantagedTracts.json';
import { QUARTILE_CATEGORIES, STATE_STYLE_BASE } from '../../constants';
import { getAmountCategory } from '../../util';

const disadvantagedTracts = Array.from(disadvantagedTractsJson);

export function EquityMap() {
    const onEachFeature = useCallback(
        (feature: StateFeature, layer: StatesLayerType) => {
            const disadvantagedPopulationSums = disadvantagedTracts.find(
                datum => datum['State'] === feature.properties.NAME
            );
            if (disadvantagedPopulationSums === undefined) {
                return;
            }
            const proportionDisadvantaged =
                Number.parseInt(disadvantagedPopulationSums.Disadvantaged) /
                Number.parseInt(disadvantagedPopulationSums.Total);
            layer.setStyle({
                fillColor: getAmountCategory(
                    proportionDisadvantaged,
                    QUARTILE_CATEGORIES
                ).color,
            });
            layer.on('mouseover', () => {
                layer.setStyle({ weight: 2 });
            });
            layer.on('mouseout', () => {
                layer.setStyle({
                    weight: STATE_STYLE_BASE.weight,
                });
            });
        },
        []
    );

    return (
        <>
            <div style={{ height: 125 }} />
            <UsaMapContainer negativeMargin>
                <StatesLayer onEachFeature={onEachFeature} />
            </UsaMapContainer>
            <MapLegend
                categories={QUARTILE_CATEGORIES}
                label='Population in disadvantaged communities'
                monetary={false}
            />
        </>
    );
}
