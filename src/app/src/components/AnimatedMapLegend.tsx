import { HStack, Box } from '@chakra-ui/react';

export function ColorRangeBox({ bg, text }: { bg: string; text?: String }) {
    return (
        <Box
            w='70px'
            h='40px'
            bg={bg}
            textAlign={'center'}
            color={'white'}
            fontSize={'sm'}
            pt='8px'
        >
            {text}
        </Box>
    );
}

export default function AnimatedMapLegend() {
    return (
        <Box width='100%' pl='20%'>
            <HStack spacing='0px' border={'1px'} width='210px'>
                <ColorRangeBox bg='white' />
                <ColorRangeBox bg='#94A4DF' text='≥1% BIL' />
                <ColorRangeBox bg='#465EB5' text='≥2% BIL' />
            </HStack>
        </Box>
    );
}
