const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');

const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const EntryChecker = require('../utils/checkBeforeEntry');

const BaseController = require('../controllers/BaseController');
const { UUID } = require('sequelize');
const uuid = require('uuid');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};

class WorkspaceController extends BaseController {

    //TOKEN ADMIN SHOULD REQUIRED
    static async createWorkspaces(req, res) {
        try{

            const body = req.body;
            const schema = {
                id_service: Joi.string().max(50),
                id_type: Joi.string().max(50),
                id_url: Joi.string().max(50),
                email: Joi.string().email().max(50).required(),
                name: Joi.string().max(50).required(),
                address: Joi.string().max(150).required(),
                password: Joi.string().max(100).required(),
                mobile_number: Joi.number().required(),
                description: Joi.string().max(2000).required(),
                longtitude: Joi.number(),
                latitude: Joi.number(),
                user_agent: Joi.string().max(200).required(),
            };
            
            const { error } = Joi.validate({
                id_service: body.id_service,
                id_type: body.id_type,
                id_url: body.id_url,
                email: body.email,
                name: body.name,
                address: body.address,
                password: body.password,
                mobile_number: body.mobile_number,
                description: body.description,
                longtitude: body.longtitude,
                latitude: body.latitude,
                user_agent: req.headers['user-agent'],
            }, schema);
            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');

            const id_workspace = uuid();

            const data = {
                id: id_workspace,
                id_service: body.id_service,
                id_type: body.id_type,
                id_url: body.id_url,
                email: body.email,
                name: body.name,
                address: body.address,
                password: body.password,
                mobile_number: body.mobile_number,
                description: body.description,
                longtitude: body.longtitude,
                latitude: body.latitude,
            }

            const check = {
                user_agent: cleanedUserAgent,
            }

            if (EntryChecker(check)) {
                var result = await super.create(req, 'workspaces', data);
                if (!(_.isNull(result))) {
                    requestHandler.sendSuccess(res, 'workspaces created')({ result });
                }else{
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            }else{
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }

        }catch (error) {
            requestHandler.sendError(req, res, error);
        }

    }

    static async getWsById(req, res) {
        try{


            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
            
            const check = {
                user_agent: cleanedUserAgent,
            }

            if (EntryChecker(check)) {
                var resultRaw = await super.getById(req, 'workspaces');
                if (!(_.isNull(resultRaw))) {
                    const result = _.omit(resultRaw.dataValues, ['createdAt', 'updatedAt', 'password']);
                    requestHandler.sendSuccess(res, 'success')({ result });
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }

        }catch(error){
            requestHandler.sendError(req, res, error);
        }
    }

    static async deleteWsById(req, res) {
        try{
            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');

            const check = {
                user_agent: cleanedUserAgent,
            }
            if(EntryChecker(check)) {
                var result = await super.deleteById(req, 'workspaces');
                if(!(_.isNull(result))) {
                    requestHandler.sendSuccess(res, 'deleted')({result})
                }
            } else {
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }
        }catch (error){
            requestHandler.sendError(req, res, error)
        }
    }

    static async getAllWorkspaces(req, res) {
        try{
        //VALIDATE REQ BODY
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
            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g,'');

            const data = {
                perPage: parseInt(req.query.per_page, 10),
                page: parseInt(req.query.page, 10),
                offset: 0,
                status: "noAll",
            }

            const check = {
                user_agent: cleanedUserAgent,
            }
           
            if (EntryChecker(check)) {
                if (data.perPage === 0){
                    data.perPage = 20;
                }
        
                if (data.page === 0){
                    data.page = 1;
                }
        
                data.offset = (data.page - 1) * data.perPage;
                
                const workspaces = await super.getList(req, "workspaces", data);
                requestHandler.sendSuccess(res, 'success')({ workspaces });
            }else {
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }
        }catch (error){
            requestHandler.sendError(req, res, error);
        }
    }

    static async getTypeWs(req, res) {
        try {
            const body = req.body;
            const schema = {
                id: Joi.string().max(50).required(),
                user_agent: Joi.string().max(150).required(),
            };

            const { error } = Joi.validate({
                id: body.id,
                user_agent: req.headers['user-agent'],
            }, schema);
            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
            const cleanedId = body.id.replace(/[^a-zA-Z0-9_-]/g, '');

            const check = {
                user_agent: cleanedUserAgent,
            }

            if(EntryChecker(check)){
                const options = {
                    where: {id_ws: cleanedId}
                }
                const result = await super.getList(req, 'type_ws', options);
                if (!(_.isNull(result))) {
                    requestHandler.sendSuccess(res, 'success')({ result });
                } else {
                    requestHandler.throwError(422, 'Unprocessable Entity', 'unable to process the contained instructions')();
                }
                
            }else{
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }
        }catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }
}

module.exports = WorkspaceController;