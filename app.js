const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//1.middleware for all routes
//app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//MIDDLEWARE USE for this specific.route-- RES,REQ
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
