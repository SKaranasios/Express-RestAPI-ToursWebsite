const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1.middleware for all routes
app.use(morgan('dev'));
app.use(express.json());

//MIDDLEWARE USE for this specific.route-- RES,REQ
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
