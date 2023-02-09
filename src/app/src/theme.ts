/*
    This file is valid in both Javascript and Typescript
*/
import { extendTheme } from '@chakra-ui/react';

const Button = {
    variants: {
        demo: {
            bg: 'yellow.400',
        },
    },
};

const theme = extendTheme({
    components: {
        Button,
    },
    fonts: {
        heading: `'Helvetica', sans-serif`,
        body: `'Arial', sans-serif`,
    },
});

export default theme;
