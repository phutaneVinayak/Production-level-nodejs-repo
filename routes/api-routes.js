const express = require('express');
const apiRouter = express();

apiRouter.use('/v1', require('./v1/v1-routes'));

module.exports = apiRouter;
