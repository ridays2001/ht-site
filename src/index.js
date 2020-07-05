// Configure the variables in .env into the environment.
require('dotenv').config();

// Import all dependencies.
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { flash } = require('express-flash-message');
const logger = require('morgan');
const http = require('http');
const { listening: onListening } = require('./util/listening');
const { err: onError } = require('./util/error');
const { authenticate } = require('./util/authenticate');

const express = require('express');
const app = express();

app.set('port', process.env.PORT ?? 8080); // Use port 80 for hosting.

app.set('views', path.join(__dirname, './views')); // Configure views folder to use for view engine.
app.set('view engine', 'pug'); // Set view engine to pug.

app.use(express.json()); // Parse incoming json requests.
app.use(express.urlencoded({ extended: true })); // Parse the incoming requests to urlencoded payloads
app.use(session({
	name: 'welcome-to-hell',
	secret: process.env.SECRET,
	cookie: {
		sameSite: 'lax',
		secure: true,
		httpOnly: true,
		path: '/',
		maxAge: 3600000
	},
	resave: false,
	saveUninitialized: true,
	store: new session.MemoryStore()
})); // Use sessions in the app.
app.use(cookieParser(process.env.SECRET)); // Use cookies in the app.
app.use(flash({ sessionKeyName: 'notifications' }));
app.use(logger('dev')); // Use morgan logger to log http requests.
app.use(express.static(path.join(__dirname, 'public'))); // Configure the public folder into the sitemap.

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

app.use('/users', require('./users'));

app.get('/login', async (req, res) => {
	// Check if the user already has saved login on their device.
	if (req.cookies.id || req.cookies.username) {
		const auth = await authenticate(undefined, req.cookies);
		if (auth) return res.redirect(`/users/${req.cookies.username}`);
		res.cookie('id', undefined, { maxAge: 100 });
		res.cookie('username', undefined, { maxAge: 100 });
		console.log('Cookies have deleted.');
		return res.redirect('/login');
	}
	const viewport = req.headers['user-agent'].toLowerCase();
	let device = undefined;
	if (viewport.includes('android') || viewport.includes('iphone') || viewport.includes('ipad')) device = 'mobile';
	else device = 'desktop';
	res.render('login', {
		view: device,
		err: await req.consumeFlash('error')
	});
});

app.post('/login', async (req, res) => {
	const loginData = {
		username: req.body.username,
		password: req.body.pass,
		id: req.session.id
	};
	const auth = await authenticate(loginData, undefined);
	if (auth) {
		res.cookie('username', loginData.username, {
			maxAge: 3.154e+10,
			sameSite: 'lax',
			secure: true,
			path: '/',
			httpOnly: true
		});
		res.cookie('id', loginData.id, {
			maxAge: 3.154e+10,
			sameSite: 'lax',
			secure: true,
			path: '/',
			httpOnly: true
		});
		console.log('Redirected to users page.');
		return res.redirect(`/users/${loginData.username}`);
	}

	// Delete old cookies after 100 ms.
	if (req.cookies.username) res.cookie('username', undefined, { maxAge: 100 });
	if (req.cookies.id) res.cookie('id', undefined, { maxAge: 100 });
	await req.flash('error', '❌ Incorrect Login Credentials.');
	return res.redirect('/login');
});

app.get('/contact', (req, res) => {
	const viewport = req.headers['user-agent'].toLowerCase();
	let device = undefined;
	if (viewport.includes('android') || viewport.includes('iphone') || viewport.includes('ipad')) device = 'mobile';
	else device = 'desktop';
	res.render('contact', { view: device });
});
app.get('/terms', (_req, res) => res.render('legal/terms'));
app.get('/privacy', (_req, res) => res.render('legal/privacy'));
app.get('/disclaimer', (_req, res) => res.render('legal/disclaimer'));

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

const server = http.createServer(app);
server.listen(process.env.PORT ?? 8080);
server.on('listening', onListening);
server.on('error', onError);
