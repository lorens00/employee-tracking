require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../auth'); 
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const secretKey = process.env.JWT_SECRET;

module.exports.registerEmployee = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO employees (employee_name, email, password, createdAt) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, new Date()]);
        res.status(201).json({ message: 'Employee registered successfully', employeeId: result.insertId });
    } catch (error) {
        console.error(error); // Log error for debugging
        next(error); // Pass error to the error handler
    }
};

module.exports.loginEmployee = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);
        const employee = rows[0];
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' });

        // Convert isAdmin to boolean
        const isAdmin = employee.isAdmin === 1; // This ensures it's a boolean

        const token = jwt.sign(
            { id: employee.employee_id, isAdmin }, // Pass the boolean isAdmin
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error); // Log error for debugging
        next(error); // Pass error to the error handler
    }
};

module.exports.getEmployeeDetails = async (req, res, next) => {
    console.log('Fetching details for employee ID:', req.params.employeeId);
    try {
        const [rows] = await pool.query('SELECT * FROM employees WHERE employee_id = ?', [req.params.employeeId]);
        const employee = rows[0];
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee details:', error);
        next(error);
    }
};

// Get all employee details
module.exports.getAllEmployeeDetails = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

module.exports.updateUserAsAdmin = async (req, res, next) => {
    try {
        const [result] = await pool.query('UPDATE employees SET isAdmin = ? WHERE employee_id = ?', [true, req.params.employeeId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });
        res.status(200).json({ message: 'Employee updated to admin successfully' });
    } catch (error) {
        console.error(error); // Log error for debugging
        next(error); // Pass error to the error handler
    }
};

module.exports.deleteEmployee = async (req, res, next) => {
    try {
        // Log the employeeId to verify it's correct
        console.log('Employee ID:', req.params.employeeId);

        const [result] = await pool.query('DELETE FROM employees WHERE employee_id = ?', [req.params.employeeId]);
        
        // If no rows were affected, return 404
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Successful deletion
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error); // Log error for debugging
        next(error); // Pass error to the error handler
    }
};

