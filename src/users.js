const express = require('express');
const router = express.Router();
const { firestore: db } = require('./util/db');
const { authenticate } = require('./util/authenticate');
const { userData, assignments, attendance, syllabus, notes, marks } = require('./util/userData');
const moment = require('moment');
require('moment-duration-format');

router.get('/', (req, res) => {
	const auth = authenticate(undefined, req.cookies);
	if (auth) return res.redirect(`/users/${req.cookies.username}`);
	return res.redirect(403, '/login');
});

router.get('/:user', async (req, res) => {
	const user = req.params.user;
	if (!user) return res.redirect(403, '/login');
	const auth = await authenticate(undefined, req.cookies);
	if (!auth) return res.redirect(403, '/login');

	return res.render('users/user-home', await userData(user));
});

router.get('/:user/assignments', async (req, res) => {
	const user = req.params.user;
	const auth = await authenticate(undefined, req.cookies);
	if (!auth) return res.redirect(403, '/login');
	return res.render('users/assignments', await assignments(user));
});

router.get('/:user/notes', async (req, res) => {
	const user = req.params.user;
	const auth = await authenticate(undefined, req.cookies);
	if (!auth) return res.redirect(403, '/login');
	return res.render('users/notes', await notes(user));
});

router.get('/:user/attendance', async (req, res) => {
	const user = req.params.user;
	const auth = await authenticate(undefined, req.cookies);
	if (!auth) return res.redirect(403, '/login');
	return res.render('users/attendance', await attendance(user));
});

router.get('/:user/marks', async (req, res) => {
	const user = req.params.user;
	const auth = await authenticate(undefined, req.cookies);
	if (!auth) return res.redirect(403, '/login');
	const { link } = await marks(user);
	return res.redirect(link);
});

router.get('/:user/syllabus', async (req, res) => {
	const user = req.params.user;
	const auth = await authenticate(undefined, req.cookies);
	if (!auth) return res.redirect(403, '/login');
	const { link } = await syllabus(user);
	return res.redirect(link);
});

module.exports = router;
