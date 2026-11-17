const sqlite3 = require(“sqlite3”).verbose();
const path = require(“path”);

const dbPath = path.join(__dirname, “asupify.db”);

const db = new sqlite3.Database(dbPath);

function initializeDatabase() {

return new Promise((resolve, reject) => {
    db.serialize(() => {
        db.run("PRAGMA foreign_keys = ON");
        // PRODUCTS TABLE
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                image TEXT,
                description TEXT,
                stock INTEGER DEFAULT 0
            )
        `);
        // USERS TABLE
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // ORDERS TABLE
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total REAL NOT NULL,
                status TEXT DEFAULT 'Pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        // ORDER ITEMS TABLE
        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log("ASUPIFY database initialized successfully.");
                resolve();
            }
        });
    });
});

}

module.exports = {
db,
initializeDatabase
};