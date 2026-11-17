const const API_URL = "https://asupify-ecommerce-api.onrender.com/api";

let products = [];

const getToken = () => localStorage.getItem("token");

const getCart = () =>

    JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(cart) {

    localStorage.setItem("cart", JSON.stringify(cart));

}

function formatPrice(price) {

    return "₦" + Number(price).toLocaleString("en-NG");

}

// LOAD PRODUCTS

async function loadProducts() {

    try {

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) throw new Error("Could not load products.");

        products = await response.json();

        displayProducts("featured-products");

        displayProducts("product-list");

    } catch (error) {

        console.error(error);

    }

}

// DISPLAY PRODUCTS

function displayProducts(containerId, list = products) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = list.map(product => `

        <div class="product-card">

            <img src="${product.image || ""}"

                 alt="${product.name}"

                 onerror="this.style.display='none'">

            <h3>${product.name}</h3>

            <p>${product.description || ""}</p>

            <strong>${formatPrice(product.price)}</strong>

            <p>Stock: ${product.stock}</p>

            <button onclick="addToCart(${product.id})"

                ${product.stock < 1 ? "disabled" : ""}>

                Add to Cart

            </button>

        </div>

    `).join("");

}

// SEARCH AND FILTER

function filterProducts() {

    const search = document.getElementById("searchInput")?.value.toLowerCase() || "";

    const category = document.getElementById("categoryFilter")?.value || "all";

    const filtered = products.filter(product => {

        const matchesSearch = product.name.toLowerCase().includes(search);

        const matchesCategory = category === "all" ||

            product.category.toLowerCase() === category.toLowerCase();

        return matchesSearch && matchesCategory;

    });

    displayProducts("product-list", filtered);

}

// ADD TO CART

function addToCart(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const cart = getCart();

    const existing = cart.find(item => item.id === productId);

    if (existing) {

        if (existing.quantity >= product.stock) {

            return alert("You have reached the available stock.");

        }

        existing.quantity++;

    } else {

        cart.push({ ...product, quantity: 1 });

    }

    saveCart(cart);

    alert("Product added to cart.");

    updateCartCount();

}

// CART COUNT

function updateCartCount() {

    const count = getCart().reduce(

        (total, item) => total + item.quantity, 0

    );

    document.querySelectorAll("#cart-count").forEach(element => {

        element.textContent = count;

    });

}

// DISPLAY CART

function displayCart() {

    const container = document.getElementById("cart-items");

    if (!container) return;

    const cart = getCart();

    if (!cart.length) {

        container.innerHTML = "<p>Your cart is empty.</p>";

        document.getElementById("cart-total").textContent = formatPrice(0);

        return;

    }

    container.innerHTML = cart.map(item => `

        <div class="cart-item">

            <h3>${item.name}</h3>

            <p>${formatPrice(item.price)}</p>

            <p>Quantity: ${item.quantity}</p>

            <button onclick="changeQuantity(${item.id}, -1)">−</button>

            <button onclick="changeQuantity(${item.id}, 1)">+</button>

            <button onclick="removeFromCart(${item.id})">Remove</button>

        </div>

    `).join("");

    const total = cart.reduce(

        (sum, item) => sum + item.price * item.quantity, 0

    );

    document.getElementById("cart-total").textContent = formatPrice(total);

}

// CHANGE QUANTITY

function changeQuantity(id, amount) {

    const cart = getCart();

    const item = cart.find(product => product.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {

        saveCart(cart.filter(product => product.id !== id));

    } else {

        saveCart(cart);

    }

    displayCart();

    updateCartCount();

}

// REMOVE PRODUCT

function removeFromCart(id) {

    saveCart(getCart().filter(item => item.id !== id));

    displayCart();

    updateCartCount();

}

// REGISTER

document.getElementById("registerForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    const name = document.getElementById("name").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {

        return alert("Passwords do not match.");

    }

    try {

        const response = await fetch(`${API_URL}/users/register`, {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ name, email, password })

        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            window.location.href = "login.html";

        }

    } catch (error) {

        alert("Unable to connect to the server.");

    }

});

// LOGIN

document.getElementById("loginForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try {

        const response = await fetch(`${API_URL}/users/login`, {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ email, password })

        });

        const data = await response.json();

        if (!response.ok) {

            return alert(data.message);

        }

        localStorage.setItem("token", data.token);

        alert("Login successful.");

        window.location.href = "index.html";

    } catch (error) {

        alert("Unable to connect to the server.");

    }

});

// CHECKOUT

document.getElementById("checkoutBtn")?.addEventListener("click", async () => {

    if (!getToken()) {

        alert("Please log in before checking out.");

        window.location.href = "login.html";

        return;

    }

    const cart = getCart();

    if (!cart.length) return alert("Your cart is empty.");

    try {

        const response = await fetch(`${API_URL}/orders`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${getToken()}`

            },

            body: JSON.stringify({

                items: cart.map(item => ({

                    productId: item.id,

                    quantity: item.quantity

                }))

            })

        });

        const data = await response.json();

        if (!response.ok) return alert(data.message);

        saveCart([]);

        alert("Order placed successfully. Order ID: " + data.orderId);

        window.location.href = "orders.html";

    } catch (error) {

        alert("Unable to place your order.");

    }

});

// DISPLAY ORDERS

async function loadOrders() {

    const container = document.getElementById("orders-list");

    if (!container) return;

    if (!getToken()) {

        container.innerHTML = "<p>Please log in to view your orders.</p>";

        return;

    }

    try {

        const response = await fetch(`${API_URL}/orders`, {

            headers: {

                "Authorization": `Bearer ${getToken()}`

            }

        });

        const orders = await response.json();

        if (!response.ok) throw new Error(orders.message);

        if (!orders.length) {

            container.innerHTML = "<p>You have no orders yet.</p>";

            return;

        }

        container.innerHTML = orders.map(order => `

            <div class="order-card">

                <h3>Order #${order.id}</h3>

                <p>Total: ${formatPrice(order.total)}</p>

                <p>Status: ${order.status}</p>

                <p>Date: ${order.created_at}</p>

            </div>

        `).join("");

    } catch (error) {

        container.innerHTML = "<p>Unable to load orders.</p>";

    }

}

// INITIALIZE PAGE

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

    displayCart();

    updateCartCount();

    loadOrders();

    document.getElementById("searchInput")

        ?.addEventListener("input", filterProducts);

    document.getElementById("categoryFilter")

        ?.addEventListener("change", filterProducts);

});