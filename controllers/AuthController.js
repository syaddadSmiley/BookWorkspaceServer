const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('../controllers/BaseController');

const stringUtil = require('../utils/stringUtil');
const email = require('../utils/email');
const auth = require('../utils/auth');
const config = require('../config/appconfig');
const { join } = require('lodash');
const { decrypt, decryptX } = require('../utils/CryptoX');
const { UUID } = require('sequelize');
const uuid = require('uuid');
const {Roles} = require('../models/roles');
const { query } = require('express');
const { _init } = require('joi/lib/types/lazy');
const { sendEmailVerification, sendEmail } = require('../utils/email');
const { contentSecurityPolicy } = require('helmet');
const checkBeforeEntry = require('../utils/checkBeforeEntry');
const e = require('express');
const { getJwtToken } = require('../utils/auth');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class AuthController extends BaseController {
	// static async login(req, res) {
	// 	try {
	// 		// const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');
	// 		// const cleanedUid = req.body.uid.replace(/[^a-zA-Z0-9_-]/g, '');
	// 		// const cleanedEmail = req.body.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
	// 		// console.log(cleanedEmail, cleanedUid);
	// 		// logger.log(cleanedUserAgent, 'warn');
	// 		const schema = {
	// 			email: Joi.string().email().required(),
	// 			id: Joi.string().required(),
	// 			user_agent: Joi.string().required(),
	// 		};
	// 		const { error } = Joi.validate({
	// 			email: req.body.email,
	// 			id: req.body.id,
	// 			user_agent: req.headers['user-agent'],
	// 		}, schema);
	// 		// logger.log("DIsini kaj", 'warn');
	// 		requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
	// 		const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');
	// 		const cleanedId = req.body.id.replace(/[^a-zA-Z0-9_-]/g, '');
	// 		const cleanedEmail = req.body.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
			
	// 		// var x = String(cleanedUserAgent).includes("Dart");
	// 		// logger.log(x, 'warn');
	// 		// const user = await super.getByCustomOptions(req, 'users', options);
			
	// 		// var logString = "User Agent "+cleanedUserAgent
	// 		// logger.log(logString, 'warn');
	// 		if (String(cleanedUserAgent).includes("Mozilla") ||  String(cleanedUserAgent).includes("Chrome") || String(cleanedUserAgent).includes("Dart")) {
	// 			const options = {
	// 				where: { id: cleanedId },
	// 			};
	// 			const user = await super.getByCustomOptions(req, 'users', options);
	// 			if (!user) {
	// 				requestHandler.throwError(400, 'bad request', 'invalid')();
	// 			} 
	// 			// console.log("REQUEST", req.headers.authorization);
	// 			console.log(user.dataValues.email, cleanedEmail);
				
	// 			if (cleanedEmail !== user.dataValues.email) {
	// 				requestHandler.throwIf(r => !r, 400, 'incorrect', 'failed to login bad credentials');
	// 				requestHandler.throwError(500, 'bcrypt error');
	// 			}

	// 			const cleanedId2 = user.dataValues.id.replace(/[^a-zA-Z0-9_-]/g, '');

	// 			const getWorkspacesByUserId = await super.customSelectQuery(req, `
	// 			SELECT
	// 				workspaces.id
	// 			FROM workspaces
	// 			WHERE workspaces.id_user = '${cleanedId2}'
	// 			`);

	// 			const workspaces = getWorkspacesByUserId.map(workspace => workspace.id);
	// 			// console.log(workspaces);
	// 			user.dataValues.workspaces = workspaces;
	// 			// console.log(user[0]);
	// 			const payload = _.omit(user.dataValues, ['user_img', 'password']);
	// 			// logger.log(config.auth.jwt_secret, 'warn')
	// 			const token = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
	// 			const refreshToken = jwt.sign({
	// 				payload,
	// 			}, config.auth.refresh_token_secret, {
	// 				expiresIn: config.auth.refresh_token_expiresin,
	// 			});
	// 			const response = {
	// 				status: 'Logged in',
	// 				token,
	// 				refreshToken,
	// 			};
	// 			tokenList[refreshToken] = response;
	// 			requestHandler.sendSuccess(res, 'User logged in Successfully')({ token, refreshToken });
	// 		}else {
	// 			requestHandler.throwError(400, 'bad request', 'please provide the required request')();
	// 		}
	// 	} catch (error) {
	// 		requestHandler.sendError(req, res, error);
	// 	}
	// }

	static async login(req, res) {
		try {
			// const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');
			// const cleanedUid = req.body.uid.replace(/[^a-zA-Z0-9_-]/g, '');
			// const cleanedEmail = req.body.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
			// console.log(cleanedEmail, cleanedUid);
			// logger.log(cleanedUserAgent, 'warn');
			const schema = {
				email: Joi.string().email().required(),
				password: Joi.string().required(),
				user_agent: Joi.string().required(),
			};
			const { error } = Joi.validate({
				email: req.body.email,
				password: req.body.password,
				user_agent: req.headers['user-agent'],
			}, schema);
			// logger.log("DIsini kaj", 'warn');
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
			const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');
			const cleanedEmail = req.body.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
			
			// var x = String(cleanedUserAgent).includes("Dart");
			// logger.log(x, 'warn');
			// const user = await super.getByCustomOptions(req, 'users', options);
			
			// var logString = "User Agent "+cleanedUserAgent
			// logger.log(logString, 'warn');
			if (String(cleanedUserAgent).includes("Mozilla") ||  String(cleanedUserAgent).includes("Chrome") || String(cleanedUserAgent).includes("Dart")) {
				const options = {
					where: { email: cleanedEmail },
				};
				const user = await super.getByCustomOptions(req, 'users', options);
				if (!user) {
					requestHandler.throwError(400, 'bad request', 'invalid')();
				}
				
				//check password
				const isMatch = await bcrypt.compare(req.body.password, user.dataValues.password);
				if (!isMatch) {
					requestHandler.throwError(400, 'bad request', 'invalid email or password')();
				}

				const cleanedId2 = user.dataValues.id.replace(/[^a-zA-Z0-9_-]/g, '');

				const getWorkspacesByUserId = await super.customSelectQuery(req, `
				SELECT
					workspaces.id
				FROM workspaces
				WHERE workspaces.id_user = '${cleanedId2}'
				`);

				const workspaces = getWorkspacesByUserId.map(workspace => workspace.id);
				// console.log(workspaces);
				user.dataValues.workspaces = workspaces;
				// console.log(user[0]);
				const payload = _.omit(user.dataValues, ['user_img', 'password']);
				// logger.log(config.auth.jwt_secret, 'warn')
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
			}else {
				requestHandler.throwError(400, 'bad request', 'please provide the required request')();
			}
		} catch (error) {
			requestHandler.sendError(req, res, error);
		}
	}

	// static async signUp(req, res) {
	// 	try {
	// 		const data = req.body;
	// 		const schema = {
	// 			id: Joi.string().required(),
	// 			email: Joi.string().email().required(),
	// 			name: Joi.string().required(),
	// 			mobile_number: Joi.number().required(),
	// 		};
	// 		// logger.log("sampai0", 'warn');
	// 		const cleanedId = data.id.replace(/[^a-zA-Z0-9_-]/g, '');
	// 		const cleanedEmail = data.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
	// 		const cleanedName = data.name.replace(/[^a-zA-Z]/g, '');
	// 		const cleanedMobileNumber = data.mobile_number.replace(/[^0-9]/g, '');
	// 		// console.log("ENTAH DIMANAAA");
	// 		const { error } = Joi.validate({ id: data.id, email: data.email, name: data.name , mobile_number: data.mobile_number}, schema);
	// 		requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

	// 		const options = { where: { id: cleanedId } };
	// 		const user = await super.getByCustomOptions(req, 'users', options);
	// 		if (user) {
	// 			requestHandler.throwError(400, 'bad request', 'invalid, account already existed')();
	// 		}

	// 		//Default Image
	// 		const readImage = fs.statSync(path.join(__dirname, '../assets/noPP.png'));
	// 		if(readImage.size/(1024 * 1024) > 3){
	// 			requestHandler.throwError(400, 'bad request', 'image size too large')();

	// 		}
	// 		//check extension format
	// 		const ext = path.extname(path.join(__dirname, '../assets/noPP.png'));
	// 		if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg'){
	// 			requestHandler.throwError(400, 'bad request', 'invalid image format')();
	// 		}

	// 		const getImage = fs.readFileSync(path.join(__dirname, '../assets/noPP.png'));
			
	// 		var base64Image
	// 		if(ext === '.png')
	// 		 	base64Image = 'data:image/png;base64,';
	// 		else if(ext === '.jpg' || ext === '.jpeg'){
	// 			base64Image = 'data:image/jpeg;base64,';
	// 		}
	// 		base64Image += new Buffer.from(getImage, 'binary').toString('base64');
	// 		const user_img = base64Image;

	// 		const payload = {
	// 			id: cleanedId,
	// 			email: cleanedEmail,
	// 			name: cleanedName,
	// 			mobile_number: cleanedMobileNumber,
	// 			user_img:  user_img,
	// 		};
	// 		const createdUser = await super.create(req, 'users', payload);
	// 		if (!(_.isNull(createdUser))) {		
	// 			// try{
	// 			// 	const payloadRole = {
	// 			// 		id: uuid(),
	// 			// 		id_user: cleanedId,
	// 			// 		role: 'user',
	// 			// 	}
	// 			// 	const setRole = await super.create(req, 'roles', payloadRole);
	// 			// 	if (_.isNull(setRole)) {
	// 			// 		req.params.id = cleanedId;
	// 			// 		const deleteUser = await super.deleteById(req, 'users');
	// 			// 		console.log(deleteUser);
	// 			// 		requestHandler.throwError(500, 'internal Server Error', 'failed to set role')();
	// 			// 	}
	// 			// }catch(error){
	// 			// 	requestHandler.throwError(500, 'internal Server Error', 'failed to set role')();
	// 			// 	req.params.id = cleanedId;
	// 			// 	const deleteUser = await super.deleteById(req, 'users');
	// 			// 	console.log(deleteUser);
	// 			// 	requestHandler.throwError(500, 'internal Server Error', 'failed to set role')();
	// 			// }
				
				
	// 			const querySelect = `SELECT
	// 			users.id,
	// 				users.email,
	// 				users.name,
	// 				users.role,
	// 				users.mobile_number,
	// 				users.user_img,
	// 				users.verified,
	// 				users.updated_at
	// 			FROM users
	// 			WHERE users.id = '${cleanedId}'`
	// 			const user = await super.customSelectQuery(req, querySelect);

	// 			if(_.isNull(user)){
	// 				req.params.id = cleanedId;
	// 				const deleteUser = await super.deleteById(req, 'users');
	// 				console.log(deleteUser);
	// 				requestHandler.throwError(500, 'internal Server Error', 'failed to register')();
	// 			}

	// 			const cleanedId2 = user[0].id.replace(/[^a-zA-Z0-9_-]/g, '');

	// 			const getWorkspacesByUserId = await super.customSelectQuery(req, `
	// 			SELECT
	// 				workspaces.id
	// 			FROM workspaces
	// 			WHERE workspaces.id_user = '${cleanedId2}'
	// 			`);

	// 			const workspaces = getWorkspacesByUserId.map(workspace => workspace.id);
	// 			// console.log(workspaces);
	// 			user[0].workspaces = workspaces;

	// 			const payload = _.omit(user[0], ['user_img']);
	// 			// logger.log(config.auth.jwt_secret, 'warn')
	// 			const token = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
	// 			const refreshToken = jwt.sign({
	// 				payload,
	// 			}, config.auth.refresh_token_secret, {
	// 				expiresIn: config.auth.refresh_token_expiresin,
	// 			});
	// 			const response = {
	// 				status: 'Registered',
	// 				token,
	// 				refreshToken,
	// 			};
	// 			tokenList[refreshToken] = response;
	// 			requestHandler.sendSuccess(res, 'Register Successfully')({ token, refreshToken });
	// 		} else {
	// 			requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
	// 		}
	// 	} catch (err) {
	// 		console.log(err);
	// 		requestHandler.sendError(req, res, err);
	// 	}
	// }

	static async signUp(req, res) {
		try {
			const data = req.body;
			const schema = {
				email: Joi.string().email().max(200).required(),
				name: Joi.string().max(120).required(),
				password: Joi.string().required(),
				mobile_number: Joi.number().required(),
			};
			// logger.log("sampai0", 'warn')
			const cleanedEmail = data.email.replace(/[^a-zA-Z0-9_@.-]/g, '');
			const cleanedName = data.name.replace(/[^a-zA-Z]/g, '');
			const cleanedPhoneNumber = data.mobile_number.replace(/[^0-9]/g, '');
			// console.log("ENTAH DIMANAAA");
			const { error } = Joi.validate({ email: data.email, name: data.name, password: data.password, mobile_number: cleanedPhoneNumber}, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

			const user = await super.customSelectQuery(req, `
				SELECT * FROM users
				WHERE users.email = '${cleanedEmail}'
				OR users.mobile_number = '${cleanedPhoneNumber}'
			`);
			console.log(user);
			if(user.length > 0){
				requestHandler.throwError(400, 'bad Request', 'email or phone number already registered')();
			}

			//Default Image
			const readImage = fs.statSync(path.join(__dirname, '../assets/noPP.png'));
			if(readImage.size/(1024 * 1024) > 3){
				requestHandler.throwError(400, 'bad request', 'image size too large')();

			}
			//check extension format
			const ext = path.extname(path.join(__dirname, '../assets/noPP.png'));
			if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg'){
				requestHandler.throwError(400, 'bad request', 'invalid image format')();
			}

			const getImage = fs.readFileSync(path.join(__dirname, '../assets/noPP.png'));
			
			var base64Image
			if(ext === '.png')
			 	base64Image = 'data:image/png;base64,';
			else if(ext === '.jpg' || ext === '.jpeg'){
				base64Image = 'data:image/jpeg;base64,';
			}
			base64Image += new Buffer.from(getImage, 'binary').toString('base64');
			const user_img = base64Image;
			const encryptedPassword = bcrypt.hashSync(data.password, 10);
			console.log(encryptedPassword);
			const payload = {
				id: uuid(),
				email: cleanedEmail,
				name: cleanedName,
				password: encryptedPassword,
				mobile_number: cleanedPhoneNumber,
				user_img:  user_img,
			};
			
			const createdUser = await super.create(req, 'users', payload);
			if (!(_.isNull(createdUser))) {	
				
				const querySelect = `SELECT
				users.id,
					users.email,
					users.name,
					users.role,
					users.mobile_number,
					users.user_img,
					users.verified,
					users.updated_at
				FROM users
				WHERE users.email = '${cleanedEmail}' AND users.mobile_number = '${cleanedPhoneNumber}'`
				const user = await super.customSelectQuery(req, querySelect);

				if(_.isNull(user) || _.isUndefined(user)){
					const deleteUser = await super.customDeleteQuery(req, `DELETE FROM users WHERE users.email = '${cleanedEmail}'`);
					console.log(deleteUser);
					requestHandler.throwError(500, 'internal Server Error', 'failed to register')();
				}

				const cleanedId2 = user[0].id.replace(/[^a-zA-Z0-9_-]/g, '');

				//generate otp code
				const otpCode = Math.floor(100000 + Math.random() * 900000);
				const otpPayload = {
					id: uuid(),
					id_user: cleanedId2,
					otp: otpCode,
					limit: 5,
					expired_at: moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
				};
				const createdOtp = await super.create(req, 'otps', otpPayload);
				if (_.isNull(createdOtp)) {
					const deleteUser = await super.customDeleteQuery(req, `DELETE FROM users WHERE users.email = '${cleanedEmail}'`);
					console.log(deleteUser);
					requestHandler.throwError(500, 'internal Server Error', 'failed to register')();
				}

				const htmlContent = await email.otpContent(cleanedName, otpCode);
				async.parallel([	
					function one(callback){
						sendEmail(callback, cleanedEmail, 'Verification Email', '', htmlContent);
					},
				], (err, results) => {
					if(err){
						logger.log(err, 'error');
					}else{
						logger.log(results.toString(), 'warn');
					}
				});
				//console.log(" 3") ;	
				const getWorkspacesByUserId = await super.customSelectQuery(req, `
				SELECT
					workspaces.id
				FROM workspaces
				WHERE workspaces.id_user = '${cleanedId2}'
				`);

				const workspaces = getWorkspacesByUserId.map(workspace => workspace.id);
				// console.log(workspaces);
				user[0].workspaces = workspaces;

				const payload = _.omit(user[0], ['user_img', 'password']);
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
			console.log(err);
			requestHandler.sendError(req, res, err);
		}
	}

	static async verifyOtp(req, res) {
		try {
			const data = req.body;
			if (_.isNull(data)) {
				requestHandler.throwError(400, 'bad request', 'please provide the otp code in request body')();
			}
			const schema = {
				otp: Joi.number().required(),
			};
			const { error } = Joi.validate({ otp: req.body.otp }, schema);
			if(data.otp.length > 6){
				requestHandler.throwError(400, 'bad request', 'otp code must be 6 digits')();
			}

			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);

			const cleanedId = user.payload.id.replace(/[^a-zA-Z0-9_-]/g, '');
			const cleanedOtp = data.otp.replace(/[^a-zA-Z0-9_-]/g, '');

			const check = {
				user_agent: req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, ''),
			}
			if(checkBeforeEntry(check)){
				const getOtp = await super.customSelectQuery(req, `
					SELECT
						otps.id,
						otps.otp,
						otps.limit,
						otps.expired_at
					FROM otps
					WHERE otps.id_user = '${cleanedId}'
				`);

				if (getOtp.length > 0) {
					if (moment(getOtp[0].expired_at).isAfter(moment())) {					
						if (getOtp[0].limit > 0) {
							if (getOtp[0].otp == cleanedOtp) {
								const updateOtp = await super.customUpdateQuery(req, `UPDATE otps SET otps.limit = otps.limit - 5 WHERE otps.id = '${getOtp[0].id}'`);
								if (updateOtp) {
									const updateUser = await super.customUpdateQuery(req, `UPDATE users SET users.verified = 1 WHERE users.id = '${cleanedId}'`);
									if (updateUser) {
										const getWorkspacesByUserId = await super.customSelectQuery(req, `
										SELECT
											workspaces.id
										FROM workspaces
										WHERE workspaces.id_user = '${cleanedId}'
										`);
										
										const workspaces = getWorkspacesByUserId.map(workspace => workspace.id);
										// console.log(workspaces);
										user.payload.verified = 1;
										user.payload.workspaces = workspaces;
										const payload = _.omit(user.payload, ['user_img', 'password']);
										// logger.log(config.auth.jwt_secret, 'warn
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
								} else {
									requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
								}
							} else {
								const updateLimit = await super.customUpdateQuery(req, `UPDATE otps SET otps.limit = otps.limit - 1 WHERE otps.id = '${getOtp[0].id}'`);
								requestHandler.throwError(422, 'Unprocessable Entity', 'otp code is wrong')();
							}
						} else {
							requestHandler.throwError(422, 'Unprocessable Entity', 'otp code is expired')();
						}
					} else {
						requestHandler.throwError(400, 'bad request', 'otp code has been expired')();
					}
				} else {
					requestHandler.throwError(422, 'Unprocessable Entity', 'user not found')();
				}
			}else{
				requestHandler.throwError(422, 'Unprocessable Entity', 'please provide the required request')();
			}
			

		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}

	static async resendOtp(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			const cleanedId = user.payload.id.replace(/[^a-zA-Z0-9.-]/g, '');
			const cleanedEmail = user.payload.email.replace(/[^a-zA-Z0-9@.]/g, '');
			const cleanedName = user.payload.name.replace(/[^a-zA-Z0-9@.]/g, '');

			const check = {
				user_agent: req.headers['user-agent'].replace(/[^a-zA-Z0-9@.]/g, ''),
			}
			if(checkBeforeEntry(check)){

				const getUser = await super.customSelectQuery(req, `
				SELECT
					users.id,
					users.email,
					users.verified
				FROM users
				WHERE users.id = '${cleanedId}'
				`);
				if (getUser.length > 0) {
					if (getUser[0].verified == 0) {
						const getOtp = await super.customSelectQuery(req, `
						SELECT
							otps.id,
							otps.otp,
							otps.expired_at
						FROM otps
						WHERE otps.id_user = '${getUser[0].id}'
						`);
						if (getOtp.length > 0) {
							const cleanedId = getOtp[0].id.replace(/[^a-zA-Z0-9_-]/g, '');
							const otpCode = Math.floor(100000 + Math.random() * 900000);
							const expiredAt = moment().add(5, 'minutes').subtract(7, "hours").format('YYYY-MM-DD HH:mm:ss');
							const updateOtp = await super.customUpdateQuery(req, `
							UPDATE otps
							SET otp = '${otpCode}',
							otps.limit = 5,
							expired_at = '${expiredAt}'
							WHERE otps.id = '${cleanedId}'
							`);
							if (updateOtp) {
								const htmlContent = await email.otpContent(cleanedName, otpCode);
								async.parallel([
									function one(callback) {
										sendEmail(callback, cleanedEmail, 'Verification Email', '', htmlContent);
									},
								], (err, results) => {
									if (err) {
										logger.log(err, 'error');
									} else {
										logger.log(results.toString(), 'warn');
									}
								});
								requestHandler.sendSuccess(res, 'OTP Code has been sent')();
							} else {
								requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
							}
						} else {
							const otpCode = Math.floor(100000 + Math.random() * 900000);
							const expiredAt = moment().add(5, 'minutes').subtract(7, "hours").format('YYYY-MM-DD HH:mm:ss');
							const insertOtp = await super.customInsertQuery(req, `
							INSERT INTO otps

							(id_user, otp_code, expired_at)

							VALUES

							('${getUser[0].id}', '${otpCode}', '${expiredAt}')
							`);
							if (insertOtp) {
								email.sendEmailVerification(cleanedEmail, otpCode);
								requestHandler.sendSuccess(res, 'OTP Code has been sent')();
							} else {
								requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
							}
						}
					} else {
						requestHandler.throwError(422, 'Unprocessable Entity', 'email has been verified')();
					}
				} else {
					requestHandler.throwError(404, 'Not Found', 'user not found')();
				}
			} else {
				requestHandler.throwError(422, 'Unprocessable Entity', 'please provide the required request')();
			}
		} catch (error) {
			requestHandler.sendError(req, res, error);
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

			const cleanedId2 = user.payload.id.replace(/[^a-zA-Z0-9_-]/g, '');

			const getWorkspacesByUserId = await super.customSelectQuery(req, `
				SELECT
					workspaces.id
				FROM workspaces
				WHERE workspaces.id_user = '${cleanedId2}'
				`);

			const workspaces = getWorkspacesByUserId.map(workspace => workspace.id);
			// console.log(workspaces);
			user.payload.workspaces = workspaces;

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

	static async getFileFromServer(req, res) {
		try {
			fs.readFile('private/ubisniz22_db.sql', (err, data) => {
				if (err) {
					requestHandler.sendError(req, res, err);
				}
				res.send(data);
			});
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}
}
module.exports = AuthController;
