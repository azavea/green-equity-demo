import { HStack, Text, VStack } from '@chakra-ui/react';

import { AMOUNT_CATEGORIES } from '../constants';
import PersonIcon from './PersonIcon';

export default function PerCapitaMapLegend() {
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
            <HStack alignItems='end' justifyContent='end' spacing={5} w='100%'>
                {[...AMOUNT_CATEGORIES]
                    .reverse()
                    .map((category, index, categories) => {
                        const nextCategory = categories[index + 1];
                        const label = nextCategory
                            ? `$${category.min.toLocaleString()} - $${(
                                  nextCategory.min - 1
                              ).toLocaleString()}`
                            : `$${category.min.toLocaleString()}+`;

                        return (
                            <VStack
                                w={120}
                                key={category.min}
                                background='white'
                                zIndex={600}
                            >
                                <PersonIcon
                                    color={category.color}
                                    size={`${category.size}px`}
                                />
                                <Text>{label}</Text>
                            </VStack>
                        );
                    })}
            </HStack>
        </VStack>
    );
}
