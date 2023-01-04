const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');

const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const EntryChecker = require('../utils/checkBeforeEntry');
const auth = require('../utils/auth');

const BaseController = require('./BaseController');
const { UUID } = require('sequelize');
const uuid = require('uuid');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class ServicesController extends BaseController {

    //TOKEN ADMIN SHOULD REQUIRED
    static async createBooking(req, res) {
        try {
            const body = req.body;
            const schema = {
                id_ws: Joi.string().max(120).required(),
                id_service: Joi.string().max(120).required(),
                jenis_pembayaran: Joi.string().max(120).required(),
                start_date: Joi.date().required(),
                end_date: Joi.date().required(),
                user_agent: Joi.string().required()
            };
            //JSON Request body
            

            const { error } = Joi.validate({
                id_ws: body.id_ws,
                id_service: body.id_service,
                jenis_pembayaran: body.jenis_pembayaran,
                start_date: body.start_date,
                end_date: body.end_date,
                user_agent: req.headers['user-agent'],
            }, schema);

            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
            const sanitizedIdWs = body.id_ws.replace(/[^a-zA-Z0-9_-]/g, '');
            const sanitizedIdService = body.id_service.replace(/[^a-zA-Z0-9_-]/g, '');
            const sanitizedJenisPembayaran = body.jenis_pembayaran.replace(/[^a-zA-Z0-9_-]/g, '');
            const sanitizedStartDate = body.start_date.replace(/[^a-zA-Z0-9_:.-]/g, '');
            const sanitizedEndDate = body.end_date.replace(/[^a-zA-Z0-9_:.-]/g, '');

            const id_booking_ws = uuid();
            let harga
            try{
                const getHarga = await super.getByCustomOptions(req, 'type_ws', { id: sanitizedIdService });
                harga = getHarga.dataValues.harga;
            } catch (error) {
                requestHandler.throwError(422, 'Unprocessable Entity', error)();
            }

            let userProfile
            try{
                const tokenFromHeader = auth.getJwtToken(req);
                const user = jwt.decode(tokenFromHeader);
                const options = {
                    where: { id: user.payload.id },
                };
                userProfile = await super.getByCustomOptions(req, 'users', options);
            }catch(error){
                requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
            }

            try{
                const getServices = await super.getByCustomOptions(req, 'services', { id_ws: sanitizedIdWs });
                if(!getServices){
                    requestHandler.throwError(422, 'Unprocessable Entity', 'services not found')();
                }
                console.log("HEYY", getServices)

            }   catch (error) {
                requestHandler.throwError(422, 'Unprocessable Entity', error)();
            }

            try{
                const checkBooking = await super.getByCustomOptions(req, 'booking_ws', { id_ws: sanitizedIdWs, start_date: sanitizedStartDate, end_date: sanitizedEndDate });
                if(checkBooking){
                    requestHandler.throwError(422, 'Unprocessable Entity', 'booking already exist')();
                }
            }   catch (error) {
                requestHandler.throwError(422, 'Unprocessable Entity', error)();
            }

            const data = {
                id: id_booking_ws,
                id_ws: sanitizedIdWs,
                id_user: userProfile.dataValues.id,
                id_service: sanitizedIdService,
                start_date: sanitizedStartDate,
                end_date: sanitizedEndDate,
                jenis_pembayaran: sanitizedJenisPembayaran,
                status: 'waiting',
                total_pembayaran: harga.toString(),
                payment_status: 0,
            }
            console.log("MASUK SINI ", data)

            const check = {
                user_agent: cleanedUserAgent,
            }

            if (EntryChecker(check)) {
                var resultRaw = await super.create(req, 'booking_ws', data);
                if (!(_.isNull(resultRaw))) {
                    const result = _.omit(resultRaw.dataValues, ['createdAt', 'updatedAt']);
                    requestHandler.sendSuccess(res, 'workspaces created')({ result });
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }

        } catch (error) {
            requestHandler.sendError(req, res, error);
        }

    }

    static async createServices(req, res) {
        try {
            const body = req.body;
            const schema = {
                id_ws: Joi.string().max(120).required(),
                id_type_ws: Joi.string().max(120).required(),
                start_date: Joi.date().required(),
                finish_date: Joi.date().required(),
                user_agent: Joi.string().required()
            };
            
            const { error } = Joi.validate({
                id_ws: body.id_ws,
                id_type_ws: body.id_type_ws,
                start_date: body.start_date,
                finish_date: body.finish_date,
                user_agent: req.headers['user-agent'],
            }, schema);

            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
            const sanitizedIdWs = body.id_ws.replace(/[^a-zA-Z0-9_-]/g, '');
            const sanitizedIdTypeWs = body.id_type_ws.replace(/[^a-zA-Z0-9_-]/g, '');

            const id_services = uuid();
            let userProfile
            try{
                const tokenFromHeader = auth.getJwtToken(req);
                const user = jwt.decode(tokenFromHeader);
                const options = {
                    where: { id: user.payload.id },
                };
                userProfile = await super.getByCustomOptions(req, 'users', options);
            }catch(error){
                requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
            }
	
            try{
                const getTypeWsById = await super.getByCustomOptions(req, 'type_ws', { id: sanitizedIdTypeWs });
                if(!getTypeWsById){
                    requestHandler.throwError(422, 'Unprocessable Entity', 'type_ws not found')();
                }
                console.log("HEYY", getTypeWsById)
                if(getTypeWsById.dataValues.id_ws != sanitizedIdWs){
                    requestHandler.throwError(422, 'Unprocessable Entity', 'type_ws not found')();
                }
            }catch(error){
                requestHandler.throwError(422, 'Unprocessable Entity', error)();
            }

            const data = {
                id: id_services,
                id_ws: sanitizedIdWs,
                id_type_ws: sanitizedIdTypeWs,
                id_user: userProfile.dataValues.id,
                start_date: body.start_date,
                finish_date: body.finish_date,
            }

            const check = {
                user_agent: cleanedUserAgent,
            }
            
            if(EntryChecker(check)) {
                var result = await super.create(req, 'services', data);
                if (!(_.isNull(result))) {
                    requestHandler.sendSuccess(res, 'services added')({ result });
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            }else{
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }

        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }

    static async getTypeWsById(req, res) {
        try {
            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');

            const check = {
                user_agent: cleanedUserAgent,
            }

            if (EntryChecker(check)) {
                var resultRaw = await super.getById(req, 'type_ws');
                if (!(_.isNull(resultRaw))) {
                    const result = _.omit(resultRaw.dataValues, ['createdAt', 'updatedAt', 'password']);
                    requestHandler.sendSuccess(res, 'success')({ result });
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }
        } catch (error) {
            requestHandler.sendError(req, res, error)
        }
    }


}

module.exports = ServicesController;