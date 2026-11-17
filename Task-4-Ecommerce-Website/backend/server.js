// ASUPIFY E-COMMERCE BACKEND

require("dotenv").config();

const express = require("express");

const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware

app.use(cors());

app.use(express.json());

// Database connection

const db = require("./database");

// API Routes

const productRoutes = require("./routes/products");

const userRoutes = require("./routes/users");

const orderRoutes = require("./routes/orders");

// Register routes

app.use("/api/products", productRoutes);

app.use("/api/users", userRoutes);

app.use("/api/orders", orderRoutes);

// Homepage route

app.get("/", (req, res) => {

    res.json({

        message: "Welcome to ASUPIFY E-commerce API",

        status: "Server is running"

    });

});

// Test route

app.get("/api/health", (req, res) => {

    res.json({

        success: true,

        message: "ASUPIFY API is working"

    });

});

// Start server after database initialization

db.initializeDatabase()

    .then(() => {

        app.listen(PORT, () => {

            console.log(

                `ASUPIFY server running on port ${PORT}`

            );

        });

    })

    .catch(error => {

        console.error("Database initialization failed:", error);

        process.exit(1);

    });