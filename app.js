const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const  userRouter = require('./routes/userRoutes');

const app = express(); // Main Router

// ================== Middleware =====================
    // ----------- Middleware to send the req json body when we create(POST) -----------
app.use(express.json());

    // -------- Middleware for logging ----------
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
    // ------------ Setting Public Directory Path Accessing Static files --------------
app.use(express.static(`${__dirname}/public`));

    // ------------ Custom Middleware -----------
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