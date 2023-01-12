const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const async = require('async');
const jwt = require('jsonwebtoken');

const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const EntryChecker = require('../utils/checkBeforeEntry');
const auth = require('../utils/auth');

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
                email: Joi.string().email().max(120).required(),
                name: Joi.string().max(120).required(),
                address: Joi.string().max(150).required(),
                password: Joi.string().max(100).required(),
                mobile_number: Joi.number().required(),
                description: Joi.string().max(2000).required(),
                longtitude: Joi.number(),
                latitude: Joi.number(),
                user_agent: Joi.string().max(200).required(),
            };
            
            const { error } = Joi.validate({
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

            let userProfile;
            try {
                const tokenFromHeader = auth.getJwtToken(req);
                const user = jwt.decode(tokenFromHeader);
                const options = {
                    where: { id: user.payload.id },
                };
                userProfile = await super.getByCustomOptions(req, 'users', options);
            } catch (error) {
                requestHandler.throwError(422, 'Unprocessable Entity', error)();
            }

            const data = {
                id: id_workspace,
                id_user: userProfile.dataValues.id,
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
                var resultRaw = await super.create(req, 'workspaces', data);
                if (!(_.isNull(resultRaw))) {
                    const result = _.omit(resultRaw.dataValues, ['createdAt', 'updatedAt', 'password', 'id_user']);
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
            const reqParamsId = req.params.id;
            const schema = {
                id: Joi.string().max(120).required(),
                user_agent: Joi.string().max(150).required(),
            };

            const { error } = Joi.validate({
                id: reqParamsId,
                user_agent: req.headers['user-agent'],
            }, schema);
            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
            const cleanedId = reqParamsId.replace(/[^a-zA-Z0-9_-]/g, '');

            const check = {
                user_agent: cleanedUserAgent,
            }

            if(EntryChecker(check)){
                const options = {
                    where: {id_ws: cleanedId}
                }
                const result = await super.customSelectQuery(req, `
                    SELECT * FROM type_ws INNER JOIN
                    services ON type_ws.id = services.id_type_ws WHERE type_ws.id_ws = '${cleanedId}'
                `)
                console.log(result)
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

    static async getServicesByIdWs(req, res) {
        try {
            const reqParamsId = req.params.id;
            const schema = {
                id: Joi.string().max(120).required(),
                user_agent: Joi.string().max(150).required(),
            };

            const { error } = Joi.validate({
                id: reqParamsId,
                user_agent: req.headers['user-agent'],
            }, schema);
            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');

            const cleanedUserAgent = req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, '');
            const cleanedId = reqParamsId.replace(/[^a-zA-Z0-9_-]/g, '');

            const check = {
                user_agent: cleanedUserAgent,
            }

            if (EntryChecker(check)) {
                const options = {
                    where: { id_ws: cleanedId }
                }
                const result = await super.getList(req, 'services', options);
                if (!(_.isNull(result))) {
                    requestHandler.sendSuccess(res, 'success')({ result });
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

    static async getBookingByIdWs(req, res) {
        try{
            const id_ws = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
            const tokenFromHeader = auth.getJwtToken(req);
            const user = jwt.decode(tokenFromHeader);
            const cleanedId = user.payload.id.replace(/[^a-zA-Z0-9_-]/g, '');
            const schema = {
                id_ws: Joi.string().max(120).required(),
                user_agent: Joi.string().required()
            };

            const { error } = Joi.validate({
                id_ws: id_ws,
                user_agent: req.headers['user-agent'],
            }, schema);

            requestHandler.validateJoi(error, 400, 'bad Request', error ? error.details[0].message : '');
            const check = {
                user_agent: req.headers['user-agent'].replace(/[^a-zA-Z0-9_-]/g, ''),
            }
            if(!EntryChecker(check)){
                requestHandler.throwError(400, 'bad request', 'please provide all required headers')();
            }
            //check if user own the workspace
            console.log(user.payload);
            if(_.isUndefined(user.payload.workspaces)){
                requestHandler.throwError(401, 'Unauthorized', 'you dont have access to this resources')();
            }
           
            if(user.payload.workspaces.indexOf(id_ws) === -1){
                requestHandler.throwError(401, 'Unauthorized', 'you dont have access to this resources')();
            }
            //////////////////////////////////

            const page = req.query.page.replace(/[^0-9_-]/g, '');
            const perPage = 10;
            const offset = (page - 1) * perPage;

            const getDaBooking = await super.customSelectQuery(req, `
                SELECT * FROM booking_ws WHERE id_user = '${cleanedId}'
                LIMIT ${perPage} OFFSET ${offset}
            `);
            console.log(getDaBooking);

            const result = getDaBooking;
            requestHandler.sendSuccess(res, 'success')({ result });
        }catch(error){
            requestHandler.sendError(req, res, error);
        }
    }


}

module.exports = WorkspaceController;