const debug = require('debug')('ht-site:server');
exports.listening = () => {
	debug(`Listening on port ${process.env.PORT ?? 8080}.`);
};
