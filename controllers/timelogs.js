const TimeLog = require('../models/Timelogs');
const mysql = require('mysql2/promise');

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
        const timeLog = new TimeLog(req.user.id);
        const [result] = await pool.query('INSERT INTO time_logs (employee_id, time_in, created_at) VALUES (?, NOW(), ?)', [timeLog.employeeId, timeLog.createdAt]);
        timeLog.timeIn = new Date(); // Update timeIn with current time
        res.status(201).json({ message: 'Clocked in successfully', timeLogId: result.insertId });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Clock out method
module.exports.clockOut = async (req, res, next) => {
    try {
        const timeLog = new TimeLog(req.user.id);
        const [result] = await pool.query('UPDATE time_logs SET time_out = NOW() WHERE employee_id = ? AND time_out IS NULL', [timeLog.employeeId]);
        timeLog.timeOut = new Date(); // Update timeOut with current time
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No active time log found' });
        res.status(200).json({ message: 'Clocked out successfully' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Start break method
module.exports.startBreak = async (req, res, next) => {
    try {
        const timeLog = new TimeLog(req.user.id);
        const [result] = await pool.query('UPDATE time_logs SET break_in = NOW() WHERE employee_id = ? AND break_out IS NULL AND time_out IS NULL', [timeLog.employeeId]);
        timeLog.breakIn = new Date(); // Update breakIn with current time
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No active time log found to start break' });
        res.status(200).json({ message: 'Break started successfully' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// End break method
module.exports.endBreak = async (req, res, next) => {
    try {
        const timeLog = new TimeLog(req.user.id);
        const [result] = await pool.query('UPDATE time_logs SET break_out = NOW() WHERE employee_id = ? AND break_out IS NULL AND time_out IS NULL', [timeLog.employeeId]);
        timeLog.breakOut = new Date(); // Update breakOut with current time
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No active break found' });
        res.status(200).json({ message: 'Break ended successfully' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
