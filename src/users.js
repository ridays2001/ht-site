const express = require('express');
const router = express.Router();
const { firestore: db } = require('./util/db');
const { authenticate } = require('./util/authenticate');
const { userData, assignments, attendance, syllabus, notes } = require('./util/userData');
const moment = require('moment');
require('moment-duration-format');

router.get('/', (req, res) => {
	const auth = authenticate(undefined, req.cookies);
	if (auth) return res.redirect(`/users/${req.cookies.username}`);
	console.log('Redirected back to login page.');
	return res.redirect(403, '/login');
});

router.get('/:user', async (req, res) => {
	const user = req.params.user;
	if (!user) return res.redirect(403, '/login');
	const auth = await authenticate(undefined, req.cookies);
	if (!auth) {
		console.log('Authentication failed. Redirected to login.');
		return res.redirect('/login');
	}

	const data = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);

	return res.render('users/user-home', {
		name: data.name,
		username: user
	});
});

router.get('/:user/assignments', async (req, res) => {
	const user = req.params.user;
	return res.render('users/assignments', await userData(user));
});

router.get('/:user/attendance', async (req, res) => {
	const user = req.params.user;
	return res.render('users/attendance', await attendance(user));
});

module.exports = router;
