import { useEffect, useState } from 'react';
import { Progress, Tag, TagLabel } from '@chakra-ui/react';

import { SpendingByGeographyAtMonth } from '../../types/api';
import { TOTAL_BIL_AMOUNT } from '../../constants';

export default function AnimatedTotalSpendingBucket({
    spendingAtTimeByState,
}: {
    spendingAtTimeByState: SpendingByGeographyAtMonth | undefined;
}) {
    const [totalSpendingAtTime, setTotalSpendingAtTime] = useState(0);

    useEffect(() => {
        if (spendingAtTimeByState) {
            const totalAwardsAtTime: number = Object.values(
                spendingAtTimeByState
            ).reduce((sum, stateResults) => {
                sum += stateResults && stateResults.aggregated_amount;
                return sum;
            }, 0);
            totalAwardsAtTime && setTotalSpendingAtTime(totalAwardsAtTime);
        }
    }, [spendingAtTimeByState]);

    const amountLeft = divideByBillion(TOTAL_BIL_AMOUNT - totalSpendingAtTime);

    return (
        <Tag background='none'>
            <Progress
                value={amountLeft}
                opacity={100}
                colorScheme={'progress'}
                aria-label='spending-progress-bar'
                height={'20px'}
                width={'60px'}
                style={{ transform: 'rotate(270deg)' }}
                min={0}
                max={550}
            />
            <TagLabel
                overflow={'none'}
                mt={'80px'}
                ml={'-50px'}
                backgroundColor={'white'}
            >
                ${amountLeft}B
            </TagLabel>
        </Tag>
    );
}

function divideByBillion(value: number): number {
    return Math.round(value / 1000000000);
}
