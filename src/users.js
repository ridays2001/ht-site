const express = require('express');
const router = express.Router();
const { firestore: db } = require('./util/db');
const { authenticate } = require('./util/authenticate');

router.get('/', (req, res) => {
	const auth = authenticate(undefined, req.cookies);
	if (auth) return res.redirect(`/users/${req.cookies.username}`);
	console.log('Redirected back to login page.');
	return res.redirect(403, '/login');
});

router.get('/:user', async (req, res) => {
	const user = req.params.user;
	if (!user) return res.redirect(403, '/login');
	const auth = authenticate(undefined, req.cookies);
	if (!auth) {
		console.log('Redirected to login.');
		return res.redirect('/login');
	}

	const data = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	return res.render('userPage', { name: data.name, rank: data.rank });
});

module.exports = router;
