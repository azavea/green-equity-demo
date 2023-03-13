import https from 'node:https';

export default function httpsRequest<T>({
    url,
    options = {},
    body,
}: {
    url: string;
    options?: https.RequestOptions;
    body?: string;
}): Promise<T> {
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
                    resolve(JSON.parse(completeData));
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
