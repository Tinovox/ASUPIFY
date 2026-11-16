const express = require("express");

const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware

app.use(cors());

app.use(express.json());

// Database

require("./database");

// Routes

const studentRoutes = require("./routes/students");

app.get("/", (req, res) => {

    res.send("AUSPIFY Student Management API is running.");

});

app.use("/api/students", studentRoutes);

// Start server

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});