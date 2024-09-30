
class TimeLog {
    constructor(employeeId, timeIn, timeOut, breakIn, breakOut) {
        this.employeeId = employeeId;
        this.timeIn = timeIn;
        this.breakIn = breakIn;
        this.breakOut = breakOut;
        this.timeOut = timeOut;
        this.createdAt = new Date();  // Automatically set creation date
    }
}

module.exports = TimeLog;
