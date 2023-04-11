import { Box, HStack, Select } from '@chakra-ui/react';

import useIsMobileMode from '../../useIsMobileMode';
import { Category } from '../../enums';
import theme from '../../theme';

export default function SpendingCategorySelector({
    value,
    onChange,
}: {
    value: Category;
    onChange: (category: Category) => void;
}) {
    const isMobileMode = useIsMobileMode();

    function CategoryButton({
        category,
        isFirst,
        isLast,
    }: {
        category: Category;
        isFirst?: boolean;
        isLast?: boolean;
    }) {
        const isSelected = category === value;

        return (
            <Box
                style={{
                    border: `1px solid ${theme.colors.green[300]}`,
                    borderLeftWidth: !isFirst ? 0.5 : 1,
                    borderRightWidth: !isLast ? 0.5 : 1,
                    margin: 0,
                    padding: 10,
                    fontSize: 18,
                    background: isSelected ? theme.colors.green[50] : undefined,
                    cursor: 'pointer',
                }}
                _hover={{ background: theme.colors.green[50] }}
                onClick={() => onChange(category)}
            >
                {category}
            </Box>
        );
    }

    return (
        <Box mb={75} zIndex={1} width='100%' pl={10} pr={10}>
            {isMobileMode ? (
                <Select
                    value={value}
                    onChange={event => onChange(event.target.value as Category)}
                >
                    <option value={Category.ALL}>{Category.ALL}</option>
                    <option value={Category.BROADBAND}>
                        {Category.BROADBAND}
                    </option>
                    <option value={Category.CIVIL_WORKS}>
                        {Category.CIVIL_WORKS}
                    </option>
                    <option value={Category.CLIMATE}>{Category.CLIMATE}</option>
                    <option value={Category.TRANSPORTATION}>
                        {Category.TRANSPORTATION}
                    </option>
                    <option value={Category.OTHER}>{Category.OTHER}</option>
                </Select>
            ) : (
                <HStack justifyContent='center'>
                    <CategoryButton category={Category.ALL} isFirst />
                    <CategoryButton category={Category.BROADBAND} />
                    <CategoryButton category={Category.CIVIL_WORKS} />
                    <CategoryButton category={Category.CLIMATE} />
                    <CategoryButton category={Category.TRANSPORTATION} />
                    <CategoryButton category={Category.OTHER} isLast />
                </HStack>
            )}
        </Box>
    );
}
