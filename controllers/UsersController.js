const Joi = require('joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/appconfig')
const stringUtil = require('../utils/stringUtil');

const CryptoX = require('../utils/CryptoX')
const BaseController = require('../controllers/BaseController');
const RequestHandler = require('../utils/RequestHandler');
const EntryChecker = require('../utils/checkBeforeEntry');
const Logger = require('../utils/logger');
const auth = require('../utils/auth');
const { json } = require('body-parser');
const checkBeforeEntry = require('../utils/checkBeforeEntry');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class UsersController extends BaseController {
	
	static async getUserById(req, res) {
		try {
			const reqParam = req.params.id;
			const schema = {
				uid: Joi.string().min(1),
			};
			const { error } = Joi.validate({ uid: reqParam }, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', 'invalid User Id');

			const resultRaw = await super.getById(req, 'users');

			var result = await CryptoX.encryptX(JSON.stringify(resultRaw.dataValues));
			// var result = (resultEncoded).encryptedData;

			// var decryptedString = await Cryptograph.decrypt(JSON.stringify(result));
			// console.log("58", decryptedString);

			return requestHandler.sendSuccess(res, 'User Data Extracted')({ result });
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

	static async deleteById(req, res) {
		try {
			const result = await super.deleteById(req, 'users');
			return requestHandler.sendSuccess(res, 'User Deleted Successfully')({ result });
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

	static async getProfile(req, res) {
		try {
			logger.log(req, 'warn');
			const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
			const check = {
				user_agent: cleanedUserAgent,
			}
			if (EntryChecker(check)) {
				const tokenFromHeader = auth.getJwtToken(req);
				// logger.log(`TOKEN`,'warn');
				const user = jwt.decode(tokenFromHeader);
				// logger.log(`USER ${user.payload.id}`,'warn');
				const options = {
					where: { id: user.payload.id },
				};
				const userProfile = await super.getByCustomOptions(req, 'users', options);
				const cleanedId2 = userProfile.dataValues.id.replace(/[^a-zA-Z0-9_-]/g, '');

				const getWorkspacesByUserId = await super.customSelectQuery(req, `
				SELECT
					workspaces.id
				FROM workspaces
				WHERE workspaces.id_user = '${cleanedId2}'
				`);
				console.log(getWorkspacesByUserId);
				const workspaces = getWorkspacesByUserId.map(workspace => workspace.id);
				// console.log(workspaces);
				console.log()
				userProfile.dataValues.workspaces = workspaces;
				const payload = _.omit(userProfile.dataValues, ['user_img']);
				const profile = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
				return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')({ profile });
			}else {
				return requestHandler.sendError(req, res, 'Please provide a valid request');
			}
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

	static async updateProfile(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			
			const schema = {
				name: Joi.string().max(120),
				user_img : Joi.string().max(120000),
			};
			const { error } = Joi.validate(req.body, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', 'invalid request body');

			const sanitizedId = user.payload.id.replace(/[^a-zA-Z0-9_-]/g, '');
			
			const checkUser = await super.getByCustomOptions(req, 'users', { where: { id: sanitizedId } });
			console.log(checkUser)
			if (_.isNull(checkUser) || _.isUndefined(checkUser)) {
				return requestHandler.sendError(req, res, 'User not found');
			}
			console.log("MASIUK SINI")
			// console.log(req.body.user_img);
			// var byteString = Buffer.from(req.body.user_img, 'base64');
			
			const data = {
				name: req.body.name,
				user_img: req.body.user_img,
			}
			const result = await super.updateByCustomWhere(req, 'users', data, { id: sanitizedId });
			if(result){
				const options = {
					where: { id: user.payload.id },
				};
				const userProfile = await super.getByCustomOptions(req, 'users', options);
				const payload = _.omit(userProfile.dataValues, ['user_img']);
				const token = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
				
				return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')( {token, user_img : userProfile.dataValues.user_img.toString()} );
			}

			// return requestHandler.sendSuccess(res, 'User Updated Successfully')({ result });
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

	static async getImageUser(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			const sanitizedId = user.payload.id.replace(/[^a-zA-Z0-9_-]/g, '');
			const options = {
				where: { id: sanitizedId },
			};
			const userProfile = await super.getByCustomOptions(req, 'users', options);
			console.log(userProfile)
			return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')( {user_img : userProfile.dataValues.user_img.toString(), name: userProfile.dataValues.name} );
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}


	static async getBookingByIdUser(req, res) {
		try{
			const page = req.query.page.replace(/[^0-9_-]/g, '');
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			console.log(user)
			const sanitizedId = user.payload.id.replace(/[^a-zA-Z0-9_-]/g, '');

			const perPage = 10;
			const offset = (page - 1) * perPage;
			const result = await super.customSelectQuery(req, `
			SELECT booking_ws.*, workspaces.name AS workspaces_name, type_ws.type
			FROM booking_ws
			LEFT JOIN workspaces ON booking_ws.id_ws = workspaces.id
			LEFT JOIN type_ws ON booking_ws.id_type_ws = type_ws.id
			WHERE booking_ws.id_user = '${sanitizedId}' LIMIT ${perPage} OFFSET ${offset};
			`);

			if (!(_.isNull(result))) {
				for(let i = 0; i < result.length; i++){
					result[i] = _.omit(result[i], []);
				}
				requestHandler.sendSuccess(res, 'success')({ result });
			}

		}catch (error) {	
			requestHandler.sendError(req, res, error);
		}
	}

}

module.exports = UsersController;
