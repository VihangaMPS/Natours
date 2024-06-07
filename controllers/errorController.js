const AppError = require('../utils/appError');

// =============== Handling Errors In Development Mode =================
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

// =============== Handling Errors In Production Mode =================
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value} Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(element => element.message);

    const message = `Invalid input data ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJwTError = () => {
    return new AppError('Invalid Token. Please Login again!', 401);
}

const handleJWTExpiredError = () => {
    return new AppError('Your Token has Expired!  Please login again', 401);
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    // Programming or other unknown error: don't leak error details
    else {
        // 1) Log error
        console.error('Error ❌', 404);

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }
}

// =============== Main Error Control Center ===================
module.exports = (err,req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000 ) err = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') err = handleJwTError();
        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()

        sendErrorProd(err, res);
    }
};