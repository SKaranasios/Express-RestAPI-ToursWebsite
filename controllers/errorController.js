const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFIledsDB = err => {
  const value = err.keyValue.name;
  //const value = err.errmsg.match();

  const message = `Duplicate field value: ${value} Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  //Operation error,send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  //Also some mongoose errors will have to be marked as operational to be seen.
  //Programming error don;t want to leak details to the client
  else {
    //1)Log error
    console.error('ERROR', err);

    //2)send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //let error = { ...err };
    //let error = Object.create(err);
    //if (error.name === 'CastError') error = handleCastErrorDB(error);
    //if (error.message.includes('Cast')) error = handleCastErrorDB(error);

    //its not proper destructurizing object -- mongoose change the way
    let error = { ...err };
    error.name = err.name;
    error.code = err.code;

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    //error not created by mongoose but mongo db deiver
    if (error.code === 11000) {
      error = handleDuplicateFIledsDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }

    sendErrorProd(error, res);
  }
};
