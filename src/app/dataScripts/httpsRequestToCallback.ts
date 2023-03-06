import https from 'node:https';

export default function httpsRequestToCallback({
    url,
    options = {},
    body,
    onDataResponse,
}: {
    url: string;
    options?: https.RequestOptions;
    body?: string;
    onDataResponse: (parsedResult: any) => void;
}): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = https.request(
            url,
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers ?? {}),
                },
                ...options,
            },
            response => {
                let completeData: string = '';
                response.on('data', chunk => {
                    if (chunk) {
                        completeData += chunk.toString();
                    }
                });

                response.on('end', () => {
                    onDataResponse(JSON.parse(completeData));
                    resolve();
                });
            }
        );

        request.on('error', error => reject(error));

        if (body) {
            request.write(body);
        }

        request.end();
    });
}
