const jwt = require("jsonwebtoken");
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

// Function to create access token
module.exports.createAccessToken = (employee) => {
    const data = {
        id: employee.id,
        email: employee.email,
        isAdmin: employee.isAdmin || false,  // Assuming isAdmin might be part of employee data
    };

    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Token verification middleware
module.exports.verify = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send({ auth: "Failed. No Token" });
    } else {
        const actualToken = token.slice(7, token.length); // Removing 'Bearer ' prefix
        jwt.verify(actualToken, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(401).send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                req.user = decodedToken; // Store the decoded token in request
                next();
            }
        });
    }
};

// Middleware to verify if the user is an admin
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin === true) {
        next(); // Proceed to next middleware/controller
    } else {
        return res.status(403).json({
            auth: "Failed",
            message: "Action Forbidden: Admin access required"
        });
    }
};


// Error handler middleware
module.exports.errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
};

// Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

        console.log('Token received:', token);

        if (!token) return res.status(401).json({ error: 'No token provided' });

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                console.log('Token verification failed:', err);
                return res.status(401).json({ error: 'Unauthorized' });
            }
            req.userId = decoded.id;
            next();
        });
    };

// Middleware to verify if the user is a regular user (not an admin)
module.exports.verifyUser = (req, res, next) => {
    if (req.user && !req.user.isAdmin) {
        next(); // Proceed to next middleware/controller
    } else {
        return res.status(403).send({
            auth: "Failed",
            message: "Access denied: You do not have the required permissions to perform this action"
        });
    }
};
