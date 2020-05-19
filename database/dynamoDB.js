const AWS = require('aws-sdk');
const logger = require('../common/logger');
require('dotenv').config();

AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

AWS.config.getCredentials(function(err) {
    if (err) logger.info('Unable to connect to AWS with given credentials', err.stack)
    //console.log(err.stack);
    else {
        logger.info('Connection to AWS with given credentials successful', '');
    }
  });

const docClient = new AWS.DynamoDB.DocumentClient();

async function putItem(params){
    logger.info("request for putItem with following params", params);
    let result = await docClient.put(params).promise();
    logger.info("request for putItem is successful.", '');
    return { recordUpdated: 1 };
}

async function getItem(params) {
        logger.info("request for getItem with following params", params);
        let result = await docClient.get(params).promise();
        return result.Item;
}

async function updateItem(updateParams) {
    logger.info('request for updateItem with following params', updateParams);

    return await docClient.update(updateParams).promise();
}

async function deleteItem(deleteParams) {
    logger.info('request for deleteItem with following params', deleteParams);
    return await docClient.delete(updateParams).promise();
}

// Query and Scan Data
async function queryScan(queryScanParams) {
    logger.info('request for queryScan with following params', queryScanParams);
    return await docClient.query(queryScanParams).promise();
}

module.exports = {
    putItem,
    getItem,
    updateItem,
    deleteItem,
    queryScan
}