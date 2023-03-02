/*
    This file is valid in both Javascript and Typescript
*/
import { extendTheme } from '@chakra-ui/react';
import { spendingTooltipCardStyle } from './components/SpendingTooltip';

const theme = extendTheme({
    components: {
        Heading: {
            variants: {
                title: {
                    fontSize: '24pt',
                },
                subtitle: {
                    fontSize: '20pt',
                },
            },
        },
        Card: spendingTooltipCardStyle,
        Link: {
            baseStyle: {
                textDecoration: 'underline',
            },
        },
    },
    fonts: {
        heading: `'Lato', 'Helvetica', sans-serif`,
        body: `'Lato', 'Arial', sans-serif`,
    },
    colors: {
        tooltip: {
            500: '#465EB5',
        },
        progress: {
            500: '#000000',
        },
    },
});

export default theme;
