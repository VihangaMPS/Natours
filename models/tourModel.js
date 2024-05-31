const mongoose = require('mongoose');

// ================ Building the Schema Structure ================
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Tour must have a name'],
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A Tour mush have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A Tour must have a duration']
    },
    difficulty: {
        type: String,
        required: [true, 'A Tour mush have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A Tour must have a price']
    },
    priceDiscount: {
        type: Number
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A Tour must have a price']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A Tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // hide from the output
    },
    startDates: [Date],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true}
});

tourSchema.virtual('durationWeeks').get( function () {
    return this.duration / 7; // calculating days for a week
});

// ================ Converting the Schema Structure to Table ================
const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;