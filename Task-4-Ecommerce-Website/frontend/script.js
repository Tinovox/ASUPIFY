// ======================================
// ASUPIFY E-COMMERCE WEBSITE
// MAIN JAVASCRIPT
// ======================================

// PRODUCT DATABASE (Temporary frontend data)

const products = [
{
id: 1,
name: “Wireless Headphones”,
category: “electronics”,
price: 25000,
image: “https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500”
},
{
id: 2,
name: “Smart Watch”,
category: “electronics”,
price: 35000,
image: “https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500”
},
{
id: 3,
name: “Running Sneakers”,
category: “fashion”,
price: 28000,
image: “https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500”
},
{
id: 4,
name: “Travel Backpack”,
category: “accessories”,
price: 18000,
image: “https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500”
},
{
id: 5,
name: “Men’s Wristwatch”,
category: “accessories”,
price: 22000,
image: “https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500”
},
{
id: 6,
name: “Camera”,
category: “electronics”,
price: 85000,
image: “https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500”
}
];

// ======================================
// LOCAL STORAGE
// ======================================

let cart = JSON.parse(localStorage.getItem(“asupifyCart”)) || [];

let orders = JSON.parse(localStorage.getItem(“asupifyOrders”)) || [];

function saveCart() {
localStorage.setItem(“asupifyCart”, JSON.stringify(cart));
}

function saveOrders() {
localStorage.setItem(“asupifyOrders”, JSON.stringify(orders));
}

// ======================================
// DISPLAY PRODUCTS
// ======================================

function displayProducts(containerId, productList) {

const container = document.getElementById(containerId);
if (!container) return;
container.innerHTML = "";
productList.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    const name = document.createElement("h3");
    name.textContent = product.name;
    const price = document.createElement("p");
    price.textContent = "₦" + product.price.toLocaleString("en-NG");
    const button = document.createElement("button");
    button.textContent = "Add to Cart";
    button.addEventListener("click", () => {
        addToCart(product.id);
    });
    card.append(image, name, price, button);
    container.appendChild(card);
});

}

// ======================================
// FEATURED PRODUCTS
// ======================================

displayProducts(“featured-products”, products.slice(0, 4));

// ======================================
// PRODUCT SEARCH AND FILTER
// ======================================

function filterProducts() {

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
if (!searchInput || !categoryFilter) return;
const search = searchInput.value.toLowerCase();
const category = categoryFilter.value;
const filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search);
    const matchesCategory =
        category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
});
displayProducts("product-list", filtered);

}

const searchInput = document.getElementById(“searchInput”);

const categoryFilter = document.getElementById(“categoryFilter”);

if (searchInput) {
searchInput.addEventListener(“input”, filterProducts);
}

if (categoryFilter) {
categoryFilter.addEventListener(“change”, filterProducts);
}

filterProducts();

// ======================================
// ADD PRODUCTS TO CART
// ======================================

function addToCart(productId) {

const product = products.find(item => item.id === productId);
if (!product) return;
const existingItem = cart.find(item => item.id === productId);
if (existingItem) {
    existingItem.quantity += 1;
} else {
    cart.push({
        ...product,
        quantity: 1
    });
}
saveCart();
alert(product.name + " added to cart!");

}

// ======================================
// DISPLAY SHOPPING CART
// ======================================

function displayCart() {

const container = document.getElementById("cart-items");
if (!container) return;
container.innerHTML = "";
if (cart.length === 0) {
    container.textContent = "Your shopping cart is empty.";
}
let total = 0;
let count = 0;
cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;
    const card = document.createElement("div");
    card.className = "product-card";
    const name = document.createElement("h3");
    name.textContent = item.name;
    const price = document.createElement("p");
    price.textContent = "₦" + item.price.toLocaleString("en-NG");
    const quantity = document.createElement("p");
    quantity.textContent = "Quantity: " + item.quantity;
    const decrease = document.createElement("button");
    decrease.textContent = "-";
    decrease.addEventListener("click", () => {
        updateQuantity(item.id, -1);
    });
    const increase = document.createElement("button");
    increase.textContent = "+";
    increase.addEventListener("click", () => {
        updateQuantity(item.id, 1);
    });
    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
        removeFromCart(item.id);
    });
    card.append(name, price, quantity, decrease, increase, remove);
    container.appendChild(card);
});
const countElement = document.getElementById("cart-count");
const totalElement = document.getElementById("cart-total");
if (countElement) countElement.textContent = count;
if (totalElement) totalElement.textContent = total.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

}

// ======================================
// UPDATE PRODUCT QUANTITY
// ======================================

function updateQuantity(productId, change) {

const item = cart.find(product => product.id === productId);
if (!item) return;
item.quantity += change;
if (item.quantity <= 0) {
    cart = cart.filter(product => product.id !== productId);
}
saveCart();
displayCart();

}

// ======================================
// REMOVE PRODUCT FROM CART
// ======================================

function removeFromCart(productId) {

cart = cart.filter(item => item.id !== productId);
saveCart();
displayCart();

}

// ======================================
// CHECKOUT AND ORDER MANAGEMENT
// ======================================

function checkout() {

if (cart.length === 0) {
    alert("Your shopping cart is empty.");
    return;
}
const order = {
    id: "ASU-" + Date.now(),
    items: [...cart],
    total: cart.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0),
    status: "Pending",
    date: new Date().toLocaleDateString()
};
orders.push(order);
saveOrders();
cart = [];
saveCart();
displayCart();
alert("Your order has been placed successfully!");
window.location.href = "orders.html";

}

const checkoutButton = document.getElementById(“checkoutBtn”);

if (checkoutButton) {

checkoutButton.addEventListener("click", checkout);

}

// ======================================
// DISPLAY CUSTOMER ORDERS
// ======================================

function displayOrders() {

const container = document.getElementById("orders-list");
if (!container) return;
container.innerHTML = "";
if (orders.length === 0) {
    container.textContent = "You have not placed any orders yet.";
    return;
}
orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";
    const title = document.createElement("h3");
    title.textContent = "Order: " + order.id;
    const date = document.createElement("p");
    date.textContent = "Date: " + order.date;
    const total = document.createElement("p");
    total.textContent = "Total: ₦" + order.total.toLocaleString("en-NG");
    const status = document.createElement("p");
    status.textContent = "Status: " + order.status;
    const items = document.createElement("p");
    items.textContent = "Products: " + order.items.map(item => {
        return item.name + " (x" + item.quantity + ")";
    }).join(", ");
    card.append(title, date, items, total, status);
    container.appendChild(card);
});

}

// ======================================
// INITIALIZE CART AND ORDERS
// ======================================

displayCart();

displayOrders();