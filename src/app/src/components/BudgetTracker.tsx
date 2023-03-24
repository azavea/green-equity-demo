import { useMemo } from 'react';
import {
    Box,
    CircularProgress,
    HStack,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';

import { useGetSpendingByGeographyQuery } from '../api';
import { getDefaultSpendingByGeographyRequest } from '../util';
import lastUpdated from '../data/lastUpdated.json';
import useIsMobileMode from '../useIsMobileMode';

export default function BudgetTracker() {
    const isMobileMode = useIsMobileMode();

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
        <Box
            background='#F6F8FF'
            width='100%'
            pt={5}
            pb={5}
            pl={15}
            pr={15}
            zIndex={1}
        >
            <Stack
                direction={isMobileMode ? 'column' : 'row'}
                justifyContent='space-around'
                maxWidth='800px'
                margin='auto'
            >
                <VStack alignItems='flex-start' pl={4} pb={5}>
                    <Text fontSize={24} fontWeight={700}>
                        BIL budget tracker
                    </Text>
                    <Text
                        fontSize={20}
                        fontWeight={500}
                        style={{ marginTop: 0 }}
                    >
                        Amount awarded of $550B budget
                    </Text>
                    {spendingSum ? <MoneyLeft spending={spendingSum} /> : null}
                </VStack>
                {spendingSum ? (
                    <BudgetTrackerProgressBar spending={spendingSum} />
                ) : (
                    <CircularProgress isIndeterminate />
                )}
            </Stack>
        </Box>
    );
}

function MoneyLeft({ spending }: { spending: number }) {
    const date = new Date(lastUpdated.lastUpdated);
    const billionsLeft = (550 - spending / 1_000_000_000).toFixed();

    return (
        <Text fontSize={20} style={{ marginTop: 0 }}>
            ${billionsLeft}B left as of {date.toLocaleDateString()}
        </Text>
    );
}

const progressWidth = '90%';
const progressColor = '#465EB5';
const spendingDenominator = 550_000_000_000 / 100;
function BudgetTrackerProgressBar({ spending }: { spending: number }) {
    const isMobileMode = useIsMobileMode();

    const spendingPercent = spending / spendingDenominator;
    const moneyLeftPercent = 100 - spendingPercent;
    const spendingBillions = spending / 1_000_000_000;

    return (
        <VStack
            spacing={0}
            flexGrow={1}
            justifyContent='center'
            maxWidth={isMobileMode ? undefined : 'md'}
        >
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
                    ${spendingBillions.toFixed()}B
                </div>
                <div
                    style={{
                        width: `${moneyLeftPercent}%`,
                        height: '100%',
                        textAlign: 'center',
                    }}
                />
            </HStack>
            <Box paddingTop={2} width={progressWidth}>
                <Box
                    marginLeft={`calc(${spendingPercent}% - 7px)`}
                    width={0}
                    height={0}
                    borderLeft='7px solid transparent'
                    borderRight='7px solid transparent'
                    borderBottom='10px solid black'
                />
                <Text
                    marginLeft={`${spendingPercent}%`}
                    position='relative'
                    transform='translateX(-50%)'
                >
                    {spendingPercent.toFixed()}%
                </Text>
            </Box>
        </VStack>
    );
}
