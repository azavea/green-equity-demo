import { useBreakpoint } from '@chakra-ui/react';

export default function useIsMobileMode() {
    const breakpoint = useBreakpoint();

    return ['base', 'sm'].includes(breakpoint);
}
