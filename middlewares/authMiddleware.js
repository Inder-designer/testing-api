// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const ErrorHandler = require('../utils/errorhandler');

exports.isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies; // or you could fetch from headers (e.g., req.header('Authorization'))

    console.log(token);

    if (!token) {
        return next(new ErrorHandler('Please log in to access this resource', 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid Token', 401));
    }
};
