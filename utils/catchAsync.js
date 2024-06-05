module.exports = passedFn => {
    return (req, res, next) => {
        passedFn(req, res, next).catch(error => next(error));
    }
}