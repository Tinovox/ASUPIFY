const { db } = require("../database");

const jwt = require("jsonwebtoken");

function authenticate(req, res) {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {

        res.status(401).json({ message: "Authentication required." });

        return null;

    }

    try {

        return jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {

        res.status(401).json({ message: "Invalid or expired token." });

        return null;

    }

}

exports.createOrder = (req, res) => {

    const user = authenticate(req, res);

    if (!user) return;

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {

        return res.status(400).json({ message: "Your cart is empty." });

    }

    if (items.some(item =>

        !Number.isInteger(Number(item.productId)) ||

        !Number.isInteger(Number(item.quantity)) ||

        Number(item.quantity) < 1

    )) {

        return res.status(400).json({ message: "Invalid order items." });

    }

    db.serialize(() => {

        db.run("BEGIN TRANSACTION");

        let total = 0;

        const orderItems = [];

        let index = 0;

        function processNext() {

            if (index >= items.length) {

                db.run(

                    "INSERT INTO orders (user_id, total) VALUES (?, ?)",

                    [user.id, total],

                    function (error) {

                        if (error) return rollback(error);

                        const orderId = this.lastID;

                        let saved = 0;

                        function saveNext() {

                            if (saved >= orderItems.length) {

                                return db.run("COMMIT", error => {

                                    if (error) return rollback(error);

                                    res.status(201).json({

                                        message: "Order placed successfully.",

                                        orderId,

                                        total

                                    });

                                });

                            }

                            const item = orderItems[saved];

                            db.run(

                                `INSERT INTO order_items

                                (order_id, product_id, quantity, price)

                                VALUES (?, ?, ?, ?)`,

                                [orderId, item.id, item.quantity, item.price],

                                error => {

                                    if (error) return rollback(error);

                                    db.run(

                                        "UPDATE products SET stock = stock - ? WHERE id = ?",

                                        [item.quantity, item.id],

                                        error => {

                                            if (error) return rollback(error);

                                            saved++;

                                            saveNext();

                                        }

                                    );

                                }

                            );

                        }

                        saveNext();

                    }

                );

                return;

            }

            const item = items[index];

            db.get(

                "SELECT id, price, stock FROM products WHERE id = ?",

                [item.productId],

                (error, product) => {

                    if (error) return rollback(error);

                    if (!product) {

                        return rollback(new Error("A product was not found."));

                    }

                    if (product.stock < item.quantity) {

                        return rollback(new Error("Insufficient product stock."));

                    }

                    total += product.price * item.quantity;

                    orderItems.push({

                        id: product.id,

                        price: product.price,

                        quantity: item.quantity

                    });

                    index++;

                    processNext();

                }

            );

        }

        function rollback(error) {

            db.run("ROLLBACK", () => {

                res.status(400).json({

                    message: error.message || "Unable to place order."

                });

            });

        }

        processNext();

    });

};

exports.getOrders = (req, res) => {

    const user = authenticate(req, res);

    if (!user) return;

    db.all(

        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",

        [user.id],

        (error, orders) => {

            if (error) {

                return res.status(500).json({ message: "Unable to retrieve orders." });

            }

            res.json(orders);

        }

    );

};

exports.getOrderById = (req, res) => {

    const user = authenticate(req, res);

    if (!user) return;

    db.get(

        "SELECT * FROM orders WHERE id = ? AND user_id = ?",

        [req.params.id, user.id],

        (error, order) => {

            if (error) {

                return res.status(500).json({ message: "Unable to retrieve order." });

            }

            if (!order) {

                return res.status(404).json({ message: "Order not found." });

            }

            db.all(

                `SELECT order_items.*, products.name

                 FROM order_items

                 JOIN products ON order_items.product_id = products.id

                 WHERE order_items.order_id = ?`,

                [order.id],

                (error, items) => {

                    if (error) {

                        return res.status(500).json({ message: "Unable to retrieve order items." });

                    }

                    res.json({ ...order, items });

                }

            );

        }

    );

};