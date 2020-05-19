/**
 * This file will to following ops 
 * create a token
 * validate token
 */

const jwt = require('jsonwebtoken');
const dynamoDBOps = require('../database/dynamoDB');
const logger = require('./logger');
const errorHandler = require('../utilities/errorHandling/errorUtilities');
require('dotenv').config();

function generateAccessRefreshToken(userPayload) {
    access_token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: +process.env.ACCESS_TOKEN_TIME});
    refresh_token = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: +process.env.REFRESH_TOKEN_TIME});

    return { access_token, refresh_token }
}

function authenticateAccessToken(req, res, next) {
    logger.info(`INSIDE authenticateAccessToken Fn`, '');
    const access_token = req.body.token || req.query.token || req.headers['x-access-token'];
    console.log("access_token", access_token);
    if (access_token) {
        jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, function(err, payload) {
            if (err) {
                console.log("err", err);
                res.status(401).json({
                    message: 'Unathorised Access.',
                    code: 'TokenExpiredError',
                    time: new Date().getTime(),
                    statusCode: 401
                });
            } else {
                console.log("payload value", payload);
                next()
            }
        })
    } else {
        res.status(403).json({
            message: 'Access token not provided.',
            code: 'TokenNotFoundError',
            time: new Date().getTime(),
            statusCode: 403
        })
    }
}

async function authenticateRefreshToken(req, res, next) {
    try {
        logger.info(`INSIDE authenticateRefreshToken Fn`, '');
        const refresh_token = req.body.token || req.query.token || req.headers['x-refresh-token'];
        console.log("refresh_token", refresh_token)
        if (refresh_token) {
            let params = {
                refresh_token,
                email: req.query.email
            }
            let refreshTokenDetails = await _getRefreshToken(params);
     
            if (refreshTokenDetails.ip_addr === `${req.ip}` && refreshTokenDetails.status === 'A') {
                jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, function(err, payload) {
                    console.log("errrp ", err)
                    if (err) {
                        res.status(401).json({
                            message: 'Unathorised Access.',
                            code: 'JWTError',
                            time: new Date().getTime(),
                            statusCode: 401
                        });
                    } else {
                        let userPayload = {
                            'email': req.query.email,
                            'mobile_number': req.query.phone_number
                        }
                        // Generate new token
                        let { access_token, refresh_token} = generateAccessRefreshToken(userPayload);
    
                        // deactivate new token genegration system
                        // let saveRefreshTokenPayload = {
                        //     "token": refresh_token,
                        //     "email": userPayload.email,
                        //     "ip_addr": req.ip
                        // }
                        // await _saveRefreshTokenPayload(saveRefreshTokenPayload);
    
                        res.status(200).json({
                            access_token,
                            message: 'New token issued',
                            code: 'Success',
                            time: new Date().getTime(),
                            statusCode: 200
                        })
                    }
                })
            } else {
                res.status(401).json({
                    message: 'Refresh Token is not request from its orginal request owner.',
                    code: 'IPOrginError',
                    time: new Date().getTime(),
                    statusCode: 401
                })
            }
        } else {
            res.status(403).json({
                message: 'Refresh Token not provided.',
                code: 'JWTError',
                time: new Date().getTime(),
                statusCode: 403
            })
        }
    } catch(err) {
        // console.log("err instance is ", typeof err);
        let parseError = errorHandler.ExceptionHandling(err);
        res.status(parseError.statusCode).json(parseError);
    }
}

async function _getRefreshToken(queryParams) {
    logger.info(`INSIDE _getRefreshToken Fn`, '');
    let  paramObject = {
        TableName: "refsh_tkn_tbl",
        Key: {
            "token": queryParams.refresh_token,
            "email": queryParams.email
        }
    }
    return await dynamoDBOps.getItem(paramObject);
}

async function _saveRefreshToken(userTokenData) {
    logger.info(`INSIDE _saveFreshToken Fn`, '');
    let tokenObject = {
        TableName: "refsh_tkn_tbl",
        Item: {
            "token": userTokenData.refresh_token,
            "email": userTokenData.email,
            "ip_addr": `${userTokenData.ip_addr}`,
            "created_dtm": new Date().getTime(),
            "status": "A"
        }
    }

    let saveTokenResult =  await dynamoDbOps.putItem(tokenObject);

    console.log("saveTokenResult", saveTokenResult);
    return saveTokenResult;
}

module.exports = {
    generateAccessRefreshToken,
    authenticateAccessToken,
    authenticateRefreshToken
}