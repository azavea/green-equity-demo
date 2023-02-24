import { cardAnatomy } from '@chakra-ui/anatomy'
import {
    createMultiStyleConfigHelpers,
    Box,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Heading,
    Stack,
    StackDivider,
    StyleFunctionProps,
    Text,
} from '@chakra-ui/react'
import { abbreviateNumber } from '../util';

export default function SpendingTooltip({
    state, dollarsPerCapita, funding, population
}: {
    state: string;
    dollarsPerCapita: number,
    funding: number,
    population: number,
}) {
    return (
        <Card variant="spendingTooltip">
            <CardHeader>
                <Heading size='sm'>{state}</Heading>
            </CardHeader>
            <CardBody>
                <Stack divider={<StackDivider />} spacing={2}>
                    <Box>
                        <Text fontWeight={'bold'}>Dollars per capita: ${Math.round(
                            dollarsPerCapita).toLocaleString()}</Text>
                    </Box>
                    <Box>
                        <Text fontWeight={'medium'}>Funding: ${abbreviateNumber(funding)}</Text>
                        <Text fontWeight={'medium'}>Population: {abbreviateNumber(population)}</Text>
                    </Box>
                    <Box>
                        <Text>Transportation:</Text>
                        <Text>Climate:</Text>
                        <Text>Broadband:</Text>
                        <Text>Other:</Text>
                    </Box>
                    <Box>{/* Empty box to generate divider before footer */}</Box>
                </Stack>
            </CardBody>
            <CardFooter justify='right'>
                <Text>See more details</Text>
            </CardFooter>
        </Card>
    );
};


const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(cardAnatomy.keys);

const variants = {
    spendingTooltip: (props: StyleFunctionProps) => definePartsStyle({
        container: {
            ...props.theme.components.Card.variants.elevated.container,
            overflow: 'clip', // https://github.com/twbs/bootstrap/issues/37010
            width: '194px',
            padding: '0',
            border: '0',
        },
        header: {
            ...props.theme.components.Card.variants.elevated.header,
            height: '44px',
            backgroundColor: "#465EB5",
            color: 'white',
            fontWeight: 'semibold',
            paddingLeft: '15px',
            paddingTop: '15px',
        },
        body: {
            paddingTop: '0.5rem', // to match <Stack spacing={2} />
            paddingLeft: '15px',
            paddingBottom: '0',
            fontWeight: 'normal',
        },
        footer: {
            paddingTop: '0',
            margin: '0',
            paddingBottom: '0.5rem', // to match <Stack spacing={2} />
            fontWeight: 'medium',
        },
    }),
};

export const spendingTooltipCardStyle = defineMultiStyleConfig({ variants });