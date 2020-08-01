// Configure the variables in .env into the environment.
require('dotenv').config();

// Import all dependencies.
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { flash } = require('express-flash-message');
const logger = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { FirestoreStore } = require('@google-cloud/connect-firestore');

// Import all modules.
const { firestore: db } = require('./util/db');
const { navData } = require('./util/navData');
const sentry = require('./util/sentry');
const { listening: onListening, err: onError } = require('./util/listeners');

// Initialize an express app.
const express = require('express');
const app = express();

app.set('port', process.env.PORT ?? 80); // Use port 80 for hosting.
app.set('trust proxy', 1); // Trust first proxy for security.

// Views section.
app.set('views', path.join(__dirname, './views')); // Configure views folder to use for view engine.
app.set('view engine', 'pug'); // Set view engine to pug.

// Middleware section.
app.use(sentry.Handlers.requestHandler()); // Use sentry.
app.use(sentry.Handlers.tracingHandler()); // Use sentry.
app.use(express.json()); // Parse incoming json requests.
app.use(express.urlencoded({ extended: true })); // Parse the incoming requests to urlencoded payloads
app.use(logger('dev')); // Use morgan logger to log http requests.
app.use(express.static(path.join(__dirname, 'public'))); // Configure the public folder into the sitemap.
app.use(helmet()); // Helmet package helps in setting appropriate headers for better security.
app.use(compression()); // Compression helps in increasing the site loading speed.

// Sessions and cookies section.
app.use(session({
	name: 'welcome-to-hell',
	secret: process.env.SECRET,
	cookie: {
		sameSite: 'lax',
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
	const nav = await navData(req.cookies);
	return res.render('home', { homeActive: true, ...nav });
});

app.get('/gallery', async (req, res) => {
	const nav = await navData(req.cookies);
	const data = await db.collection('data').doc('gallery').get()
		.then(snap => snap.data() ?? {});
	data.events.reverse();
	return res.render('gallery', { galleryActive: true, ...data, ...nav });
});

// Legal section.
app.get('/terms', async (req, res) => {
	const nav = await navData(req.cookies);
	return res.render('legal/terms', { tosActive: true, ...nav });
});
app.get('/privacy', async (req, res) => {
	const nav = await navData(req.cookies);
	return res.render('legal/privacy', { privacyActive: true, ...nav });
});
app.get('/disclaimer', async (req, res) => {
	const nav = await navData(req.cookies);
	return res.render('legal/disclaimer', { disclaimerActive: true, ...nav });
});

// Redirect common paths for terms and conditions.
app.get('/tos', (_req, res) => res.redirect(301, '/terms'));
app.get('/tnc', (_req, res) => res.redirect(301, '/terms'));

// Use router modules.
app.use('/users', require('./routers/users'));
app.use('/instructors', require('./routers/instructors'));
app.use('/auth', require('./routers/auth'));
app.use('/contact', require('./routers/contact'));

// Error handling section.
app.use(sentry.Handlers.errorHandler());
app.use((req, res) => {
	// Pass the 404 error message to Sentry.
	sentry.withScope(scope => {
		scope.setTag('IP', req.ip);
		if (req.cookies.username) scope.setTag('Username', req.cookies.username);
		sentry.captureMessage(`[404] ${req.url}`);
	});
	// Redirect 404 errors to home page.
	return res.status(404).redirect('/');
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
