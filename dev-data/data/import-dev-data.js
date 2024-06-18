const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({path: './config.env'});

// ================= DataBase Connection =================
const AtlasDB = process.env.DATABASE_ATLAS.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DBNAME>', process.env.DATABASE_NAME); // Mongo Atlas
const LocalDB = process.env.DATABASE_LOCAL; // Mongo Local
mongoose.connect(LocalDB).then(() => console.log('DB Connection successful!'));


// Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import Data Into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
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
        await User.deleteMany();
        await Review.deleteMany();
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
