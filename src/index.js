// Configure the variables in .env into the environment.
require('dotenv').config();

// Import all dependencies.
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { flash } = require('express-flash-message');
const logger = require('morgan');
const http = require('http');
const { FirestoreStore } = require('@google-cloud/connect-firestore');
const sentry = require('@sentry/node');

// Import all modules.
const { authenticate } = require('./util/authenticate');
const { firestore: db } = require('./util/db');
const { listening: onListening, err: onError } = require('./util/listeners');

// Initialize an express app.
const express = require('express');
const app = express();

sentry.init({ dsn: process.env.SENTRY });

app.set('port', process.env.PORT ?? 80); // Use port 80 for hosting.

// Views section.
app.set('views', path.join(__dirname, './views')); // Configure views folder to use for view engine.
app.set('view engine', 'pug'); // Set view engine to pug.

// Middleware section.
app.use(sentry.Handlers.requestHandler()); // Use sentry.
app.use(express.json()); // Parse incoming json requests.
app.use(express.urlencoded({ extended: true })); // Parse the incoming requests to urlencoded payloads
app.use(logger('dev')); // Use morgan logger to log http requests.
app.use(express.static(path.join(__dirname, 'public'))); // Configure the public folder into the sitemap.

// Sessions and cookies section.
app.use(session({
	name: 'welcome-to-hell',
	secret: process.env.SECRET,
	cookie: {
		sameSite: 'lax',
		secure: true,
		httpOnly: true,
		maxAge: 3600000
	},
	resave: false,
	saveUninitialized: true,
	store: new FirestoreStore({ dataset: db })
})); // Use sessions in the app.
app.use(cookieParser(process.env.SECRET)); // Use cookies in the app.
app.use(flash({ sessionKeyName: 'notifications' })); // Use flash messages.

// Handle defined routes.
app.get('/', async (req, res) => {
	let loginButton = undefined;
	const auth = await authenticate(undefined, req.cookies);
	if (auth) loginButton = 'User Home';
	else loginButton = 'Login';
	const viewport = req.headers['user-agent'].toLowerCase();
	let device = undefined;
	if (viewport.includes('android') || viewport.includes('iphone') || viewport.includes('ipad')) device = 'mobile';
	else device = 'desktop';
	res.render('index', { view: device, loginButton });
});
app.get('/home', (_req, res) => res.render('home'));
app.get('/contact', (req, res) => {
	const viewport = req.headers['user-agent'].toLowerCase();
	let device = undefined;
	if (viewport.includes('android') || viewport.includes('iphone') || viewport.includes('ipad')) device = 'mobile';
	else device = 'desktop';
	res.render('contact', { view: device });
});

// Legal section.
app.get('/terms', (_req, res) => res.render('legal/terms'));
app.get('/privacy', (_req, res) => res.render('legal/privacy'));
app.get('/disclaimer', (_req, res) => res.render('legal/disclaimer'));

// Redirect common paths for terms and conditions.
app.get('/tos', (_req, res) => res.redirect(301, '/terms'));
app.get('/tnc', (_req, res) => res.redirect(301, '/terms'));

// Use router modules.
app.use('/users', require('./routers/users'));
app.use('/auth', require('./routers/auth'));

// Error handling section.
app.use(sentry.Handlers.errorHandler());
app.use((_req, res) => {
	res.status(404).redirect('/');
});

// Error handler.
app.use((err, req, res) => {
	// Only provide errors on localhost.
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : undefined;

	// Send the error.
	res.status(err.statusCode ?? 500);
	res.render('error', { error: err });
});

// Node server section.
const server = http.createServer(app);
server.listen(process.env.PORT ?? 80);
server.on('listening', onListening);
server.on('error', onError);
