import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Progress, Tag, TagLabel } from '@chakra-ui/react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { SpendingByGeographyAtMonth } from '../../types/api';
import { DC_CENTER, TOTAL_BIL_AMOUNT } from '../../constants';

export default function AnimatedTotalSpendingBucket({
    spendingAtTimeByState,
}: {
    spendingAtTimeByState: SpendingByGeographyAtMonth | undefined;
}) {
    const map = useMap();
    const [div, setDiv] = useState<HTMLDivElement | undefined>();

    useEffect(() => {
        const div = document.createElement('div');
        L.popup({ className: 'portal-container', closeButton: false })
            .setLatLng(DC_CENTER)
            .setContent(div)
            .openOn(map);

        setDiv(div);

        return () => {
            setDiv(undefined);
        };
    }, [map]);

    const [totalSpendingAtTime, setTotalSpendingAtTime] = useState(0);

    useEffect(() => {
        if (spendingAtTimeByState) {
            const totalAwardsAtTime: number = Object.values(
                spendingAtTimeByState
            ).reduce((sum, stateResults) => {
                sum += stateResults && stateResults.per_capita;
                return sum;
            }, 0);
            totalAwardsAtTime && setTotalSpendingAtTime(totalAwardsAtTime);
        }
    }, [spendingAtTimeByState]);

    const amountLeft = TOTAL_BIL_AMOUNT - totalSpendingAtTime;

    if (!div) {
        return null;
    }

    return createPortal(
        <Tag background='none' paddingLeft={0}>
            <Progress
                value={amountLeft}
                opacity={100}
                colorScheme={'progress'}
                aria-label='spending-progress-bar'
                height={'20px'}
                width={'60px'}
                style={{ transform: 'rotate(270deg)' }}
                min={0}
                max={TOTAL_BIL_AMOUNT}
            />
            <TagLabel
                overflow={'none'}
                mt={'80px'}
                ml={'-50px'}
                backgroundColor={'white'}
            >
                ${divideByBillion(amountLeft)}B
            </TagLabel>
        </Tag>,
        div
    );
}

function divideByBillion(value: number): number {
    return Math.round(value / 1000000000);
}
