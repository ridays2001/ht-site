// Import all dependencies.
const fetch = require('node-fetch');

// Import all modules.
const sentry = require('../util/sentry');
const { navData } = require('../util/navData');
const { firestore: db } = require('../util/db');

const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	const data = navData(req.cookies);
	return res.render('contact', { contactActive: true, ...data });
});

router.post('/', async (req, res) => {
	// Get the form data from request body.
	const { name, message, purpose, phone, email } = req.body;

	// Get additional data and save the form data in database.
	const id = await db.collection('contact').doc('stats').get()
		.then(snap => snap.data().count);
	await db.collection('contact').doc(name).set({ [new Date()]: { id, ...req.body } }, { merge: true });
	await db.collection('contact').doc('stats').set({ count: id + 1 }, { merge: true });

	// The description for the embed object of the webhook.
	let description = `**__Message__** - ${message}\n**__Purpose__** - ${purpose} related.`;
	if (email) description += `\n**__Email__** - ${email}`;
	if (phone) description += `\n**__Phone Number__** - ${phone}`;

	/**
	 * 		<-- Discord Webhook Section -->
	 * Remove the next try and catch block if you want to opt out of this section.
	 * Please note that opting out of this would make your contact form practically useless.
	 * Since we are running our app on free tier, there are very few options.
	 * I have selected Discord Webhooks since I am really active on Discord.
	*/

	// Send the contact form information to a discord webhook.
	try {
		await fetch(`${process.env.WB}`, {
			method: 'POST',
			body: JSON.stringify({
				tts: false,
				embeds: [
					{
						title: 'Test',
						author: {
							name: `From - ${name}`
						},
						color: 3447003,
						description,
						footer: {
							text: `#${id}`
						},
						timestamp: new Date()
					}
				]
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		return res.redirect('/contact');
	} catch (err) {
		sentry.captureException(err);
		console.log(err);
		return res.send(
			500,
			'Internal Server Error.\nPlease use some other mode of contact. We will look onto this issue soon.'
		);
	}
});

module.exports = router;
