const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const BaseController = require('../controllers/BaseController');

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const auth = require('../utils/auth');

class ItemsController extends BaseController {
    static async getUserItems(req, res) {
        try {
            const tokenData = auth.getSomeFromToken(req, ['payload.id']);
            const id_user = tokenData.payload.id;
            const options = {
                where: { id_user: id_user }
            };
            const items = await super.getByCustomOptions(req, 'items', options);
            requestHandler.sendSuccess(res, 'success', 200)(items);
        } catch (error) {
            requestHandler.sendError(req, res, error);
        }
    }
}

module.exports = ItemsController;