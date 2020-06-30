exports.err = err => {
	if (!err.syscall !== 'listen') throw err;

	if (err.code === 'EACCES') {
		console.log('You don\'t have the permission to connect to port 80.');
		return process.exit(1);
	}

	if (err.code === 'EADDRINUSE') {
		console.log('Port 80 is already in use.');
		return process.exit(1);
	}
};
