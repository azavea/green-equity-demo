import { useEffect, useState } from 'react';
import {
    Center,
    CircularProgress,
    Heading,
    Spacer,
    Box,
    IconButton,
    Progress,
    Tag,
    TagLabel,
    VStack,
} from '@chakra-ui/react';

import UsaMapContainer from '../UsaMapContainer';
import MapLegend from '../MapLegend';
import TimeControlIcon from './TimeControlIcon';

import AnimatedMap from './AnimatedMap';
import { useGetSpendingOverTimeQuery } from '../../api';
import { getSpendingByStateAtTime, PROGRESS_FINAL_STEP } from '../../util';
import { AMOUNT_CATEGORIES, MONTHLY_TIME_DURATION } from '../../constants';
import AnimatedTotalSpendingBucket from './AnimatedTotalSpendingBucket';

export default function AnimatedArcsAndMap() {
    const { data, isFetching } = useGetSpendingOverTimeQuery();

    const [timeValue, setTimeValue] = useState(0);
    const [spendingAtTimeByState, setSpendingAtTimeByState] = useState(
        data && getSpendingByStateAtTime(1, data)
    );
    const [animationEnabled, setAnimationEnabled] = useState(false);
    const [restartTimeControl, setRestartTimeControl] = useState(false);

    useEffect(() => {
        timeValue % 1 === 0 &&
            data &&
            setSpendingAtTimeByState(getSpendingByStateAtTime(timeValue, data));
    }, [timeValue, data]);

    useEffect(() => {
        if (timeValue === PROGRESS_FINAL_STEP) {
            setAnimationEnabled(false);
            setRestartTimeControl(true);
        }
    }, [timeValue]);

    useEffect(() => {
        if (animationEnabled) {
            const monthlyInterval = setInterval(() => {
                setTimeValue(
                    currentTimeValue =>
                        Math.round((currentTimeValue + 0.1) * 10) / 10
                );
            }, MONTHLY_TIME_DURATION / 10);
            return () => {
                clearInterval(monthlyInterval);
            };
        }
    }, [animationEnabled, setTimeValue]);

    function onSelectTimeAnimation() {
        if (restartTimeControl) {
            setTimeValue(0);
            setRestartTimeControl(false);
        }
        setAnimationEnabled(true);
    }

    return (
        <>
            <Heading variant='subtitle'>
                Allocation of awarded funding over time
            </Heading>
            <Spacer></Spacer>
            {data && spendingAtTimeByState && !isFetching ? (
                <VStack width='100%' justifyContent='center'>
                    <UsaMapContainer negativeMargin>
                        <AnimatedTotalSpendingBucket
                            spendingAtTimeByState={spendingAtTimeByState}
                        />
                        <AnimatedMap
                            animationEnabled={animationEnabled}
                            spendingAtTimeByState={spendingAtTimeByState}
                        />
                    </UsaMapContainer>
                    <MapLegend
                        categories={AMOUNT_CATEGORIES}
                        label='Dollars per capita'
                        monetary
                    />
                    <Box width='100%' textAlign={'center'}>
                        <IconButton
                            aria-label='Play time progress animation'
                            icon={
                                <TimeControlIcon restart={restartTimeControl} />
                            }
                            mr='25px'
                            background='none'
                            onClick={onSelectTimeAnimation}
                            isDisabled={animationEnabled}
                            size='lg'
                        />
                        <Tag width='60%' maxWidth={'750px'} background='none'>
                            <TagLabel mt='-30px' mr='-35px' overflow={'none'}>
                                2021
                            </TagLabel>
                            <Progress
                                value={timeValue}
                                opacity={100}
                                colorScheme={'progress'}
                                aria-label='date-time-progress-bar'
                                min={0}
                                max={PROGRESS_FINAL_STEP}
                                width='100%'
                                maxWidth={'750px'}
                                height='20px'
                                mt='10px'
                                display={'inline-block'}
                            />
                            <TagLabel mt='-30px' ml='-35px' overflow={'none'}>
                                Now
                            </TagLabel>
                        </Tag>
                    </Box>
                </VStack>
            ) : (
                <Center p={4}>
                    <CircularProgress isIndeterminate />
                </Center>
            )}
        </>
    );
}
