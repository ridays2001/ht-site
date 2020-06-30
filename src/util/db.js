const { Firebase } = require('firestore-db');

const db = new Firebase({
	projectId: process.env.FSPID,
	clientEmail: process.env.FSEmail,
	privateKey: process.env.FSKey
});

class Database {
	static get firestore() {
		return db.firestore();
	}
}

module.exports = Database;
