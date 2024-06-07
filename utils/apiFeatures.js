class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1a) Filtering
        // ---------- Build Query ----------
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(element => delete queryObj[element]);

       // console.log("After deleting fields : ",queryObj);

        // 1b) Advanced Filtering
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(queryString); // ex: {"duration":{"$gte":"5"},"difficulty":"easy","price":{"$lt":"1000"}}
        // console.log(JSON.parse(queryString)); // converting JSON String to a JSON Object

        this.query = this.query.find(JSON.parse(queryString));
        // let query = Tour.find(JSON.parse(queryString)); // find() returns a query object

        return this; // returning a final object
    }

    sortData() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); // setting default sort
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            // console.log(req.query.fields); // String -> ex: name,price,duration
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); // fields that need to be ignored when sending
            // '-?' means -> field need to be ignored | '?' means -> only this field will send other fields get ignored
        }

        return this;
    }

    pagination() {
        const pageNum = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (pageNum - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;