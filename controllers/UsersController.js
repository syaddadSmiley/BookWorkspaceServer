const Joi = require('joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/appconfig')

const CryptoX = require('../utils/CryptoX')
const BaseController = require('../controllers/BaseController');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const auth = require('../utils/auth');
const { json } = require('body-parser');


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
			const profile = _.omit(userProfile.dataValues, ['createdAt', 'updatedAt', 'last_login_date', 'password']);
			return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')({ profile });
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

	static async getBookingByIdUser(req, res) {
        try {
            const tokenFromHeader = auth.getJwtToken(req);
            const user = jwt.decode(tokenFromHeader);
            const options = {
                where: { id_user: user.payload.id },
            };
            const resultRaw = await super.getByCustomOptions(req, 'booking_ws', options);
            if (!(_.isNull(resultRaw))) {
                const result = _.omit(resultRaw.dataValues, ['createdAt', 'updatedAt']);
                requestHandler.sendSuccess(res, 'workspaces created')({ result });
            } else {
                requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }

}

module.exports = UsersController;
