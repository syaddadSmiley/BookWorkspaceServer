const express = require('express');
const helmet = require('helmet');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const uuid = require('uuid');

const config = require('./config/appconfig');
const Logger = require('./utils/logger.js');

const logger = new Logger();
const app = express();

app.set('config', config); // the system configrationsx
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('method-override')());


app.use(compression());
app.use(cors());

const swagger = require('./utils/swagger');
const { use } = require('./router');


app.use(rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again after 15 minutes',
}));
process.on('SIGINT', () => {
	logger.log('stopping the server', 'info');
	process.exit();
});

app.set('db', require('./models/index.js'));

app.set('port', process.env.DEV_APP_PORT);
app.use('/api/docs', swagger.router);

app.use((req, res, next) => {
	req.identifier = uuid();
	const logString = `a request has been made with the following uuid [${req.identifier}] | ${req.ip} | ${req.url} | ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
	logger.log(logString, 'info');
	next();
});

app.use(require('./router'));

app.use((req, res, next) => {
	logger.log('the url you are trying to reach is not hosted on our server T_T', 'error');
	const err = new Error('Not Found');
	err.status = 404;
	res.status(err.status).json({ type: 'error', message: 'the url you are trying to reach is not hosted on our server T_T' });

	req.identifier = uuid();
	const logString = `a request has been made with the following uuid [${req.identifier}] | ${req.ip} | ${req.url} | ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
	logger.log(logString, 'info');
	next(err);
});
app.use(csurf({ cookie: true }));
app.use(helmet());
/**
 * Create HTTP server.
 */
const server = http.createServer(app)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	const port = parseInt(val, 10);

	if (Number.isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.DEV_APP_PORT || '3000');
app.set('port', port);

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string'
		? `Pipe ${port}`
		: `Port ${port}`;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			logger.log(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			logger.log(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? `pipe ${addr}`
		: `port ${addr.port}`;

	logger.log(`the server started listining on port ${bind}`, 'info');
}

server.listen(port)
server.on('error', onError);
server.on('listening', onListening);

// module.exports = app;
