const app = require('./app');
const http = require('http');
const { listening: onListening, err: onError } = require('./util/listeners');

// Create a server for our app.
const server = http.createServer(app);
server.listen(process.env.PORT ?? 80);
server.on('listening', onListening);
server.on('error', onError);
