// ======================================
// GAMEHUB - DIGITAL GAMING STORE
// ======================================

// PRODUCT DATABASE
const products = [
  {
    id: 1,
    name: "Xbox Game Pass Ultimate",
    category: "Subscriptions",
    platform: "Xbox",
    price: 14.99,
    oldPrice: 19.99,
    badge: "POPULAR",
    emoji: "🎮",
    color: "linear-gradient(135deg,#075b39,#102c29)"
  },
  {
    id: 2,
    name: "PlayStation Gift Card $50",
    category: "Gift Cards",
    platform: "PlayStation",
    price: 50,
    oldPrice: 55,
    badge: "HOT",
    emoji: "🎁",
    color: "linear-gradient(135deg,#123b85,#101b44)"
  },
  {
    id: 3,
    name: "Xbox Gift Card $25",
    category: "Gift Cards",
    platform: "Xbox",
    price: 25,
    oldPrice: 29,
    badge: "SALE",
    emoji: "💳",
    color: "linear-gradient(135deg,#126b42,#102a26)"
  },
  {
    id: 4,
    name: "EA SPORTS FC 26",
    category: "PlayStation",
    platform: "PlayStation",
    price: 49.99,
    oldPrice: 69.99,
    badge: "NEW",
    emoji: "⚽",
    color: "linear-gradient(135deg,#622a19,#24141d)"
  },
  {
    id: 5,
    name: "Minecraft Digital Code",
    category: "Xbox",
    platform: "Xbox",
    price: 19.99,
    oldPrice: 29.99,
    badge: "DEAL",
    emoji: "⛏️",
    color: "linear-gradient(135deg,#31572c,#172a22)"
  },
  {
    id: 6,
    name: "PlayStation Plus Extra",
    category: "Subscriptions",
    platform: "PlayStation",
    price: 39.99,
    oldPrice: 49.99,
    badge: "POPULAR",
    emoji: "⭐",
    color: "linear-gradient(135deg,#234b99,#151c42)"
  },
  {
    id: 7,
    name: "Grand Theft Auto V",
    category: "PlayStation",
    platform: "PlayStation",
    price: 24.99,
    oldPrice: 39.99,
    badge: "SALE",
    emoji: "🚗",
    color: "linear-gradient(135deg,#7a3a1b,#321d25)"
  },
  {
    id: 8,
    name: "Xbox Gift Card $100",
    category: "Gift Cards",
    platform: "Xbox",
    price: 100,
    oldPrice: 110,
    badge: "HOT",
    emoji: "💎",
    color: "linear-gradient(135deg,#12633e,#172d2a)"
  }
];

// SAFE LOCAL STORAGE HELPERS (storage can be blocked or contain bad data)
function loadStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage unavailable: the app keeps working for this session.
  }
}

// STATE
let activeCategory = "All";
let searchTerm = "";

// Keep only valid cart items (known product, positive integer quantity)
let cart = loadStored("gamehub-cart", []).filter(item =>
  item &&
  products.some(p => p.id === item.id) &&
  Number.isInteger(item.quantity) &&
  item.quantity > 0
);

let wishlist = loadStored("gamehub-wishlist", []).filter(id =>
  products.some(p => p.id === id)
);

// ELEMENTS
const productGrid = document.getElementById("productGrid");
const emptyMessage = document.getElementById("emptyMessage");
const sortSelect = document.getElementById("sortSelect");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const nav = document.getElementById("nav");
const toast = document.getElementById("toast");

// FORMAT PRICE
function formatPrice(price) {
  return "$" + price.toFixed(2);
}

// TOAST
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// SAVE CART
function saveCart() {
  saveStored("gamehub-cart", cart);
  renderCart();
}

// SAVE WISHLIST
function saveWishlist() {
  saveStored("gamehub-wishlist", wishlist);
}

// RENDER PRODUCTS
function renderProducts() {
  const term = searchTerm.trim().toLowerCase();

  const filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const searchContent =
      `${product.name} ${product.category} ${product.platform}`.toLowerCase();

    return matchesCategory && searchContent.includes(term);
  });

  // SORT PRODUCTS
  const sortValue = sortSelect.value;

  if (sortValue === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  productGrid.innerHTML = "";
  emptyMessage.hidden = filtered.length !== 0;

  filtered.forEach(product => {
    const isFavorite = wishlist.includes(product.id);

    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image" style="background:${product.color}">
        <span class="product-badge">${product.badge}</span>

        <button class="wishlist ${isFavorite ? "active" : ""}"
          data-wishlist="${product.id}"
          aria-pressed="${isFavorite}"
          aria-label="${isFavorite ? "Remove from wishlist" : "Add to wishlist"}">
          ${isFavorite ? "♥" : "♡"}
        </button>

        <span class="product-emoji">${product.emoji}</span>
      </div>

      <div class="product-info">
        <span class="product-platform">${product.platform}</span>
        <h3>${product.name}</h3>

        <div class="product-bottom">
          <div>
            <span class="price">${formatPrice(product.price)}</span>
            <span class="old-price">${formatPrice(product.oldPrice)}</span>
          </div>

          <button class="add-btn" data-add="${product.id}">
            + Add
          </button>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

// SET ACTIVE CATEGORY (keeps filter buttons in sync)
function setCategory(category) {
  activeCategory = category;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === category);
  });

  renderProducts();
}

// FILTER BUTTONS
document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.filter);
  });
});

// CATEGORY CARDS
document.querySelectorAll(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    // Clear any search so the chosen category is never hidden by old text
    searchTerm = "";
    searchInput.value = "";

    setCategory(button.dataset.category);

    document.getElementById("products").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// SEARCH
searchInput.addEventListener("input", event => {
  searchTerm = event.target.value;
  renderProducts();
});

// SEARCH TOGGLE
document.getElementById("searchToggle").addEventListener("click", () => {
  searchPanel.classList.toggle("show");

  if (searchPanel.classList.contains("show")) {
    searchInput.focus();
  }
});

// SORT
sortSelect.addEventListener("change", renderProducts);

// ADD TO CART
function addToCart(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  saveCart();
  showToast(`${product.name} added to cart!`);
}

// PRODUCT BUTTON EVENTS
productGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const wishlistButton = event.target.closest("[data-wishlist]");

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }

  if (wishlistButton) {
    const id = Number(wishlistButton.dataset.wishlist);

    if (wishlist.includes(id)) {
      wishlist = wishlist.filter(item => item !== id);
      showToast("Removed from wishlist");
    } else {
      wishlist.push(id);
      showToast("Added to wishlist ♥");
    }

    saveWishlist();
    renderProducts();
  }
});

// RENDER CART
function renderCart() {
  cartItems.innerHTML = "";

  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div style="text-align:center;padding:60px 10px;color:#929bb0">
        <div style="font-size:55px">🛒</div>
        <h3 style="margin:15px">Your cart is empty</h3>
        <p style="font-size:12px">Let's find something awesome!</p>
      </div>
    `;
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return;

    const subtotal = product.price * item.quantity;

    total += subtotal;
    count += item.quantity;

    const element = document.createElement("div");
    element.className = "cart-item";

    element.innerHTML = `
      <div class="cart-item-icon">${product.emoji}</div>

      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <p>${formatPrice(subtotal)}</p>

        <div class="quantity">
          <button data-decrease="${product.id}" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-increase="${product.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <button class="remove-btn"
        data-remove="${product.id}"
        aria-label="Remove product">✕</button>
    `;

    cartItems.appendChild(element);
  });

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);
}

// CART ACTIONS
cartItems.addEventListener("click", event => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");

  if (increase) {
    const item = cart.find(
      p => p.id === Number(increase.dataset.increase)
    );

    if (item) item.quantity++;
  }

  if (decrease) {
    const item = cart.find(
      p => p.id === Number(decrease.dataset.decrease)
    );

    if (item) {
      item.quantity--;

      if (item.quantity <= 0) {
        cart = cart.filter(p => p.id !== item.id);
      }
    }
  }

  if (remove) {
    cart = cart.filter(
      p => p.id !== Number(remove.dataset.remove)
    );
  }

  saveCart();
});

// OPEN CART
function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

// CLOSE CART
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    nav.classList.remove("show");
  }
});

// CHECKOUT (demo only)
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty");
  } else {
    showToast("Demo storefront — checkout is not yet connected.");
  }
});

// MOBILE MENU
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("show");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// NEWSLETTER
document.getElementById("newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const message = document.getElementById("newsletterMessage");

  message.textContent = "Thanks for subscribing! 🎮";
  form.reset();
});

// INIT
renderProducts();
renderCart();