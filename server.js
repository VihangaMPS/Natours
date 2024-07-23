const mongoose = require('mongoose');
const dotenv = require('dotenv'); // use to get environment package

// --------- Handling UnCaughtExceptions/Synchronous ----------
process.on('uncaughtException', err => {
    console.log(' UnCaughtExceptions !!  Shutting down...')
    console.log(err.name, err.message);
    process.exit(1)
});

dotenv.config({path: './config.env'}); // applying custom environment variables to environment package
const app = require('./app');

// ================= DataBase Connection =================
const AtlasDB = process.env.DATABASE_ATLAS.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DBNAME>', process.env.DATABASE_NAME); // Mongo Atlas
const LocalDB = process.env.DATABASE_LOCAL; // Mongo Local
mongoose.connect(LocalDB).then(() => console.log('DB Connection successful!'));

// ====================== SERVER ======================
const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
});

    // --------- Handling UnHandleRejection/Asynchronous ----------
process.on('unhandledRejection', err => {
    console.log('UnHandled Rejection !!  Shutting down...')
    console.log(err.name, err.message);
    server.close(() => process.exit(1)); // 0 - Success & 1 - UnCaught Exceptions
});

// ----------------------------------------------------------------------------------------------

//in Mongo DB, there are two type of Data Modeling
    // 1) EMBEDDED/DENORMALIZED  2)REFERENCED/NORMALIZED

// so we use Embedded, High Read/Low Write data
            // Referenced, Low Read/High Write data

// Postman API ----------------
// https://documenter.getpostman.com/view/30942225/2sA3XTfLdL