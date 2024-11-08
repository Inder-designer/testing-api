const ErrorHandler = require('../utils/errorhandler');

module.exports = (err, req, res, next) => {
    // Set default status code and message if not provided
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Handle CastError (Invalid MongoDB ID)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle duplicate key errors (Mongoose)
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    // Handle JWT errors (Invalid token)
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid JSON Web Token. Please authenticate.';
        err = new ErrorHandler(message, 401);
    }

    // Handle expired JWT errors
    if (err.name === 'TokenExpiredError') {
        const message = 'JSON Web Token has expired. Please authenticate again.';
        err = new ErrorHandler(message, 401);
    }

    // Send response
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
