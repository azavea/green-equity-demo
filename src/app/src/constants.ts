export enum SITE_URL {
    HOME = '/home',
    PER_CAPITA_MAP = '/per-capita',
    ANIMATED_MAP = '/animated',
}

export const PAGE_LABELS: Record<string, string> = {
    [SITE_URL.HOME]: 'Home',
    [SITE_URL.PER_CAPITA_MAP]: 'Per Capita Map',
    [SITE_URL.ANIMATED_MAP]: 'Animated Map',
};

export const AZAVEA_URL = 'https://www.azavea.com/';
