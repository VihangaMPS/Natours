const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel')

dotenv.config({path: './config.env'});

// ================= DataBase Connection =================
const AtlasDB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DBNAME>', process.env.DATABASE_NAME); // Mongo Atlas
const LocalDB = process.env.DATABASE_LOCAL; // Mongo Local
mongoose.connect(AtlasDB).then(() => console.log('DB Connection successful!'));


// Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import Data Into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data Successfully loaded!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

// Delete Current All Data in DB
const deleteAllData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data Successfully deleted!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

// console.log(process.argv);
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteAllData();
}
