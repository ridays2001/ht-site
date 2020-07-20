const moment = require('moment');
require('moment-timezone');

const sentry = require('../util/sentry');
const { navData } = require('../util/navData');
const { instructor } = require('../util/userData');
const authenticate = require('../util/authenticate');
const { firestore: db } = require('../util/db');

const express = require('express');
const router = express.Router();

const checkAuth = async (user, req, res) => {
	const { auth, rank } = await authenticate(undefined, req.cookies);
	if (!auth) {
		res.redirect('/auth/login');
		return false;
	}

	if (req.cookies.username !== user) {
		let err = undefined;
		if (rank < 1) err = `Permissions Mismatch: ${req.cookies.username} does not have instructor permissions.`;
		else err = `Authority Mismatch: ${req.cookies.username} cannot access the profile of ${user}.`;

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

router.get('/:instructor', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const nav = await navData(req.cookies);
	const data = await instructor(username);
	return res.render('instructors/profile', { profileActive: true, ...data, ...nav });
});

// Announcements section.
router.get('/:instructor/announcements', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const nav = await navData(req.cookies);
	const data = await instructor(username);
	return res.render('instructors/announcements', { announcementActive: true, ...data, ...nav });
});

router.post('/:instructor/announcements', async (req, res) => {
	console.log(req.body);
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;
	const data = await db.collection('data').doc('announcements').get()
		.then(snap => snap.data()?.[req.body.student] ?? []);
	data.push(req.body);
	await db.collection('data').doc('announcements').set({ [req.body.student]: data }, { merge: true });
	return res.redirect(`/instructors/${username}/announcements`);
});

// Assignments section.
router.get('/:instructor/assignments', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const nav = await navData(req.cookies);
	const data = await instructor(username);
	return res.render('instructors/assignments', { assignmentsActive: true, ...data, ...nav });
});

router.post('/:instructor/assignments', async (req, res) => {
	console.log(req.body);
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;
	const data = await db.collection('data').doc('assignments').get()
		.then(snap => snap.data()?.[req.body.student] ?? []);
	data.push({
		...req.body,
		due: new Date(moment.tz(req.body.due, 'Asia/Kolkata').format()),
		date: new Date(moment.tz(new Date(), 'Asia/Kolkata').format())
	});
	await db.collection('data').doc('assignments').set({ [req.body.student]: data }, { merge: true });
	return res.redirect(`/instructors/${username}/assignments`);
});

// Notes section.
router.get('/:instructor/notes', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const nav = await navData(req.cookies);
	const data = await instructor(username);
	return res.render('instructors/notes', { notesActive: true, ...data, ...nav });
});

router.post('/:instructor/notes', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const data = await db.collection('data').doc('notes').get()
		.then(snap => snap.data()?.[req.body.student] ?? []);
	data.push({
		...req.body,
		date: new Date(moment.tz(new Date(), 'Asia/Kolkata').format())
	});
	await db.collection('data').doc('notes').set({ [req.body.student]: data }, { merge: true });
	return res.redirect(`/instructors/${username}/notes`);
});

// Attendance section.
router.get('/:instructor/attendance', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const nav = await navData(req.cookies);
	const data = await instructor(username);
	return res.render('instructors/attendance', { attActive: true, ...data, ...nav });
});

router.post('/:instructor/attendance', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;
});

// Daily logs section.
router.get('/:instructor/daily-logs', async (req, res) => {
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const nav = await navData(req.cookies);
	const data = await instructor(username);
	return res.render('instructors/daily-logs', { dailyActive: true, ...data, ...nav });
});

router.post('/:instructor/daily-logs', async (req, res) => {
	const { subjects, desc, student } = req.body;
	const logs = [];
	for (let i = 0; i < subjects.length; i++) logs.push({ subject: subjects[i], desc: desc[i] });
	console.log(logs);
	const username = req.params.instructor;
	const auth = await checkAuth(username, req, res);
	if (!auth) return undefined;

	const data = await db.collection('data').doc('daily-logs').get()
		.then(snap => snap.data()?.[student] ?? []);
	data.push({
		date: moment.tz(new Date(), 'Asia/Kolkata').format('Do MMM, dddd'),
		logs
	});
	await db.collection('data').doc('daily-logs').set({ [student]: data }, { merge: true });
	return res.redirect(`/instructors/${username}/daily-logs`);
});

module.exports = router;
