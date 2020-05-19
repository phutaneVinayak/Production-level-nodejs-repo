const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./common/logger');
const helmet = require('helmet');
const app = express();
const port = 3000;

app.use(helmet({}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: true}));


app.use(function(req, res, next) {
  logger.info('Request Path is ', `${req.url} - Method ${req.method}`);
  next();
});

app.get('/', (req, res) => {
  res.send('App work Hurey!!!!');
});

app.use('/api', require('./routes/api-routes'));


app.listen(port, (err)=>{
  if (err) logger.error('Error while starting server', err);

  logger.info('Running server on port ::::', port);
});
