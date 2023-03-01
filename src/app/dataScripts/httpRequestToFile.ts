import { FileHandle } from 'node:fs/promises';
import https from 'node:https';

export default function httpsRequestToFile({
    url,
    fileHandle,
    options = {},
    body,
}: {
    url: string;
    fileHandle: FileHandle;
    options?: https.RequestOptions;
    body?: string;
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
                response.on('data', data => {
                    fileHandle.write(data);
                });

                response.on('end', () => {
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
