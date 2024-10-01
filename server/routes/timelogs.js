const express = require('express');
const timelogController = require('../controllers/timelogs'); 
const { verify, verifyAdmin } = require('../auth');
const router = express.Router(); 

// Route to clock in
router.post('/clock-in', verify, timelogController.clockIn);

// Route to clock out
router.post('/clock-out', verify, timelogController.clockOut); 

// Route to start a break
router.post('/breakIn', verify, timelogController.startBreak); 

// Route to end a break
router.post('/breakOut', verify, timelogController.endBreak); 

// Route to get all time logs
router.get('/', verify, verifyAdmin, timelogController.getAllTimeLogs); // New route added

module.exports = router; 
