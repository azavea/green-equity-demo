import { HStack, Text, useBreakpointValue, VStack } from '@chakra-ui/react';

import { AMOUNT_CATEGORIES } from '../constants';
import useIsMobileMode from '../useIsMobileMode';
import PersonIcon from './PersonIcon';

export function useMarkerSizeReducer() {
    return (
        useBreakpointValue({
            xs: 10.0,
            sm: 5.0,
            md: 0,
        }) ?? 0
    );
}

export default function PerCapitaMapLegend() {
    const isMobileMode = useIsMobileMode();
    const markerSizeReducer = useMarkerSizeReducer();

    return (
        <VStack
            alignSelf='end'
            alignItems='flex-start'
            pt={50}
            pb={10}
            pr={10}
            zIndex={1}
        >
            <Text fontSize={24}>Dollars per capita</Text>
            <HStack
                alignItems='end'
                justifyContent='end'
                spacing={isMobileMode ? 1 : 5}
                w='100%'
            >
                {[...AMOUNT_CATEGORIES]
                    .reverse()
                    .map((category, index, categories) => {
                        const nextCategory = categories[index + 1];
                        const label = nextCategory
                            ? `$${category.min.toLocaleString()} - $${(
                                  nextCategory.min - 1
                              ).toLocaleString()}`
                            : `$${category.min.toLocaleString()}+`;

                        const responsiveSize =
                            category.size - markerSizeReducer;

                        return (
                            <VStack
                                w={`${isMobileMode ? 90 : 120}px`}
                                key={category.min}
                                background='white'
                                zIndex={600}
                            >
                                <PersonIcon
                                    color={category.color}
                                    size={`${responsiveSize}px`}
                                />
                                <Text fontSize={isMobileMode ? 12 : 16}>
                                    {label}
                                </Text>
                            </VStack>
                        );
                    })}
            </HStack>
        </VStack>
    );
}
