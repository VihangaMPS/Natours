const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const  userRouter = require('./routes/userRoutes');

const app = express(); // Main Router

// ================== Middleware =====================
    // ----------- Middleware to send the req json body when we create(POST) -----------
app.use(express.json({
    limit: '10kb'
}));

    // ---------- Setting Security HTTP Headers -----------
app.use(helmet())

    // -------- Middleware for Development logging ----------
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

    // ---------- Middleware for Limiting requests ------------
const limiter = rateLimit({
    max: 5,
    windowMs: 60 * 60 * 1000, // 1hr = (60 * 60 * 1000)ms
    message: 'Too many request from this IP, Please try again in an hour!'
});
app.use('/api', limiter);

    // ------------ Setting Public Directory Path Accessing Static files --------------
app.use(express.static(`${__dirname}/public`));

    // ------------ Custom Test Middleware -----------
app.use((req, res, next) => {
    req.reqestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});

// ========== Middleware Routes  ==============
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
    next(  new AppError(`Can't find ${req.originalUrl} on this server!`, 404) );
});

// ========== Global Error Handling Middleware ==============
app.use(globalErrorHandler);

module.exports = app;