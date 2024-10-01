// Import Statements
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const employeeRoutes = require('./routes/employee');
const timelogRoutes = require('./routes/timelogs');
const { errorHandler } = require('./auth');

// Initialize Express App
const app = express();

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Allow all origins
app.use(cors());

// Database Connection (MySQL)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database.');
    }
});

// Route Handling
app.use('/employees', employeeRoutes);
app.use('/timelogs', timelogRoutes);

// Error Handling Middleware - Must be defined after route handling
app.use(errorHandler);

// Server Initialization
if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`API is now online on port ${process.env.PORT || 3000}`);
    });
}

// Module Exports
module.exports = { app, db };
