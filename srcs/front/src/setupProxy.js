const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
		'/users',
		createProxyMiddleware({
			target: 'http://3.39.20.24:3032',
			changeOrigin: true,
		})
	);
};