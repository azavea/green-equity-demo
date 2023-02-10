import {
    Button,
    HStack,
    Heading,
    Text,
    VStack,
    Spacer,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { AZAVEA_URL, SITE_URL } from '../constants';

export default function Home() {
    return (
        <VStack mt={4} spacing={4}>
            <Heading variant='title'>Welcome to Green Equity</Heading>
            <Heading variant='subtitle'>
                A demonstration project by <a href={AZAVEA_URL}>Azavea</a>
            </Heading>
            <Spacer />
            <Text>
                This site contains two maps to help visualize how and where the
                Bipartisan Infrastructure Law award money is being spent.
            </Text>
            <Spacer />
            <HStack>
                <Link to={SITE_URL.PER_CAPITA_MAP}>
                    <Button>Per Capita Spending Map</Button>
                </Link>
                <Link to={SITE_URL.ANIMATED_MAP}>
                    <Button>Spending Over Time Map</Button>
                </Link>
            </HStack>
        </VStack>
    );
}
