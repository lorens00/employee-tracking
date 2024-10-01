const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const { verify, verifyAdmin, isLoggedIn } = require("../auth");

// Route for employee registration
router.post('/register', employeeController.registerEmployee);

// Route for employee login
router.post('/login', employeeController.loginEmployee);

// Protected route to get employee details by ID
router.get('/:employeeId', isLoggedIn, employeeController.getEmployeeDetails);

// Route to get all employee details (Protected route)
router.get('/', verify, verifyAdmin, employeeController.getAllEmployeeDetails); 

// Update user as admin
router.patch('/:employeeId/set-as-admin', verify, employeeController.updateUserAsAdmin);

// Protected route for admin actions
router.delete('/:employeeId', verify, verifyAdmin, employeeController.deleteEmployee);

module.exports = router;
