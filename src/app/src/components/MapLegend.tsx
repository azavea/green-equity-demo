import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { AmountCategory } from '../types';
import useIsMobileMode from '../useIsMobileMode';

export default function MapLegend({
    categories,
    label,
    monetary,
}: {
    categories: AmountCategory[];
    label: string;
    monetary: boolean;
}) {
    const isMobileMode = useIsMobileMode();

    const monetaryLabel = (
        category: AmountCategory,
        nextCategory: AmountCategory | undefined
    ) => {
        if (nextCategory) {
            return `$${category.min.toLocaleString()}-$${(
                nextCategory.min - 1
            ).toLocaleString()}`;
        }
        return `$${category.min.toLocaleString()}+`;
    };

    const percentLabel = (
        category: AmountCategory,
        _nextCategory: AmountCategory | undefined
    ) => {
        return `${category.min * 100}%`;
    };

    const getLabel = monetary ? monetaryLabel : percentLabel;

    return (
        <VStack
            p={10}
            pt={isMobileMode ? 10 : '70px'}
            zIndex={1}
            alignSelf={isMobileMode ? 'center' : 'end'}
            minWidth={isMobileMode ? '100%' : '520px'}
        >
            <Text alignSelf='flex-start' fontSize={24}>
                {label}
            </Text>
            <HStack width='100%' spacing={0.5}>
                {[...categories]
                    .reverse()
                    .map((category, index, categories) => {
                        const nextCategory = categories[index + 1];

                        return (
                            <VStack flex={1} key={category.min}>
                                <Box
                                    height={isMobileMode ? '20px' : '30px'}
                                    width='100%'
                                    background={category.color}
                                />
                                <Text
                                    fontSize={isMobileMode ? 12 : 14}
                                    alignSelf='flex-start'
                                >
                                    {getLabel(category, nextCategory)}
                                </Text>
                            </VStack>
                        );
                    })}
            </HStack>
        </VStack>
    );
}
