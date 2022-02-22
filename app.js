const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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

app.all('*', (req, res, next) => {
  // const err = new Error(`Cant find ${req.originalUrl} on this  Server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  //skip alla middlwares and go to eroor middleware
  next(new AppError(`Cant find ${req.originalUrl} on this  Server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
