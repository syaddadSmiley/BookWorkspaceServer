const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');

const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const EntryChecker = require('../utils/checkBeforeEntry');

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
            // const schema = {
            //     id_ws: Joi.string().max(50).required(),
            //     id_type_ws: Joi.string().max(50).required(),
            //     id_user: Joi.string().max(50).required(),
            //     st
            //     user_agent: Joi.string().required()
            // };

            const { error } = Joi.validate({
                id_ws: body.id_ws,
                kapasitas: body.kapasitas,
                type: body.type,
                harga: body.harga,
                user_agent: req.headers['user-agent'],
            }, schema);

            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');

            const id_type_ws = uuid();

            const data = {
                id: id_type_ws,
                id_ws: body.id_ws,
                kapasitas: body.kapasitas,
                type: body.type,
                harga: body.harga,
            }

            const check = {
                user_agent: cleanedUserAgent,
            }

            if (EntryChecker(check)) {
                var result = await super.create(req, 'type_ws', data);
                if (!(_.isNull(result))) {
                    requestHandler.sendSuccess(res, 'type workspace added')({ result });
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
                id_ws: Joi.string().max(50).required(),
                id_type_ws: Joi.string().max(50).required(),
                id_user: Joi.string().max(50).required(),
                start_date: Joi.date().required(),
                finish_date: Joi.date().required(),
                user_agent: Joi.string().required()
            };
            
            const { error } = Joi.validate({
                id_ws: body.id_ws,
                id_type_ws: body.id_type_ws,
                id_user: body.id_user,
                start_date: body.start_date,
                finish_date: body.finish_date,
                user_agent: req.headers['user-agent'],
            }, schema);

            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
            const sanitized = _.omit(body, ['user_agent']);
            console.log(sanitized);
            requestHandler.sendError(req, res, sanitized);

            const id_services = uuid();
            const data = {
                id: id_services,
                id_ws: body.id_ws,
                id_type_ws: body.id_type_ws,
                id_user: body.id_user,
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

    static async deleteTypeWsById(req, res) {
        try {
            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');

            const check = {
                user_agent: cleanedUserAgent,
            }
            if (EntryChecker(check)) {
                var result = await super.deleteById(req, 'type_ws');
                if (!(_.isNull(result))) {
                    requestHandler.sendSuccess(res, 'deleted')({ result })
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }

}

module.exports = ServicesController;