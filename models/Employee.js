const db = require('../index').db;  // Import the database connection

class Employee {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();  // Automatically set creation date
    }

    // You can add static methods here in the future if needed
}

module.exports = Employee;
