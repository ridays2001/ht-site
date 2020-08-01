// Import modules.
const sentry = require('../util/sentry');
const authenticate = require('../util/authenticate');
const userData = require('../util/userData');
const { navData } = require('../util/navData');

const express = require('express');
const router = express.Router();

const checkAuth = async (user, req, res) => {
	const { auth } = await authenticate(undefined, req.cookies);
	if (!auth) {
		res.redirect('/auth/login');
		return false;
	}

	if (req.cookies.username !== user) {
		const err = `Authority Mismatch: ${req.cookies.username} cannot access the profile of ${user}.`;
		console.log(err);
		sentry.withScope(scope => {
			scope.setLevel('warning');
			scope.setTag('IP', req.ip);
			sentry.captureMessage(err);
		});
		res.redirect('/auth/logout');
		return false;
	}

	return true;
};

router.get('/', async (req, res) => {
	const { auth } = await authenticate(undefined, req.cookies);
	if (auth) return res.redirect(`/users/${req.cookies.username}`);
	return res.redirect('/auth/login');
});

router.get('/:user', async (req, res) => {
	const user = req.params.user;
	const auth = await checkAuth(user, req, res);
	if (!auth) return undefined;
	const nav = await navData(req.cookies);
	const data = await userData.userData(user);
	return res.render('users/profile', { profileActive: true, ...data, ...nav });
});

router.get('/:user/assignments', async (req, res) => {
	const user = req.params.user;
	const auth = await checkAuth(user, req, res);
	if (!auth) return undefined;
	const nav = await navData(req.cookies);
	const data = await userData.assignments(user);
	return res.render('users/assignments', { assignmentsActive: true, ...data, ...nav });
});

router.get('/:user/notes', async (req, res) => {
	const user = req.params.user;
	const auth = await checkAuth(user, req, res);
	if (!auth) return undefined;
	const data = await userData.notes(user);
	const nav = await navData(req.cookies);
	return res.render('users/notes', { notesActive: true, ...data, ...nav });
});

router.get('/:user/attendance', async (req, res) => {
	const user = req.params.user;
	const auth = await checkAuth(user, req, res);
	if (!auth) return undefined;
	let data = {};
	if (req.query.month) data = await userData.attendance(user, req.query.month);
	else data = await userData.attendance(user);
	const nav = await navData(req.cookies);
	return res.render('users/attendance', { attActive: true, ...data, ...nav });
});

router.get('/:user/daily-logs', async (req, res) => {
	const user = req.params.user;
	const auth = await checkAuth(user, req, res);
	if (!auth) return undefined;
	const data = await userData.dailyLogs(user);
	const nav = await navData(req.cookies);
	return res.render('users/daily-logs', { dailyActive: true, ...data, ...nav });
});

router.get('/:user/marks', async (req, res) => {
	const user = req.params.user;
	const auth = await checkAuth(user, req, res);
	if (!auth) return undefined;
	const link = await userData.marks(user);
	return res.redirect(link);
});

router.get('/:user/syllabus', async (req, res) => {
	const user = req.params.user;
	const auth = await checkAuth(user, req, res);
	if (!auth) return undefined;
	const link = await userData.syllabus(user);
	return res.redirect(link);
});

module.exports = router;
