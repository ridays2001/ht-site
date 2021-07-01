// Heroku sends our app to sleep after 30 minutes of inactivity.
// This function pings the app every 25 minutes and prevents it from sleeping due to inactivity.

const fetch = require('node-fetch');

exports.wakeUp = () => {
	setTimeout(async () => {
		try {
			return await fetch('https://ht-site.herokuapp.com/').then(_res => console.log('App persisted for another 25 mins.'));
		} catch (err) {
			return console.log('Error fetching the page.');
		} finally {
			this.wakeUp();
		}
	}, 1.5e+6);
};
