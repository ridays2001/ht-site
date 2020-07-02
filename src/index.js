// Configure the variables in .env into the environment.
require('dotenv').config();

// Import all dependencies.
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const http = require('http');
const { listening: onListening } = require('./util/listening');
const { err: onError } = require('./util/error');
const { firestore: db } = require('./util/db');

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
	saveUninitialized: true
})); // Use sessions in the app.
app.use(cookieParser(process.env.SECRET)); // Use cookies in the app.
app.use(logger('dev')); // Use morgan logger to log http requests.
app.use(express.static(path.join(__dirname, 'public'))); // Configure the public folder into the sitemap.

app.get('/', (req, res) => {
	const viewport = req.headers['user-agent'].toLowerCase();
	let device = undefined;
	if (viewport.includes('android') || viewport.includes('iphone') || viewport.includes('ipad')) device = 'mobile';
	else device = 'desktop';
	res.render('index', { view: device });
});

app.use('/users', require('./users'));

app.get('/login', (_req, res) => {
	res.render('login');
});

app.post('/login', async (req, res) => {
	const username = req.body.username;
	const password = req.body.pass;
	const { data } = await db.collection('users').doc(username).get()
		.then(snap => snap.data());
	if (!data) return res.redirect(303, '/login');
	if (data.password === password) {
		// Set a cookie. This chunk will be added in some time.
	}
	return res.redirect(303, '/login');
});

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
