const express = require("express");

const router = express.Router();

const db = require("../database");

// GET: View all students

router.get("/", (req, res) => {

    db.all(

        "SELECT * FROM students ORDER BY id DESC",

        [],

        (error, rows) => {

            if (error) {

                return res.status(500).json({ error: error.message });

            }

            res.json(rows);

        }

    );

});

// GET: View one student

router.get("/:id", (req, res) => {

    db.get(

        "SELECT * FROM students WHERE id = ?",

        [req.params.id],

        (error, row) => {

            if (error) {

                return res.status(500).json({ error: error.message });

            }

            if (!row) {

                return res.status(404).json({

                    message: "Student not found."

                });

            }

            res.json(row);

        }

    );

});

// POST: Add a student

router.post("/", (req, res) => {

    const {

        fullName,

        studentId,

        email,

        phone,

        department,

        course

    } = req.body;

    if (![fullName, studentId, email, phone, department, course]

        .every(value => typeof value === "string" && value.trim())) {

        return res.status(400).json({

            message: "All student fields are required."

        });

    }

    const sql = `

        INSERT INTO students

        (fullName, studentId, email, phone, department, course)

        VALUES (?, ?, ?, ?, ?, ?)

    `;

    db.run(

        sql,

        [

            fullName.trim(),

            studentId.trim(),

            email.trim(),

            phone.trim(),

            department.trim(),

            course.trim()

        ],

        function (error) {

            if (error) {

                if (error.message.includes("UNIQUE")) {

                    return res.status(409).json({

                        message: "Student ID already exists."

                    });

                }

                return res.status(500).json({

                    error: error.message

                });

            }

            res.status(201).json({

                message: "Student added successfully.",

                id: this.lastID

            });

        }

    );

});

// PUT: Update student records

router.put("/:id", (req, res) => {

    const {

        fullName,

        studentId,

        email,

        phone,

        department,

        course

    } = req.body;

    if (![fullName, studentId, email, phone, department, course]

        .every(value => typeof value === "string" && value.trim())) {

        return res.status(400).json({

            message: "All student fields are required."

        });

    }

    const sql = `

        UPDATE students

        SET fullName = ?, studentId = ?, email = ?,

            phone = ?, department = ?, course = ?

        WHERE id = ?

    `;

    db.run(

        sql,

        [

            fullName.trim(),

            studentId.trim(),

            email.trim(),

            phone.trim(),

            department.trim(),

            course.trim(),

            req.params.id

        ],

        function (error) {

            if (error) {

                if (error.message.includes("UNIQUE")) {

                    return res.status(409).json({

                        message: "Student ID already exists."

                    });

                }

                return res.status(500).json({

                    error: error.message

                });

            }

            if (this.changes === 0) {

                return res.status(404).json({

                    message: "Student not found."

                });

            }

            res.json({

                message: "Student updated successfully."

            });

        }

    );

});

// DELETE: Remove student

router.delete("/:id", (req, res) => {

    db.run(

        "DELETE FROM students WHERE id = ?",

        [req.params.id],

        function (error) {

            if (error) {

                return res.status(500).json({

                    error: error.message

                });

            }

            if (this.changes === 0) {

                return res.status(404).json({

                    message: "Student not found."

                });

            }

            res.json({

                message: "Student deleted successfully."

            });

        }

    );

});

module.exports = router;