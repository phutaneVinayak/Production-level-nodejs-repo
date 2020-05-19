const logger = require('../../common/logger');

function  ExceptionHandling(error) {
    console.log("error in ExceptionHandling", typeof error);

    if (error.code != undefined) {
        logger.error(`error code - ${error.code} stack trace \n`, error.message);
        if (error.code ==  'ResourceNotFoundException') {
            // report it to log files
            return {
                message: 'Database internal error',
                code: 'TBLNF',
                time: new Date().getTime(),
                statusCode: error.statusCode
            }
        }
        if(error.code == 'ResourceInUseException') {
            return {
                message: 'Database internal error',
                code: 'TBLNF',
                time: new Date().getTime(),
                statusCode: error.statusCode
            }
        }
    } else {
        // error is system generated error
        // console.log("instance of error is",  error);
        if (error instanceof ReferenceError) {
            return {
                message: 'Application inernal error',
                code: 'ReferenceError',
                time: new Date().getTime(),
                statusCode: 500
            }
        } else {
            return {
                message: 'Application inernal error',
                code: 'systemError',
                time: new Date().getTime(),
                statusCode: 500
            }
        }
    }
}

module.exports = {
    ExceptionHandling
}