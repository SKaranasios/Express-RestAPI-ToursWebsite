const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

//DEVELOPMENT LOGIN
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  //1 hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

//SET SECURITY HTTP HEADERS
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//1.middleware for all routes
//app.use(morgan('dev'));
//BODY PARSER
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));

//this should come first  over other route middleware
app.use((req, res, next) => {
  console.log(req.headers);
  next();
});

//MIDDLEWARE USE for this specific.route-- RES,REQ
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
  // const err = new Error(`Cant find ${req.originalUrl} on this  Server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  //skip alla middlwares and go to eroor middleware
  next(new AppError(`Cant find ${req.originalUrl} on this  Server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
