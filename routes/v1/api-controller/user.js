const express = require('express');
const logger = require('../../../common/logger');
const app = express();
const authTokenController = require('../../../common/auth-token');
const errorHandler = require('../../../utilities/errorHandling/errorUtilities');

const userService = require('../services/userService');
app.post('/login', (req, res) => {
  logger.info('inside login ', req.body);
  let body = {
    email: req.body.email || '',
    password: req.body.password || '',
    ip: req.ip
  }
  userService.userLogin(body)
    .then(loginResult => {
      logger.info("userLogin opration is successful", '');
      if (loginResult.statusCode == 200) { 
        // res.cookie().set()
        res.status(200).json(loginResult)
      } else if (loginResult.statusCode == 400) {
        res.status(400).json(loginResult)
      } else {
        res.status(loginResult.statusCode).json(loginResult)
      }
    }, error => {
      let parseError = errorHandler.ExceptionHandling(error);
      res.status(parseError.statusCode).json(parseError);
    })
});

app.get('/verifyOTP', (req, res) => {
  // let user_OTP = req.query.user_OTP;
  let queryParams = {
    user_OTP: req.query.user_OTP,
    user_mobileNumber: req.query.user_mobileNumber,
    login: req.query.operations == 'login' ? true: false,
    ip: `${req.ip}`
  }
  userService.verifyOTP(queryParams)
  .then(otpVerifyResult => {
    logger.info("OTP Verification successful.", '');
    if (otpVerifyResult.statusCode == 200) { 
      res.status(200).json(otpVerifyResult)
    } else if (otpVerifyResult.statusCode == 400) {
      res.status(400).json(otpVerifyResult)
    } else {
      res.status(otpVerifyResult.statusCode).json(otpVerifyResult)
    }
  }, error => {
    let parseError = errorHandler.ExceptionHandling(error);
    res.status(parseError.statusCode).json(parseError);
  })
})

app.get('/userDetails',authTokenController.authenticateAccessToken, (req, res) => {
  res.send("ok")
}, error => {
  let parseError = errorHandler.ExceptionHandling(error);
  res.status(parseError.statusCode).json(parseError);
})

app.get('/newToken', authTokenController.authenticateRefreshToken);

module.exports = app;
