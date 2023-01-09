const Joi = require('joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/appconfig')

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
			const tokenFromHeader = auth.getJwtToken(req);
			// logger.log(`TOKEN`,'warn');
			const user = jwt.decode(tokenFromHeader);
			// logger.log(`USER ${user.payload.id}`,'warn');
			const options = {
				where: { id: user.payload.id },
			};
			const userProfile = await super.getByCustomOptions(req, 'users', options);
			const payload = _.omit(userProfile.dataValues, ['createdAt', 'updatedAt', 'last_login_date', 'password']);
			const profile = jwt.sign({ payload } , config.auth.jwt_secret, {expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512'});
			return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')({ profile });
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

	static async getBookingByIdUser(req, res) {
        try {
			const schema = {
				page: Joi.number(),
				perPage: Joi.number(),
				user_agent: Joi.string().required(),
			};
			const { error } = Joi.validate({
				page: req.query.page,
				perPage: req.query.per_page,
				user_agent: req.headers['user-agent'],
			}, schema);
			requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

			//CLEANING BODY
			const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
			const check = {
				user_agent: cleanedUserAgent,
			}
			if(EntryChecker(check)){
				const tokenFromHeader = auth.getJwtToken(req);
				const user = jwt.decode(tokenFromHeader);
				// const data = {
				// 	perPage: parseInt(req.query.per_page, 10),
				// 	page: parseInt(req.query.page, 10),
				// 	offset: 0,
				// 	status: "noAll",
				// 	where: { id_user: user.payload.id },
				// 	innerJoin: [
				// 		{
				// 			model: 'users',
				// 			as: 'users',
				// 			attributes: ['id', 'name', 'email', 'phone', 'address'],
				// 		},
				// 		{
				// 			model: 'type_ws',
				// 			as: 'booking_ws',
							
				// 	limit: 10,
				// }

				const resultRaw = await super.customSelectQuery(req, `
				SELECT booking_ws.*, workspaces.name AS workspaces_name, type_ws.type
				FROM booking_ws
				LEFT JOIN workspaces ON booking_ws.id_ws = workspaces.id
				LEFT JOIN type_ws ON (SELECT services.id_type_ws FROM services WHERE services.id_ws = workspaces.id LIMIT 1) = type_ws.id
				WHERE booking_ws.id_user = '${user.payload.id}' LIMIT 0, 10;
				`)
				console.log({resultRaw})
				if (!(_.isNull(resultRaw))) {
					for(let i = 0; i < resultRaw.length; i++){
						resultRaw[i] = _.omit(resultRaw[i], ['createdAt', 'updatedAt']);
					}
					// const result = _.omit(resultRaw.dataValues, ['createdAt', 'updatedAt']);
					requestHandler.sendSuccess(res, 'success')({ resultRaw });
				} else {
					requestHandler.throwError(422, 'Unprocessable Entity', 'there\'s no history booking here')();
				}
			}else{
				requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
			}
            
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }

}

module.exports = UsersController;
