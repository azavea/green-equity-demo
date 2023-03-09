import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Center, CircularProgress, VStack } from '@chakra-ui/react';
import L from 'leaflet';
import 'leaflet-draw';

import UsaMapContainer from '../UsaMapContainer';
import StatesLayer from '../StatesLayer';
import SpendingTooltip from './SpendingTooltip';
import SpendingCategorySelector from './SpendingCategorySelector';

import { SpendingByGeographySingleResult } from '../../types/api';
import { STATE_STYLE_BASE, STATE_STYLE_HOVER } from '../../constants';
import { Category } from '../../enums';
import useSpendingByCategoryByState from './useSpendingByCategoryByState';

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
        </VStack>
    );
}

function StatesAndMarkersLayer({
    spendingByCategoryByState,
    selectedCategory,
}: {
    spendingByCategoryByState: Record<
        string,
        Record<Category, SpendingByGeographySingleResult>
    >;
    selectedCategory: Category;
}) {
    const tooltips = Object.keys(spendingByCategoryByState).map(stateCode => {
        const tooltipDiv = document.createElement('div');
        tooltipDiv.dataset.stateCode = stateCode;
        tooltipDiv.id = `tooltip-${stateCode}`;
        return tooltipDiv;
    });
    const [tooltipsAttached, setTooltipsAttached] = useState(false);

    return (
        <>
            {tooltipsAttached &&
                tooltips.map(tooltip => {
                    if (!tooltip.dataset.stateCode) {
                        throw new Error('Unreachable code');
                    }

                    const spendingByCategory =
                        spendingByCategoryByState[tooltip.dataset.stateCode];
                    if (spendingByCategory === undefined) {
                        return null;
                    }

                    const allStateSpending =
                        spendingByCategoryByState[
                            tooltip.dataset?.stateCode!
                        ]?.[Category.ALL];

                    if (allStateSpending === undefined) {
                        return null;
                    }

                    return createPortal(
                        <SpendingTooltip
                            state={allStateSpending.display_name ?? ''}
                            population={allStateSpending.population ?? 0}
                            spendingByCategory={spendingByCategory}
                            selectedCategory={selectedCategory}
                        />,
                        tooltip
                    );
                })}
            <StatesLayer
                onEachFeature={(feature, layer) => {
                    layer.on('add', () => {
                        const perCapitaSpending =
                            spendingByCategoryByState[
                                feature.properties.STUSPS
                            ]?.[selectedCategory].per_capita;

                        if (!perCapitaSpending) {
                            return;
                        }

                        const tooltipForState = tooltips.find(
                            tooltip =>
                                tooltip.id ===
                                `tooltip-${feature.properties.STUSPS}`
                        );
                        if (tooltipForState !== undefined) {
                            tooltipForState.dataset.stateName =
                                feature.properties.NAME;
                            layer.bindTooltip(tooltipForState, {
                                opacity: 1.0,
                                sticky: true,
                                offset: new L.Point(15, 15),
                            });
                            setTooltipsAttached(true);
                        }
                    });

                    layer.on('mouseover', () => {
                        (layer as any).setStyle(STATE_STYLE_HOVER);
                    });

                    layer.on('mouseout', () => {
                        (layer as any).setStyle(STATE_STYLE_BASE);
                    });
                }}
            />
        </>
    );
}
