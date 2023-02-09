const { createProxyMiddleware } = require('http-proxy-middleware');

const pathsToProxy = Object.freeze(['/api', '/web']);
const djangoProxyTarget = Object.freeze({ target: 'http://django:8080' });

const createProxies = app =>
    pathsToProxy.forEach(path =>
        app.use(createProxyMiddleware(path, djangoProxyTarget))
    );

module.exports = createProxies;
