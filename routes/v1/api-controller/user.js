const express = require('express');
const logger = require('../../../logger');
const app = express();

const userService = require('../services/userService');
app.get('/login', (req, res) => {
  logger.info('inside login ');
  userService.userLogin()
    .then(loginResult => {
      console.log("loginResult", loginResult);
      res.send(loginResult)
    }, error => {
      res.send("Error while doing login operations");
    })
});

module.exports = app;
