const fs = require("fs");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// ==========  Handler Functions Middleware ==============
exports.checkId = (req, res, next, value) => {
    console.log(`Tour id is: ${value}`);
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid id'
        });
    }
    next();
};

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        })
    }
    next();
}

// ==========  Handler Functions  ==============
exports.getAllTours = (req, res) => {
    console.log(req.reqestTime);
    res.status(200)
        .json({
            status: 'success',
            requestedAt: req.reqestTime,
            results: tours.length,
            data: {
                tours: tours
            }
        });
};

exports.getTour = (req, res) => {
    console.log(req.params); // request paramId gives output as a String { id: ? }
    console.log(req.reqestTime); // gives you created date

    const id = req.params.id * 1; // converting paramId(String) to a int
    const tour = tours.find(element => element.id === id);

    res.status(200)
        .json({
            status: 'success',
            data: {
                tour: tour
            }
        });
};

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id: newId}, req.body); // merging two object to create a new object

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    });
};

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here ...>'
        }
    })
};

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    });
};
