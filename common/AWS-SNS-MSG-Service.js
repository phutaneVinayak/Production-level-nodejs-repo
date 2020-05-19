const logger = require('./logger');
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
});

const SNS = new AWS.SNS();
SNS.setSMSAttributes()

async function sendOTPSMS(phone_number, OTP) {
    logger.info(`INSIDE sendOTPSMS `, ``)
    let msgSendDetails = await SNS.publish({
        Message: `Your OTP IS ${OTP}`,
        PhoneNumber: `+91${phone_number}`,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                "DataType": "String",
                "StringValue": "DMawsToken"
            },
            "AWS.SNS.SMS.SMSType": {
                "DataType": "String",
                "StringValue": "Transactional"
            }
        }
    }).promise();

    logger.info(`msgSendDetails.MessageId`, msgSendDetails.MessageId)

    return     msgSendDetails.MessageId;
}

module.exports = {
    sendOTPSMS
}