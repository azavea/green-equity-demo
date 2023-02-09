export {};

declare global {
  interface Window  {
        ENVIRONMENT: Record<string, string>;
    }
}