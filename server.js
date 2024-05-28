const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');

// ================= DataBase Connection =================
const AtlasDB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DBNAME>', process.env.DATABASE_NAME); // Mongo Atlas
const LocalDB = process.env.DATABASE_LOCAL; // Mongo Local
mongoose.connect(AtlasDB).then(() => console.log('DB Connection successful!'));


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
});

