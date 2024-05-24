const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const  userRouter = require('./routes/userRoutes');

const app = express(); // Main Router

// ================== Middleware =====================
app.use(express.json()); // Middleware to send the req json body
app.use(morgan('dev')); // Middleware for logging

    // Middleware for Created Date/Time
app.use((req, res, next) => {
    req.reqestTime = new Date().toISOString();
    next();
});


// ========== Middleware Routes  ==============
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ====================== SERVER ======================
module.exports = app;