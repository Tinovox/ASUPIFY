const express = require(“express”);
const router = express.Router();

const { db } = require(”../database”);

// GET ALL PRODUCTS
router.get(”/”, (req, res) => {

db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
        return res.status(500).json({
            error: err.message
        });
    }
    res.json(rows);
});

});

// GET SINGLE PRODUCT
router.get(”/:id”, (req, res) => {

db.get(
    "SELECT * FROM products WHERE id = ?",
    [req.params.id],
    (err, row) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (!row) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.json(row);
    }
);

});

// ADD PRODUCT
router.post(”/”, (req, res) => {

const {
    name,
    category,
    price,
    image,
    description,
    stock
} = req.body;
if (
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
) {
    return res.status(400).json({
        message: "Valid product details are required"
    });
}
db.run(
    `INSERT INTO products
    (name, category, price, image, description, stock)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, price, image || "", description || "", stock],
    function(err) {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        res.status(201).json({
            message: "Product added successfully",
            productId: this.lastID
        });
    }
);

});

// UPDATE PRODUCT
router.put(”/:id”, (req, res) => {

const {
    name,
    category,
    price,
    image,
    description,
    stock
} = req.body;
if (
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
) {
    return res.status(400).json({
        message: "Valid product details are required"
    });
}
db.run(
    `UPDATE products SET
    name = ?,
    category = ?,
    price = ?,
    image = ?,
    description = ?,
    stock = ?
    WHERE id = ?`,
    [name, category, price, image || "", description || "", stock, req.params.id],
    function(err) {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.json({
            message: "Product updated successfully"
        });
    }
);

});

// DELETE PRODUCT
router.delete(”/:id”, (req, res) => {

db.run(
    "DELETE FROM products WHERE id = ?",
    [req.params.id],
    function(err) {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    }
);

});

module.exports = router;