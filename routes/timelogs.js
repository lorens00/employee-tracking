const express = require('express');
const timelogController = require('../controllers/timelogs'); 
const { verify } = require('../auth');
const router = express.Router(); 

// Route to clock in
router.post('/clock-in', verify, timelogController.clockIn);

// Route to clock out
router.post('/clock-out', verify, timelogController.clockOut); 

// Route to start a break
router.post('/breakIn', verify, timelogController.startBreak); 

// Route to end a break
router.post('/breakOut', verify, timelogController.endBreak); 

module.exports = router; 
