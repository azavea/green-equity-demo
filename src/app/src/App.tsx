import {
    Button,
    Center,
    Heading,
    Spacer,
    Text,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';

import PerCapitaMap from './components/PerCapitaMap';
import AnimatedMap from './components/AnimatedMap';
import DataSandbox from './components/DataSandbox';
import SimpleModal from './components/SimpleModal';
import BudgetTracker from './components/BudgetTracker';

function App() {
    return (
        <Center>
            <VStack mt={4} spacing={4} width='100%'>
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
                <BudgetTracker />
                <Spacer />
                <PerCapitaMap />
                <div style={{ height: 100 }} />
                <AnimatedMap />
                <DataSandboxWrapper />
            </VStack>
        </Center>
    );
}

function DataSandboxWrapper() {
    const { isOpen, onClose, getButtonProps } = useDisclosure();

    return (
        <>
            <Button {...getButtonProps()}>Show Data Sandbox</Button>
            <SimpleModal
                title='Data Sandbox'
                isOpen={isOpen}
                onClose={onClose}
                size='2xl'
            >
                <DataSandbox />
            </SimpleModal>
        </>
    );
}

export default App;
