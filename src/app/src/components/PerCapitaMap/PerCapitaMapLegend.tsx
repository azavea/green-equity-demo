import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { AMOUNT_CATEGORIES } from '../../constants';
import useIsMobileMode from '../../useIsMobileMode';

export default function PerCapitaMapLegend() {
    const isMobileMode = useIsMobileMode();

    return (
        <VStack
            p={10}
            pt={isMobileMode ? 10 : '70px'}
            zIndex={1}
            alignSelf={isMobileMode ? 'center' : 'end'}
            minWidth={isMobileMode ? '100%' : '520px'}
        >
            <Text alignSelf='flex-start' fontSize={24}>
                Dollars per capita
            </Text>
            <HStack width='100%' spacing={0.5}>
                {[...AMOUNT_CATEGORIES]
                    .reverse()
                    .map((category, index, categories) => {
                        const nextCategory = categories[index + 1];
                        const label = nextCategory
                            ? `$${category.min.toLocaleString()}-$${(
                                  nextCategory.min - 1
                              ).toLocaleString()}`
                            : `$${category.min.toLocaleString()}+`;

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
                                    {label}
                                </Text>
                            </VStack>
                        );
                    })}
            </HStack>
        </VStack>
    );
}
