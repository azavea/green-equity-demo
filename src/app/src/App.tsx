import { Center, Heading, Spacer, Text, VStack } from '@chakra-ui/react';

import PerCapitaMap from './components/PerCapitaMap';
import AnimatedMap from './components/AnimatedMap';
import DataSandbox from './components/DataSandbox';

function App() {
    return (
        <Center>
            <VStack mt={4} spacing={4}>
                <Heading variant='title'>Welcome to Green Equity</Heading>
                <Heading variant='subtitle'>
                    A demonstration project by{' '}
                    <a href='https://www.azavea.com/'>Azavea</a>
                </Heading>
                <Spacer />
                <Text>
                    This site contains two maps to help visualize how and where
                    the Bipartisan Infrastructure Law award money is being
                    spent.
                </Text>
                <Spacer />
                <PerCapitaMap />
                <AnimatedMap />
                <DataSandbox />
            </VStack>
        </Center>
    );
}

export default App;
