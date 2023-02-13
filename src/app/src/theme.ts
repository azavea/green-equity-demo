/*
    This file is valid in both Javascript and Typescript
*/
import { extendTheme } from '@chakra-ui/react';

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
    },
    fonts: {
        heading: `'Helvetica', sans-serif`,
        body: `'Arial', sans-serif`,
    },
});

export default theme;
