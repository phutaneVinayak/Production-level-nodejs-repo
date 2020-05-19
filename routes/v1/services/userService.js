const logger = require('../../../common/logger');
const dynamoDbOps = require('../../../database/dynamoDB');
const AwsSnsMsgService = require('../../../common/AWS-SNS-MSG-Service');
const authToken = require('../../../common/auth-token');

async function userLogin(userBody) {
    logger.info('INSIDE user login service', '')

    let params = {
        TableName: 'user_info',
        KeyConditionExpression: 'email= :input_email_id',
        ExpressionAttributeValues: {
            ':input_email_id': userBody.email
        }
    }
    
    let result = await dynamoDbOps.queryScan(params);
    
    
    if (result.Items[0].password === userBody.password) {
        logger.info('INSIDE user password is match', '')
        // update last login date 
        let params = {
            TableName: 'user_info',
            Key: {
                "email": userBody.email,
                "phone_number": result.Items[0].phone_number
            },
            UpdateExpression: 'set last_login_dtm = :new_date',
            ExpressionAttributeValues: {
                ':new_date': `${new Date().toLocaleDateString()}`
            },
            ReturnValues:"UPDATED_NEW"
        }

        // independent async ops
        dynamoDbOps.updateItem(params);
        let OTP = Math.floor(100000 + Math.random() * 900000); // Create 6 DIGIT OTP
        
        logger.info(`Starting OTP Services. sending OTP to ${result.Items[0].phone_number}`, '');
        await AwsSnsMsgService.sendOTPSMS(result.Items[0].phone_number, OTP);

        logger.info(`Dumping OTP to DB start`, ``);
        // updateing OTP details in DB 
        let OtpParams = {
            TableName: 'otp_bk',
            Item: {
                "otp_token": OTP,
                "phone_number": result.Items[0].phone_number,
                "email": userBody.email,
                "expire_time": new Date().getTime() + 900000,
                "token_status": "A"
            }
        }

        // updating generated token into DB
        dynamoDbOps.putItem(OtpParams); // INNDEPENDT OPS async functionality

        logger.info('All important process has been completed for login return ing success model', '');

        return {
            message: `OTP has been send to your register mobile Number ${result.Items[0].phone_number}`,
            mobileNumber: result.Items[0].phone_number,
            code: 'Success',
            time: new Date().getTime(),
            statusCode: 200,
        }
    } else {
        logger.info(`Password Does not match for ${userBody.email}`);
        return {
            message: 'Provide password does not match',
            code: 'PasswordIncorrect',
            time: new Date().getTime(),
            statusCode: 400,
        }
    }
}

async function verifyOTP(userOTPDetail) {
    logger.info(`INSIDE verifyOTP`, userOTPDetail);

    let params = {
        TableName: 'otp_bk',
        Key: {
            "otp_token": +userOTPDetail.user_OTP,
            "phone_number":  +userOTPDetail.user_mobileNumber
        }
    }

    let result = await dynamoDbOps.getItem(params);
    console.log("OTP retrival value", result);
    if (result != {}) {
        let matchOTP = result;
        let currentTime = new Date().getTime();

        logger.info("currentTime", currentTime);
        logger.info("matchOTP.expire_time", +matchOTP.expire_time);
        logger.info("matchOTP.token_status", matchOTP.token_status);

        if((+matchOTP.expire_time) > currentTime && matchOTP.token_status === 'A') {
            logger.info("User OTP match and it not expire", '');
            await updateOTPStatus(matchOTP);

            if (userOTPDetail.login === true) {
                let userPayload = {
                    'email': matchOTP.email,
                    'mobile_number': matchOTP.phone_number
                }
        
                let { access_token, refresh_token } = authToken.generateAccessRefreshToken(userPayload);
        
                let saveRefreshTokenObj = {
                    refresh_token,
                    email:  matchOTP.email,
                    ip: userOTPDetail.ip,
                    status: 'A'
                }
                await _saveRefreshToken(saveRefreshTokenObj);

                return {
                    message: `Your are login successfully`,
                    code: 'Success',
                    time: new Date().getTime(),
                    access_token,
                    refresh_token,
                    statusCode: 200,
                }
            } else {
                return {
                    message: 'OTP verification sucessful.',
                    code: 'success',
                    time: new Date().getTime(),
                    statusCode: 200
                }
            }

        } else {
            await updateOTPStatus(matchOTP);
            return {
                message: 'Provide OTP expired',
                code: 'OTPExpired',
                time: new Date().getTime(),
                statusCode: 400,
            }
        }
    } else {
        logger.info(`OTP Does not match`, '');
        return {
            message: 'Provide OTP does not match',
            code: 'OTPIncorrect',
            time: new Date().getTime(),
            statusCode: 400,
        }
    }
}

async function updateOTPStatus(recordItem) {
    logger.info(`INSIDE updateOTPStatus`, recordItem);

    let params = {
        TableName: 'otp_bk',
        Key: {
            "otp_token": +recordItem.otp_token,
            "phone_number":  +recordItem.phone_number
        },
        UpdateExpression: 'set token_status = :new_status',
        ExpressionAttributeValues: {
            ':new_status': `D`
        },
        ReturnValues:"UPDATED_NEW"
    }

    let result = await dynamoDbOps.updateItem(params);   
    logger.info(`OTP Item updated`, ``); 
    return `OTP Item updated`;
}

async function _saveRefreshToken(refreshTokenObject) {
    logger.info('INSIDE _saveRefreshToken save operations',  '');

    let tokenObject = {
        TableName: "refsh_tkn_tbl",
        Item: {
            "token": refreshTokenObject.refresh_token,
            "email": refreshTokenObject.email,
            "ip_addr": `${refreshTokenObject.ip}`,
            "created_dtm": new Date().getTime(),
            "status": "A"
        }
    }

   let saveTokenResult =  await dynamoDbOps.putItem(tokenObject);

   console.log("saveTokenResult", saveTokenResult);
    return saveTokenResult;
}

module.exports = {
    userLogin,
    verifyOTP
}