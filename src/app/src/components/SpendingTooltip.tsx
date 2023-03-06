import React from 'react';
import { cardAnatomy } from '@chakra-ui/anatomy';
import {
    createMultiStyleConfigHelpers,
    Box,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Stack,
    StackDivider,
    StyleFunctionProps,
    Text,
    Progress,
} from '@chakra-ui/react';
import { Category } from '../enums';
import { abbreviateNumber } from '../util';
import { SpendingByGeographySingleResult } from '../types/api';

export default function SpendingTooltip({
    state,
    stateCode,
    allSpending,
    population,
    spendingByCategory,
    selectedCategory,
}: {
    state: string;
    stateCode: string;
    allSpending: number;
    population: number;
    spendingByCategory: Map<
        Category,
        SpendingByGeographySingleResult | undefined
    >;
    selectedCategory: Category;
}) {
    const categorySuffixPerCapita =
        selectedCategory === Category.ALL
            ? ''
            : ' for ' + selectedCategory.toString().toLowerCase();

    const categorySpending = spendingByCategory.get(selectedCategory);

    return (
        <Card variant='spendingTooltip'>
            <CardHeader>
                <Heading size='sm'>{state}</Heading>
            </CardHeader>
            <CardBody>
                <Stack divider={<StackDivider />} spacing={2}>
                    <Box>
                        <Text fontWeight={'bold'}>
                            Dollars per capita{categorySuffixPerCapita}: $
                            {Math.round(
                                categorySpending?.per_capita ?? 0
                            ).toLocaleString()}
                        </Text>
                    </Box>
                    <Box>
                        <Text fontWeight={'medium'}>
                            Funding: $
                            {abbreviateNumber(
                                categorySpending?.aggregated_amount ?? 0
                            )}
                        </Text>
                        <Text fontWeight={'medium'}>
                            Population: {abbreviateNumber(population)}
                        </Text>
                    </Box>
                    <Box>
                        {selectedCategory === Category.ALL &&
                            Array.from(spendingByCategory, ([cat, result]) => {
                                if (cat === Category.ALL) {
                                    return null;
                                }

                                const amount = result?.aggregated_amount ?? 0;

                                return (
                                    <SpendingBar
                                        key={`tooltipCategory-${stateCode}-${cat.toString()}`}
                                        cat={cat}
                                        stateCode={stateCode}
                                        amount={amount}
                                        allSpending={allSpending}
                                    />
                                );
                            })}
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    );
}

function SpendingBar({
    cat,
    stateCode,
    amount,
    allSpending,
}: {
    cat: Category;
    stateCode: string;
    amount: number;
    allSpending: number;
}) {
    return (
        <>
            <Text>{cat.toString()}:</Text>
            <Text>{roundedPercent(amount, allSpending)}%</Text>
            <Progress
                mb={2}
                colorScheme='tooltip'
                size='lg'
                value={roundedPercent(amount, allSpending)}
            />
        </>
    );
}

const roundedPercent = (amount: number, total: number) => {
    return Math.round(((amount ?? 0) / total) * 100);
};

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(cardAnatomy.keys);

const variants = {
    spendingTooltip: (props: StyleFunctionProps) =>
        definePartsStyle({
            container: {
                ...props.theme.components.Card.variants.elevated.container,
                overflow: 'clip', // https://github.com/twbs/bootstrap/issues/37010
                minWidth: '194px',
                padding: '0',
                border: '0',
            },
            header: {
                ...props.theme.components.Card.variants.elevated.header,
                height: '44px',
                backgroundColor: '#465EB5',
                color: 'white',
                fontWeight: 'semibold',
                paddingLeft: '15px',
                paddingTop: '15px',
            },
            body: {
                paddingTop: '0.5rem', // to match <Stack spacing={2} />
                paddingLeft: '15px',
                paddingBottom: '0.5rem', // to match <Stack spacing={2} />
                fontWeight: 'normal',
            },
            footer: {
                paddingTop: '0',
                margin: '0',
                paddingBottom: '0.5rem', // to match <Stack spacing={2} />
                fontWeight: 'medium',
            },
        }),
};

export const spendingTooltipCardStyle = defineMultiStyleConfig({ variants });
