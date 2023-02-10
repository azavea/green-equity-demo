/*
    This file is valid in both Javascript and Typescript
*/
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    fonts: {
        heading: `'Helvetica', sans-serif`,
        body: `'Arial', sans-serif`,
    },
});

export default theme;
