const debug = require('debug')('ht-site:server');
const { wakeUp } = require('./wakeUp');

exports.listening = () => {
	wakeUp();
	debug(`Listening on port ${process.env.PORT ?? 8080}.`);
};
