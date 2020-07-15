
const { authenticate } = require('../util/authenticate');
const { firestore: db } = require('../util/db');
const { navData } = require('../util/navData');

const express = require('express');
const router = express.Router();

router.get('/login', async (req, res) => {
	// Check if the user already has a saved login on their device.
	if (req.cookies.id || req.cookies.username) {
		const auth = await authenticate(undefined, req.cookies);
		if (auth) return res.redirect(`/users/${req.cookies.username}`);

		// Delete cookies in case of a failed authentication.
		res.cookie('id', undefined, { maxAge: 100 });
		res.cookie('username', undefined, { maxAge: 100 });
		console.log('[AUTH FAILED] Cookies have been deleted.');
		return res.redirect('/auth/login');
	}

	// Render the login page.
	const data = await navData(req.cookies);
	return res.render('login', {
		login: true,
		...data,
		err: await req.consumeFlash('error'),
		success: await req.consumeFlash('success')
	});
});

router.post('/login', async (req, res) => {
	const auth = await authenticate({
		username: req.body.username,
		password: req.body.pass,
		id: req.session.id
	}, undefined);

	if (auth) {
		res.cookie('username', req.body.username, {
			maxAge: 3.154e+10,
			sameSite: 'lax',
			httpOnly: true,
			secure: true
		});
		res.cookie('id', req.session.id, {
			maxAge: 3.154e+10,
			sameSite: 'lax',
			httpOnly: true,
			secure: true
		});
		console.log('[AUTH SUCCESS] Cookies have been created. Redirecting to users page...');
		return res.redirect(`/users/${req.body.username}`);
	}

	// Delete old cookies, if present.
	if (req.cookies.username) res.cookie('username', undefined, { maxAge: 100 });
	if (req.cookies.id) res.cookie('id', undefined, { maxAge: 100 });

	await req.flash('error', '❌ Incorrect Login Credentials.');
	return res.redirect('/auth/login');
});

router.get('/logout', async (req, res) => {
	const { username, id } = req.cookies;
	if (username) res.cookie('username', undefined, { maxAge: 100 });
	if (id) res.cookie('id', undefined, { maxAge: 100 });
	const data = await db.collection('users').doc(username).get()
		.then(snap => snap.data()?.data);
	data.id.splice(data.id.indexOf(id), 1);
	await db.collection('users').doc(username).set({ data }, { merge: true });
	await req.flash('success', '✅ Logged out successfully.');
	return res.redirect('/auth/login');
});

module.exports = router;
