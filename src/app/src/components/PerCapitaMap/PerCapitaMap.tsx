import { useCallback, useState } from 'react';
import { Center, CircularProgress, VStack } from '@chakra-ui/react';
import L, { Layer } from 'leaflet';
import 'leaflet-draw';

import UsaMapContainer from '../UsaMapContainer';
import StatesLayer from '../StatesLayer';
import SpendingTooltip from './SpendingTooltip';
import SpendingCategorySelector from './SpendingCategorySelector';

import { SpendingByGeographySingleResult } from '../../types/api';
import { STATE_STYLE_BASE, STATE_STYLE_HOVER } from '../../constants';
import { Category } from '../../enums';
import useSpendingByCategoryByState from './useSpendingByCategoryByState';
import { StateFeature } from '../states.geojson';

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
    const [tooltipDivs, setTooltipDivs] = useState<
        Record<string, HTMLDivElement | undefined>
    >({});

    const onEachFeature = useCallback((feature: StateFeature, layer: Layer) => {
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
            (layer as any).setStyle(STATE_STYLE_HOVER);
        });

        layer.on('mouseout', () => {
            (layer as any).setStyle(STATE_STYLE_BASE);
        });
        layer.on('remove', () => {
            setTooltipDivs(tooltipDivs => ({
                ...tooltipDivs,
                [feature.properties.STUSPS]: undefined,
            }));
        });
    }, []);

    return (
        <>
            <StatesLayer onEachFeature={onEachFeature} />
            {Object.entries(spendingByCategoryByState)
                .filter(([, stateSpending]) => Category.ALL in stateSpending)
                .map(([stateCode, stateSpending]) => (
                    <SpendingTooltip
                        key={stateCode}
                        state={stateSpending[Category.ALL].display_name}
                        population={stateSpending[Category.ALL].population}
                        spendingByCategory={stateSpending}
                        selectedCategory={selectedCategory}
                        tooltipDiv={tooltipDivs[stateCode]}
                    />
                ))}
        </>
    );
}
