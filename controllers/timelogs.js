const TimeLog = require('../models/Timelogs');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const secretKey = process.env.JWT_SECRET;

// Clock in method
module.exports.clockIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Get the token
        const decoded = jwt.verify(token, secretKey); // Verify and decode the token

        const employeeId = decoded.id; // Get the employee ID from the token

        // Query to get the employee's name based on their ID
        const [employeeRows] = await pool.query('SELECT employee_name FROM employees WHERE employee_id = ?', [employeeId]);

        if (employeeRows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employeeName = employeeRows[0].employee_name;

        // Create a new time log
        const timeLog = new TimeLog(employeeName);
        const [result] = await pool.query(
            'INSERT INTO time_logs (employee_name, time_in, created_at) VALUES (?, NOW(), NOW())', 
            [timeLog.employeeName]
        );

        timeLog.timeIn = new Date(); // Update timeIn with current time
        res.status(201).json({ message: 'Clocked in successfully', timeLogId: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        next(error);
    }
};

// Clock out method
module.exports.clockOut = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Get the token
        const decoded = jwt.verify(token, secretKey); // Verify and decode the token

        const employeeId = decoded.id; // Get the employee ID from the token

        // Query to get the employee's name based on their ID
        const [employeeRows] = await pool.query('SELECT employee_name FROM employees WHERE employee_id = ?', [employeeId]);

        if (employeeRows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employeeName = employeeRows[0].employee_name;

        // Update the most recent active time log for the employee based on the employee name
        const [result] = await pool.query(
            `UPDATE time_logs 
             SET time_out = NOW() 
             WHERE log_id = (
                SELECT log_id FROM (
                    SELECT log_id 
                    FROM time_logs 
                    WHERE employee_name = ? AND time_out IS NULL 
                    ORDER BY time_in DESC 
                    LIMIT 1
                ) AS latest_time_log
             )`, 
            [employeeName]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'No active time log found' });
        res.status(200).json({ message: 'Clocked out successfully' });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        next(error);
    }
};


// Start break method
module.exports.startBreak = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Get the token
        const decoded = jwt.verify(token, secretKey); // Verify and decode the token

        const employeeId = decoded.id; // Get the employee ID from the token

        // Query to get the employee's name based on their ID
        const [employeeRows] = await pool.query('SELECT employee_name FROM employees WHERE employee_id = ?', [employeeId]);

        if (employeeRows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employeeName = employeeRows[0].employee_name;

        // Update break_in time
        const [result] = await pool.query(
            'UPDATE time_logs SET break_in = NOW() WHERE employee_name = ? AND break_out IS NULL AND time_out IS NULL', 
            [employeeName]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'No active time log found to start break' });
        res.status(200).json({ message: 'Break started successfully' });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        next(error);
    }
};

// End break method
module.exports.endBreak = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Get the token
        const decoded = jwt.verify(token, secretKey); // Verify and decode the token

        const employeeId = decoded.id; // Get the employee ID from the token

        // Query to get the employee's name based on their ID
        const [employeeRows] = await pool.query('SELECT employee_name FROM employees WHERE employee_id = ?', [employeeId]);

        if (employeeRows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employeeName = employeeRows[0].employee_name;

        // Query to find the latest break_in log
        const [breakLogRows] = await pool.query(
            'SELECT log_id FROM time_logs WHERE employee_name = ? AND break_out IS NULL AND break_in IS NOT NULL AND time_out IS NULL ORDER BY break_in DESC LIMIT 1',
            [employeeName]
        );

        if (breakLogRows.length === 0) {
            return res.status(404).json({ error: 'No active break found' });
        }

        const logId = breakLogRows[0].log_id; // Get the log ID of the most recent break_in

        // Update the break_out time for the specific log_id
        const [result] = await pool.query(
            'UPDATE time_logs SET break_out = NOW() WHERE log_id = ?',
            [logId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to update break out time' });
        }

        res.status(200).json({ message: 'Break ended successfully' });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        next(error);
    }
};

module.exports.getAllTimeLogs = async (req, res, next) => {
    try {
        // Query to fetch all time logs
        const [rows] = await pool.query('SELECT * FROM time_logs ORDER BY created_at DESC'); // Adjust the ORDER BY as necessary

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No time logs found' });
        }

        res.status(200).json(rows); 
    } catch (error) {
        console.error(error);
        next(error); 
    }
};









