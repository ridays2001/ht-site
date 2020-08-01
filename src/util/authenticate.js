const moment = require('moment');
const { firestore: db } = require('./db');

module.exports = async (loginData, cookieData) => {
	const savedID = cookieData?.id;
	const savedUsername = cookieData?.username;
	const username = loginData?.username;
	const password = loginData?.password;
	const id = loginData?.id;
	const userAgent = loginData?.ua; // User Agent.

	// Check if the saved cookie matches the credentials in the database.
	if (savedUsername && savedID) {
		const data = await db.collection('users').doc(savedUsername).get()
			.then(snap => snap.data()?.data);
		const ids = data?.saved?.map(s => s?.id) ?? [];
		if (ids.includes(savedID)) return { auth: true, rank: data.rank };
	}

	// Check if the login credentials entered match with the database.
	if (username) {
		const data = await db.collection('users').doc(username).get()
			.then(snap => snap.data()?.data);
		if (data?.password === password) {
			if (!data?.saved?.length) data.saved = [];
			data.saved.push({
				id,
				userAgent,
				date: moment.tz(new Date(), 'Asia/Kolkata').format('Do MMM YY, kk:mm - dddd')
			});
			await db.collection('users').doc(username).set({ data }, { merge: true });
			return { auth: true, rank: data.rank };
		}
	}

	console.log('[AUTH FAILED]');
	// Returns false in case of a failed authentication.
	return { auth: false, rank: undefined };
};
