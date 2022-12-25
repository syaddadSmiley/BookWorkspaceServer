const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');

const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('../controllers/BaseController');

const stringUtil = require('../utils/stringUtil');
const email = require('../utils/email');
const auth = require('../utils/auth');
const config = require('../config/appconfig');
const { join } = require('lodash');
const { decrypt, decryptX } = require('../utils/CryptoX');

var sanitize = require('validator').sanitize

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class AuthController extends BaseController {
	static async login(req, res) {
		try {
			// const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');
			// const cleanedUid = req.body.uid.replace(/[^a-zA-Z0-9_-]/g, '');
			// const cleanedEmail = req.body.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
			// console.log(cleanedEmail, cleanedUid);
			// logger.log(cleanedUserAgent, 'warn');
			const schema = {
				email: Joi.string().email().required(),
				uid: Joi.string().required(),
				user_agent: Joi.string().required(),
			};
			const { error } = Joi.validate({
				email: req.body.email,
				uid: req.body.uid,
				user_agent: req.headers['user-agent'],
			}, schema);
			// logger.log("DIsini kaj", 'warn');
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
			const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');
			const cleanedUid = req.body.uid.replace(/[^a-zA-Z0-9_-]/g, '');
			const cleanedEmail = req.body.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
			const options = {
				where: { uid: cleanedUid },
			};
			// var x = String(cleanedUserAgent).includes("Dart");
			// logger.log(x, 'warn');
			const user = await super.getByCustomOptions(req, 'users', options);
			if (!user) {
				requestHandler.throwError(400, 'bad request', 'invalid')();
			} 
			// var logString = "User Agent "+cleanedUserAgent
			// logger.log(logString, 'warn');
			if (String(cleanedUserAgent).includes("Mozilla") ||  String(cleanedUserAgent).includes("Chrome") || String(cleanedUserAgent).includes("Dart")) {
				
				const find = {
					where: {
						user_id: user.id,
					},
				};

				// const fcmToken = await super.getByCustomOptions(req, 'UserTokens', find);
				const data = {
					userId: user.id,
					platform: req.headers.platform,
				};

				// if (fcmToken) {
				// 	req.params.id = fcmToken.id;
				// 	await super.updateById(req, 'UserTokens', data);
				// } else {
				// 	await super.create(req, 'UserTokens', data);
				// }
			}else {
				requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
			}

			console.log("REQUEST", req.headers.authorization);
			console.log(user.email, cleanedEmail);
			// await bcrypt
			// 	.compare(cleanedEmail, user.email)
			// 	.then(
			// 		requestHandler.throwIf(r => !r, 400, 'incorrect', 'failed to login bad credentials'),
			// 		requestHandler.throwError(500, 'bcrypt error'),
			// 	);
			if (cleanedEmail !== user.email) {
				requestHandler.throwIf(r => !r, 400, 'incorrect', 'failed to login bad credentials');
				requestHandler.throwError(500, 'bcrypt error');
			}
			
			const data = {
				last_login_date: new Date(),
			};
			req.params.id = user.id;
			await super.updateById(req, 'users', data);
			
			const payload = _.omit(user.dataValues, ['createdAt', 'updatedAt', 'uid', 'mobile_number', 'verified']);
			logger.log(config.auth.jwt_secret, 'warn')
			const token = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
			const refreshToken = jwt.sign({
				payload,
			}, config.auth.refresh_token_secret, {
				expiresIn: config.auth.refresh_token_expiresin,
			});
			const response = {
				status: 'Logged in',
				token,
				refreshToken,
			};
			tokenList[refreshToken] = response;
			requestHandler.sendSuccess(res, 'User logged in Successfully')({ token, refreshToken });
		} catch (error) {
			requestHandler.sendError(req, res, error);
		}
	}

	static async signUp(req, res) {
		try {
			const data = req.body;
			const schema = {
				uid: Joi.string().required(),
				email: Joi.string().email().required(),
				name: Joi.string().required(),
				mobile_number: Joi.number().required(),
			};
			logger.log("sampai0", 'warn');
			console.log("ENTAH DIMANAAA");
			const { error } = Joi.validate({ uid: data.uid, email: data.email, name: data.name , mobile_number: data.mobile_number}, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
			const options = { where: { uid: data.uid } };
			const user = await super.getByCustomOptions(req, 'users', options);
			
			if (user) {
				requestHandler.throwError(400, 'bad request', 'invalid, account already existed')();
			}

			const cleanedUid = data.uid.replace(/[^a-zA-Z0-9_-]/g, '');
			const cleanedEmail = data.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
			const cleanedName = data.name.replace(/[^a-zA-Z]/g, '');
			const cleanedMobileNumber = data.mobile_number.replace(/[^0-9]/g, '');

			const payload = {
				uid: cleanedUid,
				email: cleanedEmail,
				name: cleanedName,
				mobile_number: cleanedMobileNumber,
			}
			console.log(payload);

			logger.log("sampai1", 'warn')

			// async.parallel([
			// 	function one(callback) {
			// 		email.sendEmail(
			// 			callback,
			// 			config.sendgrid.from_email,
			// 			[data.email],
			// 			' iLearn Microlearning ',
			// 			`please consider the following as your password${randomString}`,
			// 			`<p style="font-size: 32px;">Hello ${data.name}</p>  please consider the following as your password: ${randomString}`,
			// 		);
			// 	},
			// ], (err, results) => {
			// 	if (err) {
			// 		requestHandler.throwError(500, 'internal Server Error', 'failed to send password email')();
			// 	} else {
			// 		logger.log(`an email has been sent at: ${new Date()} to : ${data.email} with the following results ${results}`, 'info');
			// 	}
			// });

			logger.log("sampai2", 'warn')

			// const hashedEmail = bcrypt.hashSync(data.email, config.auth.saltRounds);
			// data.email = hashedEmail;
			// console.log(data.email);
			const createdUser = await super.create(req, 'users', payload);
			if (!(_.isNull(createdUser))) {
				const options = {
					where: { uid: data.uid },
				};
				const user = await super.getByCustomOptions(req, 'users', options);
				console.log(user.dataValues);
				const payload = _.omit(user.dataValues, [ 'createdAt', 'updatedAt', 'uid', 'mobile_number', 'verified']);
				// logger.log(config.auth.jwt_secret, 'warn')
				const token = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
				const refreshToken = jwt.sign({
					payload,
				}, config.auth.refresh_token_secret, {
					expiresIn: config.auth.refresh_token_expiresin,
				});
				const response = {
					status: 'Registered',
					token,
					refreshToken,
				};
				tokenList[refreshToken] = response;
				requestHandler.sendSuccess(res, 'Register Successfully')({ token, refreshToken });
			} else {
				requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}

	static async refreshToken(req, res) {
		try {
			const data = req.body;
			if (_.isNull(data)) {
				requestHandler.throwError(400, 'bad request', 'please provide the refresh token in request body')();
			}
			const schema = {
				refreshToken: Joi.string().required(),
			};
			const { error } = Joi.validate({ refreshToken: req.body.refreshToken }, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);

			if ((data.refreshToken) && (data.refreshToken in tokenList)) {
				const token = jwt.sign({ user }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
				const response = {
					token,
				};
				// update the token in the list
				tokenList[data.refreshToken].token = token;
				requestHandler.sendSuccess(res, 'a new token is issued ', 200)(response);
			} else {
				requestHandler.throwError(400, 'bad request', 'no refresh token present in refresh token list')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}

	static async c2VuZE9UUA(req, res) {
		try {
			const reqParam = req.params.val;
			const schema = {
				val: Joi.string().min(1),
			};
			const { error } = Joi.validate({ val: reqParam }, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', 'invalid');

			// var cleanedReqParam = reqParam.replace(/[^a-zA-Z0-9_-+=]/g, '');
			var XXX = "JaA64s7FZP+ZG7dCUbj4OA=="
			// var cleanedReqParamXXX = XXX.replace(/[^a-zA-Z0-9_-+=]/g, '');
			console.log(cleanedReqParamXXX);
			decryptX(reqParam)

		}catch (err){
			requestHandler.sendError(req, res, err);
		}
	}

	static async logOut(req, res) {
		try {
			const schema = {
				platform: Joi.string().valid('ios', 'android', 'web').required(),
				fcmToken: Joi.string(),
			};
			const { error } = Joi.validate({
				platform: req.headers.platform, fcmToken: req.body.fcmToken,
			}, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			const options = {
				where: {
					fcmToken: req.body.fcmToken,
					platform: req.headers.platform,
					user_id: user.payload.id,
				},
			};
			const fmcToken = await super.getByCustomOptions(req, 'UserTokens', options);
			req.params.id = fmcToken.dataValues.id;
			const deleteFcm = await super.deleteById(req, 'UserTokens');
			if (deleteFcm === 1) {
				requestHandler.sendSuccess(res, 'User Logged Out Successfully')();
			} else {
				requestHandler.throwError(400, 'bad request', 'User Already logged out Successfully')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}
}
module.exports = AuthController;
