import React from 'react';
import { cardAnatomy } from '@chakra-ui/anatomy'
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
} from '@chakra-ui/react'
import { Category } from '../enums';
import { abbreviateNumber } from '../util';

export default function SpendingTooltip({
    state, stateCode, dollarsPerCapita, funding, population, spendingByCategory
}: {
    state: string;
    stateCode: string,
    dollarsPerCapita: number,
    funding: number,
    population: number,
    spendingByCategory: Map<Category, number>,
}) {
    const roundedPercent = (amount: number, total: number) => {
        return Math.round(((amount ?? 0) / total) * 100);
    };

    return (
        <Card variant="spendingTooltip">
            <CardHeader>
                <Heading size='sm'>{state}</Heading>
            </CardHeader>
            <CardBody>
                <Stack divider={<StackDivider />} spacing={2}>
                    <Box>
                        <Text fontWeight={'bold'}>Dollars per capita: ${Math.round(
                            dollarsPerCapita).toLocaleString()}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight={'medium'}>Funding: ${abbreviateNumber(funding)}</Text>
                        <Text fontWeight={'medium'}>Population: {abbreviateNumber(population)}</Text>
                    </Box>
                    <Box>
                        {Array.from(spendingByCategory, ([cat, amount]) => {
                            return (
                            <React.Fragment key={`tooltipCategory-${stateCode}-${cat.toString()}`}>
                                <Text>{cat.toString()}:</Text>
                                <Text>{roundedPercent(amount, funding)}%</Text>
                                <Progress mb={2} colorScheme='tooltip' size='lg' value={roundedPercent(amount, funding)}/>
                            </React.Fragment>
                            );
                        })}
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    );
};


const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(cardAnatomy.keys);

const variants = {
    spendingTooltip: (props: StyleFunctionProps) => definePartsStyle({
        container: {
            ...props.theme.components.Card.variants.elevated.container,
            overflow: 'clip', // https://github.com/twbs/bootstrap/issues/37010
            width: '194px',
            padding: '0',
            border: '0',
        },
        header: {
            ...props.theme.components.Card.variants.elevated.header,
            height: '44px',
            backgroundColor: "#465EB5",
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
