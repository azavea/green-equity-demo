/*
    This file is valid in both Javascript and Typescript
*/
import { Container } from '@chakra-ui/react';
import JSXLink from './JSXLink';
import TSXWelcomeText from './TSXWelcomeText';

function App() {
    return (
        <Container maxWidth='650px'>
            <TSXWelcomeText headingText='Welcome to the app template!' />
            <JSXLink text='Learn more about Chakra' />
        </Container>
    );
}

export default App;
