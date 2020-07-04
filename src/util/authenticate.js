const { firestore: db } = require('./db');

exports.authenticate = async (loginData, cookieData) => {
	const savedID = cookieData?.id;
	const savedUsername = cookieData?.username;
	const username = loginData?.username;
	const password = loginData?.password;
	const id = loginData?.id;

	// Check if the saved cookie matches the credentials in the database.
	if (savedUsername && savedID) {
		const data = await db.collection('users').doc(savedUsername).get()
			.then(snap => snap.data()?.data);
		if (data?.id === savedID) return true;
	}

	// Check if the login credentials entered match with the database.
	if (username) {
		const data = await db.collection('users').doc(username).get()
			.then(snap => snap.data()?.data);
		if (data?.password === password) {
			data.id = id;
			await db.collection('users').doc(username).set({ data }, { merge: true });
			return true;
		}
	}

	// Returns false in case of a failed authentication.
	return false;
};