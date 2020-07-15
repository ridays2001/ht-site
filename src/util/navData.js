const { authenticate } = require('./authenticate');
const { firestore: db } = require('./db');

// A function to set navbar data.
exports.navData = async cookies => {
	const { username: user } = cookies;
	const auth = await authenticate(undefined, cookies);

	if (!auth) return [];

	let rank = undefined;
	let marksExists = false;
	let syllabusExists = false;

	const data = await db.collection('users').doc(user).get()
		.then(snap => snap.data);

	// Set rank for the section header.
	if (data.rank === 0) rank = 'Student';
	else if (data.rank === 1) rank = 'Instructor';
	else rank = 'Admin';

	/**
	* The pre-primary students don't have a definite syllabus and marks record.
	* Though the students registered for additional courses have syllabus for the additional course.
	* So, we determine if this student has those data in db or not.
	*/
	if (data.marks) marksExists = true;
	if (data.syllabus) syllabusExists = true;

	return {
		rank,
		marksExists,
		syllabusExists,
		user
	};
};
