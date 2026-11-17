const { db } = require("../database");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

exports.registerUser = (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {

        return res.status(400).json({

            message: "Provide your name, email and a password of at least 8 characters."

        });

    }

    const normalizedEmail = email.trim().toLowerCase();

    bcrypt.hash(password, 12, (error, hashedPassword) => {

        if (error) return res.status(500).json({ message: "Registration failed." });

        db.run(

            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",

            [name.trim(), normalizedEmail, hashedPassword],

            function (error) {

                if (error) {

                    return res.status(400).json({ message: "Email may already be registered." });

                }

                res.status(201).json({

                    message: "Account created successfully.",

                    userId: this.lastID

                });

            }

        );

    });

};

exports.loginUser = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({ message: "Email and password are required." });

    }

    db.get(

        "SELECT * FROM users WHERE email = ?",

        [email.trim().toLowerCase()],

        (error, user) => {

            if (error) return res.status(500).json({ message: "Login failed." });

            if (!user) {

                return res.status(401).json({ message: "Invalid email or password." });

            }

            bcrypt.compare(password, user.password, (error, valid) => {

                if (error || !valid) {

                    return res.status(401).json({ message: "Invalid email or password." });

                }

                const token = jwt.sign(

                    { id: user.id },

                    process.env.JWT_SECRET,

                    { expiresIn: "1d" }

                );

                res.json({

                    message: "Login successful.",

                    token,

                    user: {

                        id: user.id,

                        name: user.name,

                        email: user.email

                    }

                });

            });

        }

    );

};
exports.getProfile = (req, res) => {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {

        return res.status(401).json({ message: "Authentication required." });

    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        db.get(

            "SELECT id, name, email, created_at FROM users WHERE id = ?",

            [decoded.id],

            (error, user) => {

                if (error) {

                    return res.status(500).json({ message: "Unable to retrieve profile." });

                }

                if (!user) {

                    return res.status(404).json({ message: "User not found." });

                }

                res.json(user);

            }

        );

    } catch (error) {

        res.status(401).json({ message: "Invalid or expired token." });

    }

};