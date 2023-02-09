/*
    This file is almost valid in both Javascript and Typescript
    For JS development, change this file's extension to jsx and
    remove the bang (!) from line 14, so that it looks like so:
    `const root = createRoot(document.getElementById('root'));`
*/
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';

import App from './App';
import theme from './theme';

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>
);
