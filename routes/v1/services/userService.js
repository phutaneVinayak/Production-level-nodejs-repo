const logger = require('../../../logger');
async function userLogin(userParameter) {
    logger.info('INSIDE user login service', '')
    return 'success';
}

module.exports = {
    userLogin
}