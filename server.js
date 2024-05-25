const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({path: './config.env'});

// ================= DataBase Connection =================
const AtlasDB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DBNAME>', process.env.DATABASE_NAME); // Mongo Atlas
const LocalDB = process.env.DATABASE_LOCAL; // Mongo Local
mongoose.connect(AtlasDB).then(() => console.log('DB Connection successful!'));






const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
});

