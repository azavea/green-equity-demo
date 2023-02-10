import { Box, Text } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

import { SITE_URL, PAGE_LABELS } from '../constants';

export default function SiteHeader() {
    const { pathname } = useLocation();

    return (
        <Box w='100%' backgroundColor='gray.100' p={4}>
            <Text variant='headerTitle'>
                <Link to={SITE_URL.HOME}>Green Equity Demo</Link>
                &nbsp;-&nbsp;{PAGE_LABELS[pathname]}
            </Text>
        </Box>
    );
}
