/*
    This file is almost valid in both Javascript and Typescript
    For JS development, change this file's extension to jsx and
    remove the bang (!) from line 14, so that it looks like so:
    `const root = createRoot(document.getElementById('root'));`
*/
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';

import App from './App';
import theme from './theme';
import { store } from './store';

import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';

import '../node_modules/leaflet/dist/leaflet.css';

import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider>
        </Provider>
    </React.StrictMode>
);
