import axios from 'axios';

axios.defaults.baseURL = '/api';
// Used to make authenticated HTTP requests to Django
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
export const API = axios.create({
    headers: {
        credentials: 'same-origin',
    },
});

export async function getExample() {
    return new Promise((resolve, reject) => {
        const url = '/example/';
        API.get(url, { timeout: 1500 })
            .then(response => response.data)
            .then(resolve)
            .catch(error => reject(`Error retrieving ${url}: ${error}`));
    });
}
