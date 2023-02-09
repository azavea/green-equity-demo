import { Button, Box, Link } from '@chakra-ui/react';

function JSXLink({ text }) {
    return (
        <Box mt='50px'>
            <Button size='md' variant='demo'>
                <Link href='https://chakra-ui.com/getting-started' isExternal>
                    {text}
                </Link>
            </Button>
        </Box>
    );
}

export default JSXLink;
