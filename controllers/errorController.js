const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0]; // The field with the duplicate key
  const value = err.keyValue[field]; // The duplicate value
  const message = `Duplicate field value: '${value}'. Please use another value for the '${field}' field!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  //Join all the errors together in one single string
  const message = `Invalid input data: ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const handleJWTErrorDB = () => new AppError('Invalid Token.Please login', 401);

const handleJWTExpiredDB = () =>
  new AppError('Your token has expired! please login again', 401);

const sendErrorDev = (err, req, res) => {
  //A} API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      err: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B} RENDERED WEBSITE
  console.error('ERROR! 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    // A} Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B} Programming or other unknown errors: Don't leak error details
    console.error('ERROR! 💥', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // RENDERED WEBSITE
  // A} Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B} Programming or other unknown errors: Don't leak error details
  console.error('ERROR! 💥', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  // Ensure statusCode and status are set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Clone the error object using object spread to include enumerable properties
    let error = { ...err };

    // Include prototype properties like `name` and ensure `message` is passed explicitly
    error.name = err.name;
    error.message = err.message;
    if (err.keyValue) error.keyValue = err.keyValue;

    // Handle specific errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTErrorDB();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredDB();

    sendErrorProd(error, req, res);
  }
};
