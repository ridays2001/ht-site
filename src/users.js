const express = require('express');
const router = express.Router();
const { firestore: db } = require('./util/db');

router.get('/', (req, res) => {
	const id = req.cookies.id;
	const username = req.cookies.username;
	const data = db.collection('users').doc(username).get()
		.then(snap => snap.data()?.data);
	if (data?.id === id) return res.redirect(301, `/users/${username}`);
	return res.redirect(303, '/login');
});

router.get('/:user', (req, res) => {
	if (!req.params.user) return res.status(403).redirect('/');
	const id = req.cookies.id;
	const username = req.cookies.username;
	if (id && username) {
		const data = db.collection('users').doc(username).get()
			.then(snap => snap.data()?.data);
		if (data?.id === id) return res.send('✅ Logged In Successfully.\nThere is no data here though.');
	}
	console.log('Redirected to login.');
	res.redirect(303, '/login');
});

module.exports = router;
