
class TimeLog {
    constructor(employeeName, timeIn, timeOut, breakIn, breakOut) {
        this.employeeName = employeeName;
        this.timeIn = timeIn;
        this.breakIn = breakIn;
        this.breakOut = breakOut;
        this.timeOut = timeOut;
        this.createdAt = new Date();  // Automatically set creation date
    }
}

module.exports = TimeLog;
