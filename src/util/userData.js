const { firestore: db } = require('./db');
const moment = require('moment');
const { raw } = require('express');

exports.userData = async user => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		assignments: [],
		attendance: {
			present: 0,
			absent: 0,
			holiday: 0,
			list: [],
			month: undefined,
			days: 0
		},
		name,
		notes: [],
		syllabus: {},
		user
	};

	const rawAssignments = await db.collection('data').doc('assignments').get()
		.then(snap => snap.data()?.[user]);
	data.assignments = rawAssignments.map(a => {
		const due = moment(a.due?._seconds * 1000).format('Do MMM, dddd');
		const date = moment(a.date?._seconds * 1000).format('Do MMM, dddd');
		return { ...a, due, date };
	}).reverse();

	const rawNotes = await db.collection('data').doc('notes').get()
		.then(snap => snap.data()?.[user]);
	data.notes = rawNotes.map(n => {
		const date = moment(n.date?._seconds * 1000).format('Do MMM, dddd');
		return { ...n, date };
	}).reverse();

	const rawAttendance = await db.collection('data').doc('attendance').get()
		.then(snap => snap.data()?.[user]);
	const month = moment(new Date().setMonth()).format('MMM').toLowerCase();
	const list = rawAttendance[month];
	data.attendance.present = list?.filter(a => a === 'p')?.length;
	data.attendance.absent = list?.filter(a => a === 'a')?.length;
	data.attendance.holiday = list?.filter(a => a === 'h')?.length;
	data.attendance.list = list;
	data.attendance.month = month;
	data.attendance.days = new Array(moment().daysInMonth());

	data.syllabus = await db.collection('data').doc('syllabus').get()
		.then(snap => snap.data()?.[user]);

	return data;
};

exports.assignments = async user => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		name,
		assignments: [],
		user
	};
	const rawAssignments = await db.collection('data').doc('assignments').get()
		.then(snap => snap.data()?.[user]);
	data.assignments = rawAssignments.map(a => {
		const due = moment(a.due?._seconds * 1000).format('Do MMM, dddd');
		const date = moment(a.date?._seconds * 1000).format('Do MMM, dddd');
		return { ...a, due, date };
	}).reverse();

	return data;
};

exports.attendance = async (user, m) => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		list: [],
		present: 0,
		absent: 0,
		holidays: 0,
		month: undefined,
		days: 0,
		name,
		user
	};

	const rawAttendance = await db.collection('data').doc('attendance').get()
		.then(snap => snap.data()?.[user]);
	let month = undefined;
	if (m) month = moment(new Date().setMonth(m)).format('MMM').toLowerCase();
	else month = moment().format('MMM').toLowerCase();
	const list = rawAttendance[month];
	data.present = list?.filter(a => a === 'p')?.length;
	data.absent = list?.filter(a => a === 'a')?.length;
	data.holiday = list?.filter(a => a === 'h')?.length;
	data.list = list;
	data.month = moment(month, 'MMM').format('MMMM YYYY');
	data.days = new Array(moment(month, 'MMM').daysInMonth());

	return data;
};

exports.notes = async user => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		name,
		notes: [],
		user
	};

	const rawNotes = await db.collection('data').doc('notes').get()
		.then(snap => snap.data()?.[user]);
	data.notes = rawNotes.map(n => {
		const date = moment(n.date?._seconds * 1000).format('Do MMM, dddd');
		return { ...n, date };
	}).reverse();

	return data;
};

exports.syllabus = async user => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		name,
		syllabus: [],
		user
	};

	data.syllabus = await db.collection('data').doc('syllabus').get()
		.then(snap => snap.data()?.[user]);

	return data;
};
