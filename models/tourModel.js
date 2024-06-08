const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// ================ Building the Schema Structure ================
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A Tour name must have <=40 characters'],
        minLength: [10, 'A Tour name must have >=10 characters']
    },
    slug: String,
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
        required: [true, 'A Tour mush have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficulty'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
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
        type: Number,
        validate: {
            validator: function (value) {
                return value < this.price; // this keyword only support for creating a document
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A Tour must have a Summary']
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
    secretTour: {
        type: Boolean,
        default: false
    }
}, { // applying options to tell schema to add virtual data to the document
    toJSON: { virtuals: true },
    toObject: { virtuals: true}
});

tourSchema.virtual('durationWeeks').get( function () {
    return this.duration / 7; // calculating days for a week
});

// -------------- Document Middleware: Runs before only .save() and .create() --------------
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true});
    // in Schema { slug: String } -> adding a new field ex: slug: this.name

    next();
});
/*tourSchema.pre('save', function (next) {
    console.log('Will save documents...');
    next();
});
tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
});*/

// -------------- Query Middleware --------------
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    // in Schema,
    // secretTour: {
    //         type: Boolean,
    //         default: false
    //     }
    // if we add a "{secretTour: true}" as a new private secret tour,
    // Database will store that data but when we request a getAllTours we receive only secretTour hidden documents.
    //                  reason by default secretTour set to false.

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start}ms`)
    // console.log(docs); // documents that matched the query
    next();
});

// -------------- Aggregation Middleware --------------
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift( { $match: { secretTour: { $ne: true } }});
    console.log(this.pipeline());
    next();
});



// ================ Converting the Schema Structure to Table ================
const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;