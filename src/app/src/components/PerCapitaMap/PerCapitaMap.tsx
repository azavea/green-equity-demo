import { useCallback, useMemo, useState } from 'react';
import { Center, CircularProgress, VStack } from '@chakra-ui/react';
import L from 'leaflet';
import 'leaflet-draw';

import UsaMapContainer from '../UsaMapContainer';
import StatesLayer from '../StatesLayer';
import SpendingTooltip from './SpendingTooltip';
import SpendingCategorySelector from './SpendingCategorySelector';
import PerCapitaMapLegend from './PerCapitaMapLegend';

import { SpendingByGeographySingleResult } from '../../types/api';
import { Category } from '../../enums';
import useSpendingByCategoryByState from './useSpendingByCategoryByState';
import {
    StateFeature,
    StatesLayer as StatesLayerType,
} from '../states.geojson';
import { getAmountCategory } from '../../util';
import { STATE_STYLE_BASE } from '../../constants';

export default function PerCapitaMap() {
    const [spendingCategory, setSpendingCategory] = useState(Category.ALL);
    const spendingByCategoryByState = useSpendingByCategoryByState();

    return (
        <VStack width='100%' justifyContent='center'>
            <SpendingCategorySelector
                value={spendingCategory}
                onChange={setSpendingCategory}
            />
            <UsaMapContainer negativeMargin>
                {spendingByCategoryByState ? (
                    <StatesAndMarkersLayer
                        spendingByCategoryByState={spendingByCategoryByState}
                        selectedCategory={spendingCategory}
                    />
                ) : (
                    <Center p={4}>
                        <CircularProgress isIndeterminate />
                    </Center>
                )}
            </UsaMapContainer>
            <PerCapitaMapLegend />
        </VStack>
    );
}

function StatesAndMarkersLayer({
    spendingByCategoryByState: unfilteredSpendingByCategoryByState,
    selectedCategory,
}: {
    spendingByCategoryByState: Record<
        string,
        Record<Category, SpendingByGeographySingleResult>
    >;
    selectedCategory: Category;
}) {
    const [tooltipDivs, setTooltipDivs] = useState<
        Record<string, HTMLDivElement | undefined>
    >({});

    const spendingByCategoryByState = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(unfilteredSpendingByCategoryByState).filter(
                    ([, stateSpending]) =>
                        Category.ALL in stateSpending &&
                        selectedCategory in stateSpending
                )
            ),
        [selectedCategory, unfilteredSpendingByCategoryByState]
    );

    const onEachFeature = useCallback(
        (feature: StateFeature, layer: StatesLayerType) => {
            const stateSpending =
                spendingByCategoryByState[feature.properties.STUSPS];

            if (stateSpending === undefined) {
                return;
            }

            layer.setStyle({
                fillColor: getAmountCategory(
                    stateSpending[selectedCategory].per_capita
                ).color,
            });

            layer.on('add', () => {
                const tooltipDiv = document.createElement('div');

                layer.bindTooltip(tooltipDiv, {
                    opacity: 1.0,
                    sticky: true,
                    offset: new L.Point(15, 15),
                });

                setTooltipDivs(tooltipDivs => ({
                    ...tooltipDivs,
                    [feature.properties.STUSPS]: tooltipDiv,
                }));
            });

            layer.on('mouseover', () => {
                (layer as any).setStyle({ weight: 2 });
            });

            layer.on('mouseout', () => {
                (layer as any).setStyle({
                    weight: STATE_STYLE_BASE.weight,
                });
            });

            layer.on('remove', () => {
                setTooltipDivs(tooltipDivs => ({
                    ...tooltipDivs,
                    [feature.properties.STUSPS]: undefined,
                }));
            });
        },
        [selectedCategory, spendingByCategoryByState]
    );

    return (
        <>
            <StatesLayer onEachFeature={onEachFeature} />
            {Object.entries(spendingByCategoryByState).map(
                ([stateCode, stateSpending]) => (
                    <SpendingTooltip
                        key={stateCode}
                        state={stateSpending[Category.ALL].display_name}
                        population={stateSpending[Category.ALL].population}
                        spendingByCategory={stateSpending}
                        selectedCategory={selectedCategory}
                        tooltipDiv={tooltipDivs[stateCode]}
                    />
                )
            )}
        </>
    );
}
