// Configuración
const API_URL = "data/products.json";
const STORAGE_KEY = "coffee_cart_v1";

// Estado
const state = {
  products: [],
  filteredCategory: "all",
  cart: loadCart()
};

// Elementos
const productsGridEl = document.getElementById("productsGrid");
const cartCountEl = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutStatusEl = document.getElementById("checkoutStatus");
const openCartBtn = document.getElementById("openCartBtn");

const cartOffcanvasEl = document.getElementById("cartOffcanvas");
const cartOffcanvas = cartOffcanvasEl ? new bootstrap.Offcanvas(cartOffcanvasEl) : null;

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  setupContactFormValidation();
  setupCheckout();
  fetchProducts();
});

// Fetch de API (JSON local)
async function fetchProducts() {
  try {
    productsGridEl.setAttribute("aria-busy", "true");
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener productos");
    const data = await res.json();
    state.products = data;
    renderProducts();
  } catch (err) {
    productsGridEl.innerHTML = `<div class="alert alert-danger">No se pudieron cargar los productos. Intentá más tarde.</div>`;
  } finally {
    productsGridEl.setAttribute("aria-busy", "false");
  }
}

// Render de productos (Flexbox)
function renderProducts() {
  const list = state.products
    .filter(p => state.filteredCategory === "all" ? true : p.category === state.filteredCategory);

  productsGridEl.innerHTML = list.map(p => productCardHTML(p)).join("");

  // Eventos de botones "Agregar"
  list.forEach(p => {
    const btn = document.querySelector(`button[data-add="${p.id}"]`);
    if (btn) btn.addEventListener("click", () => addToCart(p.id));
  });
}

function productCardHTML(p) {
  const priceFormatted = formatCurrency(p.price);
  return `
    <article class="product-card" aria-label="${escapeHTML(p.title)}">
      <img src="${p.image}" alt="Producto ${escapeHTML(p.title)}" loading="lazy" />
      <div class="product-body">
        <h3 class="product-title">${escapeHTML(p.title)}</h3>
        <p class="product-meta">${escapeHTML(p.origin)} · ${escapeHTML(p.notes)}</p>
        <p class="product-price">${priceFormatted}</p>
        <div class="product-actions">
          <button class="btn btn-sm btn-primary" data-add="${p.id}">Agregar</button>
          <button class="btn btn-sm btn-outline-secondary" aria-label="Ver detalles">Detalles</button>
        </div>
      </div>
    </article>
  `;
}

// Filtros
function setupFilters() {
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.filteredCategory = btn.dataset.filter;
      renderProducts();
    });
  });

  // Abrir carrito
  if (openCartBtn && cartOffcanvas) {
    openCartBtn.addEventListener("click", () => cartOffcanvas.show());
  }

  renderCart();
}

// Carrito
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  updateCartCount();
  updateCartTotal();
}

function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });
  }
  renderCart();
  saveCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  renderCart();
  saveCart();
}

function updateQty(productId, qty) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  const nextQty = Math.max(1, qty);
  item.qty = nextQty;
  renderCart();
  saveCart();
}

function renderCart() {
  if (!cartItemsEl) return;

  if (state.cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="text-muted">Tu carrito está vacío.</p>`;
  } else {
    cartItemsEl.innerHTML = state.cart.map(item => cartItemHTML(item)).join("");

    // Bind eventos de cantidad y eliminar
    state.cart.forEach(item => {
      const qtyInput = document.querySelector(`input[data-qty="${item.id}"]`);
      const delBtn = document.querySelector(`button[data-del="${item.id}"]`);
      if (qtyInput) {
        qtyInput.addEventListener("input", (e) => updateQty(item.id, parseInt(e.target.value || "1", 10)));
      }
      if (delBtn) {
        delBtn.addEventListener("click", () => removeFromCart(item.id));
      }
    });
  }

  updateCartCount();
  updateCartTotal();
}

function cartItemHTML(item) {
  const priceFormatted = formatCurrency(item.price);
  const lineTotalFormatted = formatCurrency(item.price * item.qty);
  return `
    <div class="d-flex align-items-center gap-3 border-bottom pb-2 mb-2">
      <img src="${item.image}" alt="Imagen ${escapeHTML(item.title)}" width="56" height="56" class="rounded" />
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${priceFormatted}</span>
        </div>
        <div class="d-flex align-items-center gap-2 mt-1">
          <label for="qty-${item.id}" class="form-label m-0">Cant.</label>
          <input id="qty-${item.id}" data-qty="${item.id}" type="number" min="1" class="form-control form-control-sm" value="${item.qty}" style="width:88px;" />
          <span class="ms-auto">Subtotal: <strong>${lineTotalFormatted}</strong></span>
          <button class="btn btn-sm btn-outline-danger" data-del="${item.id}">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

function updateCartCount() {
  const totalItems = state.cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = totalItems;
}

function updateCartTotal() {
  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotalEl.textContent = formatCurrency(total);
}

// Checkout (simulado)
function setupCheckout() {
  if (!checkoutBtn) return;
  checkoutBtn.addEventListener("click", () => {
    if (state.cart.length === 0) {
      checkoutStatusEl.textContent = "Tu carrito está vacío.";
      checkoutStatusEl.className = "text-warning mt-2";
      return;
    }
    checkoutStatusEl.textContent = "Compra simulada. ¡Gracias por elegirnos!";
    checkoutStatusEl.className = "text-success mt-2";
    // Limpieza opcional:
    // state.cart = [];
    // renderCart();
    // saveCart();
  });
}

// Validación del formulario (DOM)
function setupContactFormValidation() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    const validName = !!name.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const validMessage = !!message.value.trim();

    setValidity(name, validName);
    setValidity(email, validEmail);
    setValidity(message, validMessage);

    if (!validName || !validEmail || !validMessage) {
      status.textContent = "Por favor, completá los campos correctamente.";
      status.className = "text-warning";
      return;
    }

    // Envío a Formspree
    try {
      status.textContent = "Enviando...";
      status.className = "text-muted";

      const formData = new FormData(form);
      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        status.textContent = "¡Mensaje enviado! Te responderemos pronto.";
        status.className = "text-success";
        form.reset();
      } else {
        status.textContent = "No se pudo enviar el mensaje. Intentá más tarde.";
        status.className = "text-danger";
      }
    } catch {
      status.textContent = "Error de red. Intentá nuevamente.";
      status.className = "text-danger";
    }
  });
}

function setValidity(inputEl, isValid) {
  if (isValid) {
    inputEl.classList.remove("is-invalid");
    inputEl.classList.add("is-valid");
  } else {
    inputEl.classList.add("is-invalid");
    inputEl.classList.remove("is-valid");
  }
}

// Utilidades
function formatCurrency(n) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
}