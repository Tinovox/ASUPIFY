const sqlite3 = require("sqlite3").verbose();

const path = require("path");

const db = new sqlite3.Database(

    path.join(__dirname, "students.db"),

    (error) => {

        if (error) {

            console.error("Database connection failed:", error.message);

        } else {

            console.log("Connected to SQLite database.");

        }

    }

);

db.serialize(() => {

    db.run(`

        CREATE TABLE IF NOT EXISTS students (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            fullName TEXT NOT NULL,

            studentId TEXT NOT NULL UNIQUE,

            email TEXT NOT NULL,

            phone TEXT NOT NULL,

            department TEXT NOT NULL,

            course TEXT NOT NULL,

            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP

        )

    `);

});

module.exports = db;