/*
    This file is valid in both Javascript and Typescript
*/
import { extendTheme } from '@chakra-ui/react';
import { spendingTooltipCardStyle } from './components/PerCapitaMap/SpendingTooltip';

const sitePadding = {
    paddingLeft: 5,
    paddingRight: 5,
};

const theme = extendTheme({
    components: {
        Heading: {
            variants: {
                title: {
                    fontSize: '24pt',
                    ...sitePadding,
                },
                subtitle: {
                    fontSize: '20pt',
                    ...sitePadding,
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
    breakpoints: {
        xs: '1em',
        sm: '30em',
        md: '48em',
        lg: '62em',
        xl: '80em',
        '2xl': '96em',
    },
});

export default theme;
