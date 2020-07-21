const { firestore: db } = require('./db');
const moment = require('moment');
require('moment-timezone');

const sentry = require('./sentry');

// Some random photos for profile picture.
const photos = [
	'https://i.imgur.com/4nQDxYU.jpg',
	'https://i.imgur.com/ZasBiNe.jpg',
	'https://i.imgur.com/88p2tHV.jpg',
	'https://i.imgur.com/7xhsvJz.jpg',
	'https://i.imgur.com/ZRIfbNK.png',
	'https://i.imgur.com/xIaBilt.jpg',
	'https://i.imgur.com/4ltpksV.jpg',
	'https://i.imgur.com/gaqNUB2.png',
	'https://i.imgur.com/IkmiMBa.jpg',
	'https://i.imgur.com/qsCLAqS.jpg'
];

const userDB = async user => {
	const data = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data ?? { err: `Invalid username - ${user}` });

	if (data.err) {
		sentry.captureMessage(data.err);
		console.log(data.err);
	}

	if (data.name) {
		const DOB = data.DOB;
		const currentDate = moment.tz(new Date(), 'Asia/Kolkata').format('DD/MM');
		const birthday = moment.tz(DOB?._seconds * 1000, 'Asia/Kolkata').format('DD/MM');
		if (currentDate === birthday) data.birthday = true;
		data.DOB = moment.tz(DOB?._seconds * 1000, 'Asia/Kolkata').format('Do MMM, YYYY');
		data.photo = data.photo || photos[Math.floor(Math.random() * photos.length)];
	}

	return data;
};

const assignmentsDB = async user => {
	const data = [];
	const rawAssignments = await db.collection('data').doc('assignments').get()
		.then(snap => snap.data()?.[user] ?? []);

	if (rawAssignments.length) {
		rawAssignments.forEach(a => {
			const due = moment.tz(a.due?._seconds * 1000, 'Asia/Kolkata').format('Do MMM, dddd');
			const date = moment.tz(a.date?._seconds * 1000, 'Asia/Kolkata').format('Do MMM, dddd');
			data.push({ ...a, date, due });
		});
	}

	return data.reverse();
};

const notesDB = async user => {
	const data = [];
	const rawNotes = await db.collection('data').doc('notes').get()
		.then(snap => snap.data()?.[user] ?? []);

	if (rawNotes.length) {
		rawNotes.forEach(n => {
			const date = moment.tz(n.date?._seconds * 1000, 'Asia/Kolkata').format('Do MMM, dddd');
			data.push({ ...n, date });
		});
	}

	return data.reverse();
};

const attendanceDB = async (user, m) => {
	const data = {
		list: [],
		present: 0,
		absent: 0,
		holidays: 0,
		percent: 0.00,
		month: undefined,
		months: [],
		days: 0,
		calendar: []
	};
	const rawAttendance = await db.collection('data').doc('attendance').get()
		.then(snap => snap.data()?.[user] ?? {});

	let month = undefined;
	if (m) month = m;
	else month = moment().format('MMM').toLowerCase();

	Object.keys(rawAttendance).forEach(m => data.months.push(moment(m, 'MMM').format('MMMM YYYY')));

	const list = rawAttendance[month];
	data.present = list?.filter(a => a === 'p')?.length ?? 0;
	data.absent = list?.filter(a => a === 'a')?.length ?? 0;
	data.holidays = list?.filter(a => a === 'h')?.length ?? 0;
	data.percent = ((data.present / (data.present + data.absent)) * 100).toFixed(2);
	data.list = list;
	data.month = moment(month, 'MMM').format('MMMM YYYY');
	data.days = moment(month, 'MMM').daysInMonth();

	const dayOffset = moment(month, 'MMM').startOf('month').format('d');
	let week = [];
	for (let i = 0; i < dayOffset; i++) {
		week.push('\t');
	}
	for (let i = 1; i <= data.days; i++) {
		// Mark attendance status for the student.
		let status = undefined;
		if (list.length) {
			if (list[i - 1] === 'p') status = 'bg-success'; // Green
			else if (list[i - 1] === 'a') status = 'bg-danger'; // Red
			else if (list[i - 1] === 'h') status = 'bg-warning'; // Yellow
		}

		if (week.length < 7) {
			week.push({ date: i, status });
		} else {
			data.calendar.push(week);
			week = [];
			week.push({ date: i, status });
		}
		if (i === data.days) data.calendar.push(week);
	}

	return data;
};

const students = async () => {
	const users = await db.collection('data').doc('students').get()
		.then(snap => snap.data().users);
	const students = Promise.all(users.map(u => userDB(u).then(data => ({
		name: data.name,
		DOB: data.DOB,
		grade: data.grade,
		username: u
	}))));
	return students;
};

module.exports = {
	userData: async user => {
		const data = await userDB(user);

		data.submissions = [];
		const aData = await assignmentsDB(user);
		aData.forEach(a => {
			const current = Number(moment.tz(new Date(), 'Asia/Kolkata').format('X'));
			const due = Number(moment(a.due, 'Do MMM, dddd').tz('Asia/Kolkata').format('X'));
			if (current < due) return data.submissions.push(a);
			return undefined;
		});
		if (data.submissions.length > 2) data.submissions.splice(2);

		data.newNotes = [];
		const nData = await notesDB(user);
		nData.forEach(n => {
			const current = Number(moment.tz(new Date(), 'Asia/Kolkata').format('X'));
			const given = Number(moment(n.date, 'Do MMM, dddd').tz('Asia/Kolkata').format('X'));
			if ((current - given) < 259200) return data.newNotes.push(n); // 3 days = 259200 seconds.
			return undefined;
		});
		if (data.newNotes.length > 2) data.newNotes.splice(2);

		data.announcements = await db.collection('data').doc('announcements').get()
			.then(snap => snap.data()?.[user] ?? []);

		return data;
	},
	assignments: async user => {
		const { name } = await userDB(user);
		const assignments = await assignmentsDB(user);
		return { name, user, assignments };
	},
	notes: async user => {
		const { name } = await userDB(user);
		const notes = await notesDB(user);
		return { name, user, notes };
	},
	attendance: async (user, month) => {
		const { name } = await userDB(user);
		const data = await attendanceDB(user, month);
		return { name, user, ...data };
	},
	dailyLogs: async user => {
		const { name } = await userDB(user);
		const data = await db.collection('data').doc('daily-logs').get()
			.then(snap => snap.data()?.[user] ?? []);
		data.reverse();
		return { name, user, data };
	},
	marks: async user => {
		const link = await db.collection('data').doc('marks').get()
			.then(snap => snap.data()?.[user]);
		return link;
	},
	syllabus: async user => {
		const link = await db.collection('data').doc('syllabus').get()
			.then(snap => snap.data()?.[user]?.link);
		return link;
	},
	instructor: async user => {
		const { rank, name, photo, timetable, DOB } = await userDB(user);
		if (rank < 1) {
			const err = `Insufficient permissions - ${user} does not have access to instructor modules.`;
			console.log(err);
			sentry.captureMessage(err);
			return { err };
		}

		const data = { name, photo, timetable, DOB, students: await students() };
		return data;
	},
	att: async (user, month) => {
		const calender = [];
		const data = await attendanceDB(user, month);
		for (const week of data.calendar) {
			for (const day of week) {
				if (day.date) {
					let s = day.status;
					if (s === 'bg-danger') s = 'a';
					else if (s === 'bg-success') s = 'p';
					else if (s === 'bg-warning') s = 'h';
					else s = false;
					calender.push({ d: day.date, s });
				}
			}
		}
		const { name } = await userDB(user);
		return { calender, student: { name, username: user }, month: { month: data.month, id: month } };
	}
};
