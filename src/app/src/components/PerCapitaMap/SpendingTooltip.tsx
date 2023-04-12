import { cardAnatomy } from '@chakra-ui/anatomy';
import {
    createMultiStyleConfigHelpers,
    Box,
    Card,
    CardBody,
    CardHeader,
    Heading,
    HStack,
    Stack,
    StackDivider,
    StyleFunctionProps,
    Text,
} from '@chakra-ui/react';
import { createPortal } from 'react-dom';

import { Category, isCategory } from '../../enums';
import { abbreviateNumber } from '../../util';
import { StateSpending } from '../../types/api';

const FULL_BAR_WIDTH = 194;

export default function SpendingTooltip({
    state,
    population,
    spendingByCategory,
    selectedCategory,
    tooltipDiv,
}: {
    state: string;
    population: number;
    spendingByCategory: StateSpending;
    selectedCategory: Category;
    tooltipDiv: HTMLDivElement | undefined;
}) {
    const categorySuffixPerCapita =
        selectedCategory === Category.ALL
            ? ''
            : ' for ' + selectedCategory.toString().toLowerCase();

    const categorySpending = spendingByCategory[selectedCategory];

    if (!tooltipDiv) {
        return null;
    }

    return createPortal(
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
                    {selectedCategory === Category.ALL ? (
                        <SpendingBars spendingByCategory={spendingByCategory} />
                    ) : null}
                </Stack>
            </CardBody>
        </Card>,
        tooltipDiv
    );
}

function SpendingBars({
    spendingByCategory,
}: {
    spendingByCategory: StateSpending;
}) {
    const totalAmount = spendingByCategory[Category.ALL]!.aggregated_amount;
    let leftoverPercent = 100;

    return (
        <Box>
            {Object.entries(spendingByCategory).map(([cat, result]) => {
                if (!isCategory(cat)) {
                    throw new Error('Unreachable code');
                }

                if (cat === Category.ALL || cat === Category.OTHER) {
                    return null;
                }

                const percent = roundedPercent(
                    result.aggregated_amount,
                    totalAmount
                );

                leftoverPercent -= percent;

                return <SpendingBar key={cat} cat={cat} percent={percent} />;
            })}
            <SpendingBar
                cat={Category.OTHER}
                percent={Math.max(leftoverPercent, 0)}
            />
        </Box>
    );
}

function SpendingBar({ cat, percent }: { cat: Category; percent: number }) {
    const thisWidth = Math.round((percent / 100) * FULL_BAR_WIDTH);

    return (
        <>
            <Text mb={1}>{cat.toString()}:</Text>
            <HStack spacing={2} mb={2}>
                <Box
                    bg='#465EB5'
                    height={4}
                    width={`${thisWidth}px`}
                    aria-label={`${percent}%`}
                />
                <Text>{percent}%</Text>
            </HStack>
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
                minWidth: `${FULL_BAR_WIDTH}px`,
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
