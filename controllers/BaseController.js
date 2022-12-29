

const _ = require('lodash');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');


const logger = new Logger();
const errHandler = new RequestHandler(logger);
class BaseController {
	constructor(options) {
		this.limit = 20;
		this.options = options;
	}

    /**
    * Get an element by it's id .
    *
    *
    * @return a Promise
	* @return an err if an error occur
    */
	static async getById(req, modelName) {
		// const reqParam = req.params.id;
		const reqParam = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
		logger.log(reqParam, 'warn');
		let result;
		try {
			result = await req.app.get('db')[modelName].findByPk(reqParam).then(
				errHandler.throwIf(r => !r, 404, 'not found', 'Resource not found'),
				errHandler.throwError(500, 'sequelize error ,some thing wrong with either the data base connection or schema'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async getByCustomOptions(req, modelName, options) {
		let result;
		try {
			result = await req.app.get('db')[modelName].findOne(options);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async deleteById(req, modelName) {
		// const reqParam = req.params.id;
		const reqParam = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
		let result;
		try {
			result = await req.app.get('db')[modelName].destroy({
				where: {
					id: reqParam,
				},
			}).then(
				errHandler.throwIf(r => r < 1, 404, 'not found', 'No record matches the Id provided'),
				errHandler.throwError(500, 'sequelize error'),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async create(req, modelName, data) {
		let obj = data;
		if (_.isUndefined(obj)) {
			obj = req.body;
		}
		let result;
		try {
			result = await req.app.get('db')[modelName].build(obj).save().then(
				errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt save data'),
				errHandler.throwError(500, 'sequelize error'),

			).then(
				savedResource => Promise.resolve(savedResource),
			);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}


	static async updateById(req, modelName, data) {
		const recordID = req.params.id;
		let result;

		try {
			result = await req.app.get('db')[modelName]
				.update(data, {
					where: {
						id: recordID,
					},
				}).then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt update data'),
					errHandler.throwError(500, 'sequelize error'),

				).then(
					updatedRecored => Promise.resolve(updatedRecored),
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async updateByCustomWhere(req, modelName, data, options) {
		let result;

		try {
			result = await req.app.get('db')[modelName]
				.update(data, {
					where: options,
				}).then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong couldnt update data'),
					errHandler.throwError(500, 'sequelize error'),

				).then(
					updatedRecored => Promise.resolve(updatedRecored),
				);
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

	static async getList(req, modelName, options) {
		const page = options.page;
		
		const limit = 20;
		let results;
		try {
			if (_.isUndefined(options)) {
				options = {};
			}

			if (parseInt(page, 10)) {
				if (page === 0) {
					options = _.extend({}, options, {});
				} else {
					options = _.extend({}, options, {
						offset: limit * (page - 1),
						limit: limit,
					});
				}
			} else {
				if(options.status === "noAll"){
					options = _.extend({}, options, {
						offset: limit * (page - 1),
						limit: limit,
					});
				}
				options = _.extend({}, options, {}); // extend it so we can't mutate
			}

			results = await req.app.get('db')[modelName]
				.findAll(options)
				.then(
					errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong while fetching data'),
					errHandler.throwError(500, 'sequelize error'),
				).then(result => Promise.resolve(result));
		} catch (err) {
			return Promise.reject(err);
		}
		return results;
	}

	static async customSelectQuery(req, querySelect) {
		let result;
		try {
			// sequelize.query(`SELECT
			result = await req.app.get('db').sequelize.query(querySelect, 
				{ type: req.app.get('db').sequelize.QueryTypes.SELECT
			}).then(
				errHandler.throwIf(r => !r, 500, 'Internal server error', 'something went wrong while fetching data'),
				errHandler.throwError(500, 'sequelize error'),
			).then(result => Promise.resolve(result));
		} catch (err) {
			return Promise.reject(err);
		}
		return result;
	}

}
module.exports = BaseController;
