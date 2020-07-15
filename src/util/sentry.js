/**
 * This module initializes sentry.
 * Sentry is an error tracking service which helps in improving the app performance.
 */
const sentry = require('@sentry/node');
const apm = require('@sentry/apm');

const app = require('../app');

sentry.init({
	dsn: process.env.SENTRY,
	environment: process.env.NODE_ENV,
	integrations: [
		new sentry.Integrations.Http({ tracing: true }),
		new apm.Integrations.Express({ app })
	],
	tracesSampleRate: 1.0
});
module.exports = sentry;
