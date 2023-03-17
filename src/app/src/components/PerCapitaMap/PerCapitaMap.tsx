import { useCallback, useMemo, useState } from 'react';
import { Center, CircularProgress, VStack } from '@chakra-ui/react';
import L from 'leaflet';
import 'leaflet-draw';

import UsaMapContainer from '../UsaMapContainer';
import StatesLayer from '../StatesLayer';
import SpendingTooltip from './SpendingTooltip';
import SpendingCategorySelector from './SpendingCategorySelector';
import PerCapitaMapLegend from './PerCapitaMapLegend';

import { Category, isCategory } from '../../enums';
import useSpendingByCategoryByState from './useSpendingByCategoryByState';
import {
    StateFeature,
    StatesLayer as StatesLayerType,
} from '../../types/states';
import { getAmountCategory } from '../../util';
import { STATE_STYLE_BASE } from '../../constants';
import { StateSpending } from '../../types/api';

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
    spendingByCategoryByState: Record<string, StateSpending>;
    selectedCategory: Category;
}) {
    const [tooltipDivs, setTooltipDivs] = useState<
        Record<string, HTMLDivElement | undefined>
    >({});

    const spendingByCategoryByStateWithoutOtherSpending = useMemo(
        () =>
            Object.entries(unfilteredSpendingByCategoryByState).filter(
                byStatesWithSelectedCategoryData(selectedCategory)
            ),
        [selectedCategory, unfilteredSpendingByCategoryByState]
    );

    const spendingByCategoryByState = useMemo(
        () =>
            Object.fromEntries(
                spendingByCategoryByStateWithoutOtherSpending.map(
                    addOtherSpending
                )
            ),
        [spendingByCategoryByStateWithoutOtherSpending]
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
                    stateSpending[selectedCategory]!.per_capita
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
                        state={stateSpending[selectedCategory]!.display_name}
                        population={stateSpending[selectedCategory]!.population}
                        spendingByCategory={stateSpending}
                        selectedCategory={selectedCategory}
                        tooltipDiv={tooltipDivs[stateCode]}
                    />
                )
            )}
        </>
    );
}

function byStatesWithSelectedCategoryData(selectedCategory: Category) {
    return ([, stateSpending]: [string, StateSpending]) =>
        selectedCategory in stateSpending ||
        // Category is added later, but uses the ALL category to calculate remainder
        (selectedCategory === Category.OTHER && Category.ALL in stateSpending);
}

function addOtherSpending([state, stateSpending]: [string, StateSpending]): [
    string,
    StateSpending
] {
    const aggregateAmount = calculateOtherAggregateAmount(stateSpending);

    return [
        state,
        {
            ...stateSpending,
            [Category.OTHER]: {
                ...stateSpending[Category.ALL]!,
                aggregated_amount: aggregateAmount,
                per_capita:
                    aggregateAmount / stateSpending[Category.ALL]!.population,
            },
        },
    ];
}

function calculateOtherAggregateAmount(stateSpending: StateSpending): number {
    return (
        stateSpending[Category.ALL]!.aggregated_amount -
        Object.entries(stateSpending).reduce((sum, [category, spending]) => {
            if (!isCategory(category)) {
                throw new Error('Unreachable code');
            }

            if (category === Category.ALL || category === Category.OTHER) {
                return sum;
            }

            return sum + spending.aggregated_amount;
        }, 0)
    );
}
