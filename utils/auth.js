const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/appconfig');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
function getTokenFromHeader(req) {
	if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token')
		|| (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
			// console.log("TOKEN", req.headers.authorization.split(' ')[1])
		return req.headers.authorization.split(' ')[1];
	}

	return null;
}

function verifyToken(req, res, next) {
	try {
		if (_.isUndefined(req.headers.authorization)) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		const Bearer = req.headers.authorization.split(' ')[0];

		if (!Bearer || Bearer !== 'Bearer') {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		const token = req.headers.authorization.split(' ')[1];

		if (!token) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		// verifies secret and checks exp
		jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
			if (err) {
				requestHandler.throwError(401, 'Unauthorized', 'please provide a valid token ,your token might be expired')();
			}
			req.decoded = decoded;
			next();
		});
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

function verifyTokenAdmin(req, res, next) {
	try {
		if (_.isUndefined(req.headers.authorization)) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		const Bearer = req.headers.authorization.split(' ')[0];

		if (!Bearer || Bearer !== 'Bearer') {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		const token = req.headers.authorization.split(' ')[1];

		if (!token) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		// verifies secret and checks exp
		jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
			if (err) {
				requestHandler.throwError(401, 'Unauthorized', 'please provide a valid token ,your token might be expired')();
			}
			// console.log("DISNI", decoded.payload);
			if (decoded.payload.roles !== 'admin' && decoded.payload.roles !== 'super_admin'){
				requestHandler.throwError(401, 'Unauthorized', 'Kamu bukan admin mas ~')();
			}else{
				req.decoded = decoded;
				next();
			}
		});
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}

function verifyTokenSuAdmin(req, res, next) {
	try {
		if (_.isUndefined(req.headers.authorization)) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		const Bearer = req.headers.authorization.split(' ')[0];

		if (!Bearer || Bearer !== 'Bearer') {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		const token = req.headers.authorization.split(' ')[1];

		if (!token) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}

		// verifies secret and checks exp
		jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
			if (err) {
				requestHandler.throwError(401, 'Unauthorized', 'please provide a valid token ,your token might be expired')();
			}
			console.log(decoded.payload.role);
			if (decoded.payload.roles !== 'super_admin') {
				requestHandler.throwError(401, 'Unauthorized', 'Kamu bukan admin mas ~')();
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}


module.exports = { getJwtToken: getTokenFromHeader, isAuthenticated: verifyToken, isAuthenticatedAdmin : verifyTokenAdmin, isAuthenticatedSuAdmin : verifyTokenSuAdmin};
