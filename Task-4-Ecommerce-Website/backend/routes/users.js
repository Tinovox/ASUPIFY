const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { db } = require("../database");

// USER REGISTRATION

router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({

                message: "All fields are required"

            });

        }

        if (password.length < 8) {

            return res.status(400).json({

                message: "Password must contain at least 8 characters"

            });

        }

        const normalizedEmail = email.trim().toLowerCase();

        const hashedPassword = await bcrypt.hash(password, 12);

        db.run(

            `INSERT INTO users (name, email, password)

             VALUES (?, ?, ?)`,

            [name.trim(), normalizedEmail, hashedPassword],

            function(err) {

                if (err) {

                    if (err.message.includes("UNIQUE")) {

                        return res.status(409).json({

                            message: "Email already registered"

                        });

                    }

                    return res.status(500).json({

                        message: "Registration failed"

                    });

                }

                res.status(201).json({

                    message: "Account created successfully",

                    userId: this.lastID

                });

            }

        );

    } catch (error) {

        res.status(500).json({

            message: "Server error"

        });

    }

});

// USER LOGIN

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({

            message: "Email and password are required"

        });

    }

    db.get(

        "SELECT * FROM users WHERE email = ?",

        [email.trim().toLowerCase()],

        async (err, user) => {

            if (err) {

                return res.status(500).json({

                    message: "Server error"

                });

            }

            if (!user) {

                return res.status(401).json({

                    message: "Invalid email or password"

                });

            }

            const validPassword = await bcrypt.compare(

                password,

                user.password

            );

            if (!validPassword) {

                return res.status(401).json({

                    message: "Invalid email or password"

                });

            }

            const token = jwt.sign(

                { id: user.id },

                process.env.JWT_SECRET,

                { expiresIn: "1d" }

            );

            res.json({

                message: "Login successful",

                token,

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email

                }

            });

        }

    );

});

// GET USER PROFILE

router.get("/profile", (req, res) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({

            message: "Authentication required"

        });

    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        db.get(

            "SELECT id, name, email FROM users WHERE id = ?",

            [decoded.id],

            (err, user) => {

                if (err) {

                    return res.status(500).json({

                        message: "Server error"

                    });

                }

                if (!user) {

                    return res.status(404).json({

                        message: "User not found"

                    });

                }

                res.json(user);

            }

        );

    } catch (error) {

        res.status(401).json({

            message: "Invalid or expired token"

        });

    }

});

module.exports = router;