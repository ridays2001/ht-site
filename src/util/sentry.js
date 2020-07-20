/**
 * This module initializes sentry.
 * Sentry is an error tracking service which helps in improving the app performance.
 */
const sentry = require('@sentry/node');

sentry.init({
	dsn: process.env.SENTRY,
	environment: process.env.NODE_ENV,
	integrations: [
		new sentry.Integrations.Http({ tracing: true })
	],
	tracesSampleRate: 1.0
});
module.exports = sentry;
