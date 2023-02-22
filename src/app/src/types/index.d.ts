export {};

declare global {
    interface Window {
        ENVIRONMENT: Record<string, string>;
    }
}

export type AmountCategory = {
    min: number;
    color: string;
    size: number;
};
