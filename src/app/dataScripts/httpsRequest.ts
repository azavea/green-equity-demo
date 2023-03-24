import https from 'node:https';

type RequestParameters = {
    url: string;
    options?: https.RequestOptions;
    body?: string;
};

export default function httpsRequest({
    url,
    options = {},
    body,
}: RequestParameters): Promise<Buffer> {
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
                const chunks: Array<Buffer> = [];
                response.on('data', chunk => {
                    if (chunk) {
                        chunks.push(chunk);
                    }
                });

                response.on('end', () => {
                    resolve(Buffer.concat(chunks));
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

export function httpsRequestJson<T>(parameters: RequestParameters): Promise<T> {
    return httpsRequest(parameters).then(buffer =>
        JSON.parse(buffer.toString())
    );
}
