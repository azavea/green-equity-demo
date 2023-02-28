import { Box, HStack } from '@chakra-ui/react';

import { Category } from '../enums';

export default function SpendingCategorySelector({
    value,
    onChange,
}: {
    value?: Category,
    onChange: (category?: Category) => void,
}) {
    function CategoryButton({
        category,
        isFirst,
        isLast,
    }: {
        category?: Category,
        isFirst?: boolean,
        isLast?: boolean,
    }) {
        const isSelected = category === value;

        return (
            <Box
                style={{
                    border: '1px solid #465EB5',
                    borderLeftWidth: !isFirst ? 0.5 : 1,
                    borderRightWidth: !isLast ? 0.5 : 1,
                    margin: 0,
                    padding: 10,
                    fontSize: 18,
                    background: isSelected
                        ? 'rgba(32, 81, 255, 0.21)'
                        : undefined,
                    cursor: 'pointer',
                }}
                _hover={{ background: 'rgba(32, 81, 255, 0.21)' }}
                onClick={() => onChange(category)}
            >
                {category ?? 'All categories'}
            </Box>
        );
    }

    return (
        <HStack mb={10}>
            <CategoryButton isFirst />
            <CategoryButton category={Category.BROADBAND} />
            <CategoryButton category={Category.CLIMATE} />
            <CategoryButton category={Category.TRANSPORTATION} />
            <CategoryButton category={Category.OTHER} isLast />
        </HStack>
    );
}
