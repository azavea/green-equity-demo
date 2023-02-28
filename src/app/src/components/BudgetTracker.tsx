import { useMemo } from 'react';
import { Box, CircularProgress, HStack, Text, VStack } from '@chakra-ui/react';

import { useGetSpendingByGeographyQuery } from '../api';
import { getDefaultSpendingByGeographyRequest } from '../util';

export default function BudgetTracker() {
    const { data: spending } = useGetSpendingByGeographyQuery(
        getDefaultSpendingByGeographyRequest()
    );

    const spendingSum = useMemo(
        () =>
            spending?.results.reduce(
                (sum, result) => sum + result.aggregated_amount,
                0
            ),
        [spending?.results]
    );

    return (
        <Box background='#F6F8FF' width='100%' pt={10} pb={10} pl={64} pr={64}>
            <HStack justifyContent='space-around'>
                <VStack alignItems='flex-start'>
                    <Text fontSize={24} fontWeight={700}>
                        BIL budget tracker
                    </Text>
                    <Text fontSize={20} fontWeight={500}>
                        $550B available in bill
                    </Text>
                    <Text fontSize={14}>Updated Jan 13, 2023</Text>
                </VStack>
                {spendingSum ? (
                    <BudgetTrackerProgressBar spending={spendingSum} />
                ) : (
                    <CircularProgress isIndeterminate />
                )}
            </HStack>
        </Box>
    );
}

function BudgetTrackerProgressBar({ spending }: { spending: number }) {
    return (
        <VStack spacing={0} width='xl'>
            <BudgetTrackerProgressBarProgress spending={spending} />
            <BudgetTrackerProgressBarTicks />
            <BudgetTrackerProgressBarLabels />
        </VStack>
    );
}

const progressWidth = '90%';
const progressColor = '#465EB5';
const spendingDenominator = 550_000_000_000 / 100;
function BudgetTrackerProgressBarProgress({ spending }: { spending: number }) {
    const spendingPercent = spending / spendingDenominator;
    const moneyLeftPercent = 100 - spendingPercent;
    const spendingBillions = spending / 1_000_000_000;

    return (
        <HStack
            height={30}
            width={progressWidth}
            spacing={0}
            border={`1px solid ${progressColor}`}
        >
            <div
                style={{
                    background: progressColor,
                    width: `${spendingPercent}%`,
                    height: '100%',
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                {spendingBillions.toFixed()}B announced
            </div>
            <div
                style={{
                    width: `${moneyLeftPercent}%`,
                    height: '100%',
                    textAlign: 'center',
                }}
            >
                {(550 - spendingBillions).toFixed()}B left
            </div>
        </HStack>
    );
}

const baseTickStyle = { height: '100%', width: '50%' };
const fullTick = 'solid 1px grey';
const halfTick = 'solid .5px grey';
function BudgetTrackerProgressBarTicks() {
    return (
        <HStack height='12px' width={progressWidth} spacing={0}>
            <div
                style={{
                    ...baseTickStyle,
                    borderLeft: fullTick,
                    borderRight: halfTick,
                }}
            />
            <div
                style={{
                    ...baseTickStyle,
                    borderRight: fullTick,
                    borderLeft: halfTick,
                }}
            />
        </HStack>
    );
}

function BudgetTrackerProgressBarLabels() {
    return (
        <HStack
            height='12px'
            width='100%'
            justifyContent='space-between'
            pt={5}
            pl={4} // There could be a better way to align the labels
        >
            <Text>0%</Text>
            <Text>50%</Text>
            <Text>100%</Text>
        </HStack>
    );
}
