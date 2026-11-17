const { db } = require("../database");

exports.getProducts = (req, res) => {

    db.all("SELECT * FROM products", [], (error, products) => {

        if (error) return res.status(500).json({ message: error.message });

        res.json(products);

    });

};

exports.getProductById = (req, res) => {

    db.get(

        "SELECT * FROM products WHERE id = ?",

        [req.params.id],

        (error, product) => {

            if (error) return res.status(500).json({ message: error.message });

            if (!product) return res.status(404).json({ message: "Product not found." });

            res.json(product);

        }

    );

};

exports.createProduct = (req, res) => {

    const { name, category, price, image, description, stock } = req.body;

    if (!name || !category || !Number.isFinite(Number(price)) ||

        Number(price) < 0 || !Number.isInteger(Number(stock)) ||

        Number(stock) < 0) {

        return res.status(400).json({ message: "Invalid product information." });

    }

    db.run(

        `INSERT INTO products

        (name, category, price, image, description, stock)

        VALUES (?, ?, ?, ?, ?, ?)`,

        [name, category, price, image, description, stock],

        function (error) {

            if (error) return res.status(500).json({ message: error.message });

            res.status(201).json({

                message: "Product created successfully.",

                productId: this.lastID

            });

        }

    );

};

exports.updateProduct = (req, res) => {

    const { name, category, price, image, description, stock } = req.body;

    if (!name || !category || !Number.isFinite(Number(price)) ||

        Number(price) < 0 || !Number.isInteger(Number(stock)) ||

        Number(stock) < 0) {

        return res.status(400).json({ message: "Invalid product information." });

    }

    db.run(

        `UPDATE products SET

        name = ?, category = ?, price = ?, image = ?, description = ?, stock = ?

        WHERE id = ?`,

        [name, category, price, image, description, stock, req.params.id],

        function (error) {

            if (error) return res.status(500).json({ message: error.message });

            if (!this.changes) return res.status(404).json({ message: "Product not found." });

            res.json({ message: "Product updated successfully." });

        }

    );

};

exports.deleteProduct = (req, res) => {

    db.run(

        "DELETE FROM products WHERE id = ?",

        [req.params.id],

        function (error) {

            if (error) return res.status(500).json({ message: error.message });

            if (!this.changes) return res.status(404).json({ message: "Product not found." });

            res.json({ message: "Product deleted successfully." });

        }

    );

};