const express = require('express');
const v1ApiRouter = express();

v1ApiRouter.use('/user', require('./api-controller/user'))

module.exports = v1ApiRouter;

