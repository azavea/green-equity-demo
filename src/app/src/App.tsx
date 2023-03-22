import { ReactNode, useState } from 'react';
import {
    Button,
    ButtonGroup,
    Center,
    Heading,
    Spacer,
    Text,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';

import PerCapitaMap from './components/PerCapitaMap';
import AnimatedArcsAndMap from './components/AnimatedArcsAndMap';
import DataSandbox from './components/DataSandbox';
import SimpleModal from './components/SimpleModal';
import BudgetTracker from './components/BudgetTracker';
import Attribution from './components/Attribution';

enum TopMap {
    PER_CAPITA,
    EQUITY,
}

function App() {
    const [topMap, setTopMap] = useState<TopMap>(TopMap.PER_CAPITA);

    return (
        <Center style={{ textAlign: 'center' }}>
            <VStack mt={4} spacing={4} width='100%'>
                <Heading variant='title'>Welcome to Green Equity</Heading>
                <Heading variant='subtitle'>
                    A demonstration project by{' '}
                    <a href='https://www.element84.com/'>Element 84</a>
                </Heading>
                <Spacer />
                <Text>
                    This site contains two maps to help visualize how and where
                    the Bipartisan Infrastructure Law (BIL) award money is being
                    spent.
                </Text>
                <Spacer />
                <BudgetTracker />
                <Spacer />
                <TopMapTabSelector value={topMap} onChange={setTopMap} />
                {topMap === TopMap.PER_CAPITA ? (
                    <PerCapitaMap />
                ) : topMap === TopMap.EQUITY ? null : null}
                <div style={{ height: 100 }} />
                <AnimatedArcsAndMap />
                <div style={{ height: 36 }} />
                <Attribution />
                <Spacer />
                <DataSandboxWrapper />
                <Spacer />
                <footer>©2023 Element 84</footer>
            </VStack>
        </Center>
    );
}

function TopMapTabSelector({
    value,
    onChange,
}: {
    value: TopMap;
    onChange: (value: TopMap) => void;
}) {
    const TopMapTabButton = ({
        topMap,
        children,
    }: {
        topMap: TopMap;
        children: ReactNode;
    }) => (
        <Button
            variant={value === topMap ? 'solid' : 'ghost'}
            onClick={() => onChange(topMap)}
        >
            {children}
        </Button>
    );

    return (
        <ButtonGroup zIndex={1} pb={10}>
            <TopMapTabButton topMap={TopMap.PER_CAPITA}>
                Funding per capita
            </TopMapTabButton>
            <TopMapTabButton topMap={TopMap.EQUITY}>
                Disadvantaged communities
            </TopMapTabButton>
        </ButtonGroup>
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
