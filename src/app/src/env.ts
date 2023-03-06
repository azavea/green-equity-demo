export default function env(v: string): string | undefined {
    if (window.ENVIRONMENT && v in window.ENVIRONMENT) {
        return window.ENVIRONMENT[v];
    }

    return process.env[v];
}
