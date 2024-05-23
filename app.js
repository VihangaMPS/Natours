const express = require('express');
const fs = require("fs");

const app = express();
app.use(express.json()); // Middleware

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200)
        .json({
            status: 'success',
            data: {
                tours: tours
            }
        });
});

app.post('/api/v1/tours', (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})