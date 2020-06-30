const express = require('express');
const router = express.Router();
const { firestore: db } = require('./util/db');

router.get('/:user', (req, res) => {
	if (!req.params.user) return res.status(403).redirect('/');

	db.collection('users').doc(req.params.user).get()
		.then(snap => console.log(snap.data()));
	return res.send('Checking...');
});

module.exports = router;
