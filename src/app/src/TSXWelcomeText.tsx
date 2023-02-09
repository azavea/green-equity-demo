import { Box, Heading, Text } from '@chakra-ui/react';
import env from './env';

function TSXWelcomeText({ headingText }: {
    headingText: string,
}) {
    const token = env("REACT_APP_MAPBOX_TOKEN")
    return (
        <Box mt='300px'>
            <Heading>{headingText}</Heading>
            <Text mt='10px'>
                Edit <Text as='kbd'>theme.js</Text> to adjust the style for the
                app.
            </Text>
            <Text mt='10px'>
                Access env vars in the frontend using the function <Text as='kbd'>env</Text>
                . For instance <Text as='kbd'>{token}</Text>.
            </Text>
        </Box>
    );
}

export default TSXWelcomeText;
