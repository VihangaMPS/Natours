const express = require('express');
const fs = require("fs");
const morgan = require('morgan');

const app = express();

// ============= Middleware ==============
app.use(express.json()); // Middleware to send the req json body
app.use(morgan('dev')); // Middleware for logging

app.use((req, res, next) => {
    console.log('Hello form the middleware');
    next();
});

app.use((req, res, next) => {
    req.reqestTime = new Date().toISOString();
    next();
});


const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// ========== Routes Handlers ==============
const getAllTours = (req, res) => {
    console.log(req.reqestTime)
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

const getTour = (req, res) => {
    // console.log(req.params); // request paramId gives output as a String
    const id = req.params.id * 1; // converting paramId(String) to a int
    const tour = tours.find(element => element.id === id);

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid id'
        })
    }

    res.status(200)
        .json({
            status: 'success',
            data: {
                tour: tour
            }
        });
};

const createTour = (req, res) => {
    const newId = tours[tours.length -1].id + 1;
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

const updateTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid id'
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here ...>'
        }
    })
};

const deleteTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid id'
        });
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
};
//  -----------------------------------------
const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};
const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};
const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};
const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};
const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

// ========== Routes  ==============
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser)

// ====================== SERVER ======================
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})