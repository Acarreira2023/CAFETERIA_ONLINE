
// VARIABLES GLOBALES

let productos = [];
let productosFiltrados = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];


// ELEMENTOS DEL DOM

const grid = document.querySelector(".products-grid");
const searchInput = document.querySelector(".search-input");
const sortSelect = document.querySelector(".sort-select");
const filterBtns = document.querySelectorAll(".filter-btn");
const cartCount = document.querySelector('.cart-count');
const cartBody = document.querySelector('.cart-body');
const cartTotal = document.querySelector('.cart-total strong');
const btnCheckout = document.querySelector('.btn-checkout');
const btnClear = document.querySelector('.btn-clear');
const btnMenu = document.querySelector('.btn-menu');
const navLinks = document.querySelector('.nav-links');

// FUNCIONES DE RENDERIZADO

// Renderiza todos los productos filtrados
function renderProductos() {
  if (productosFiltrados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">😕 No se encontraron productos</p>
        <p>Intenta con otros filtros o términos de búsqueda</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = productosFiltrados.map(p => `
    <div class="product-card">
      ${p.oferta ? '<span class="oferta-badge">OFERTA</span>' : ''}
      <img class="product-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <h3 class="product-title">${p.nombre}</h3>
      <p class="product-desc">${p.descripcion}</p>
      <div class="price-container">
        <span class="price">
          ${p.oferta && p.precio_original
            ? `<strong>$${p.precio.toLocaleString('es-AR')}</strong>
               <span class="old-price">$${p.precio_original.toLocaleString('es-AR')}</span>`
            : `<strong>$${p.precio.toLocaleString('es-AR')}</strong>`}
        </span>
        <button class="add-btn" data-id="${p.id}" title="Agregar al carrito">+</button>
      </div>
    </div>
  `).join("");
}

// Renderiza el carrito
function renderCarrito() {
  if (carrito.length === 0) {
    cartBody.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío</p></div>';
    cartTotal.textContent = '$0';
    cartCount.textContent = '0';
    return;
  }

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;

  cartBody.innerHTML = carrito.map(item => `
    <div class="cart-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="cart-info">
        <h4>${item.nombre}</h4>
        <p class="unit-price">$${item.precio.toLocaleString('es-AR')} c/u</p>
        <div class="quantity-controls">
          <button class="qty-btn" data-id="${item.id}" data-action="decrease">−</button>
          <span class="qty">${item.cantidad}</span>
          <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
        <button class="remove-btn" data-id="${item.id}" title="Eliminar">🗑️</button>
        <span class="cart-subtotal">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
      </div>
    </div>
  `).join("");
}


// FUNCIONES DE FILTRADO Y ORDENAMIENTO


function aplicarFiltros() {
  const texto = searchInput.value.toLowerCase();
  const categoriaActiva = document.querySelector(".filter-btn.active").dataset.category;
  const orden = sortSelect.value;

  productosFiltrados = productos.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(texto) || 
                         p.descripcion.toLowerCase().includes(texto);
    
    let coincideCategoria = true;
    
    if (categoriaActiva === "todos") {
      coincideCategoria = true;
    } else if (categoriaActiva === "oferta") {
      coincideCategoria = p.oferta === true;
    } else {
      // Usa la propiedad categoria del JSON si existe, sino busca por palabras clave
      if (p.categoria) {
        coincideCategoria = p.categoria === categoriaActiva;
      } else {
        if (categoriaActiva === "cafe") {
          coincideCategoria = p.nombre.toLowerCase().includes("café") || 
                             p.nombre.toLowerCase().includes("cafe") || 
                             p.nombre.toLowerCase().includes("grano") || 
                             p.nombre.toLowerCase().includes("molido");
        } else if (categoriaActiva === "accesorios") {
          coincideCategoria = p.nombre.toLowerCase().includes("prensa") || 
                             p.nombre.toLowerCase().includes("taza") || 
                             p.nombre.toLowerCase().includes("filtro");
        } else if (categoriaActiva === "maquinas") {
          coincideCategoria = p.nombre.toLowerCase().includes("máquina") || 
                             p.nombre.toLowerCase().includes("maquina") || 
                             p.nombre.toLowerCase().includes("espresso");
        }
      }
    }

    return coincideTexto && coincideCategoria;
  });

  // Ordenar
  if (orden === "precio-asc") {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (orden === "precio-desc") {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  }

  renderProductos();
}


// FUNCIONES DEL CARRITO


function agregarAlCarrito(idProducto) {
  const producto = productos.find(p => p.id === parseInt(idProducto));
  if (!producto) return;

  const itemExistente = carrito.find(item => item.id === producto.id);

  if (itemExistente) {
    itemExistente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1
    });
  }

  guardarCarrito();
  renderCarrito();
  animarBotonCarrito();
}

function modificarCantidad(idProducto, accion) {
  const item = carrito.find(i => i.id === parseInt(idProducto));
  if (!item) return;

  if (accion === 'creciente') {
    item.cantidad++;
  } else if (accion === 'decreciente') {
    item.cantidad--;
    if (item.cantidad <= 0) {
      eliminarDelCarrito(idProducto);
      return;
    }
  }

  guardarCarrito();
  renderCarrito();
}

function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter(item => item.id !== parseInt(idProducto));
  guardarCarrito();
  renderCarrito();
}

function vaciarCarrito() {
  if (carrito.length === 0) return;
  
  if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
    carrito = [];
    guardarCarrito();
    renderCarrito();
  }
}

function procesarPago() {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const resumen = carrito.map(item => `${item.nombre} x${item.cantidad}`).join('\n');
  
  alert(`Procesando pago...\n\n${resumen}\n\nTotal: $${subtotal.toLocaleString('es-AR')}\n\n(Esta es una demo, no se procesará ningún pago real)`);
  
  // Aca se integraría el bloque de pago
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function animarBotonCarrito() {
  const btnCart = document.querySelector('.btn-cart');
  btnCart.style.transform = 'scale(1.2)';
  setTimeout(() => {
    btnCart.style.transform = 'scale(1)';
  }, 200);
}


// MENÚ MÓVIL


function toggleMenu() {
  navLinks.classList.toggle('mobile-open');
}


// EVENTOS

// Filtros y búsqueda
searchInput.addEventListener("input", aplicarFiltros);
sortSelect.addEventListener("change", aplicarFiltros);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    aplicarFiltros();
  });
});

// Agregar al carrito
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-btn')) {
    const idProducto = e.target.dataset.id;
    agregarAlCarrito(idProducto);
  }

  // Controles de cantidad en carrito
  if (e.target.classList.contains('qty-btn')) {
    const idProducto = e.target.dataset.id;
    const accion = e.target.dataset.action;
    modificarCantidad(idProducto, accion);
  }

  // Eliminar producto
  if (e.target.classList.contains('remove-btn')) {
    const idProducto = e.target.dataset.id;
    eliminarDelCarrito(idProducto);
  }
});

// Botones del carrito
if (btnClear) {
  btnClear.addEventListener('click', vaciarCarrito);
}

if (btnCheckout) {
  btnCheckout.addEventListener('click', procesarPago);
}

// Menú móvil
if (btnMenu) {
  btnMenu.addEventListener('click', toggleMenu);
}

// Cerrar menú al hacer click
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}


// CARGA DE PRODUCTOS

// Muestra indicador de carga
grid.innerHTML = `
  <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
    <div style="display: inline-block; width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #a0522d; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <p style="margin-top: 1rem; color: #666;">Cargando productos...</p>
  </div>
`;

// Carga archivo JSON con los productos
fetch("./data/productos-cafe.json")
  .then(res => {
    if (!res.ok) {
      throw new Error('No se pudo cargar los productos');
    }
    return res.json();
  })
  .then(data => {
    productos = data;
    productosFiltrados = [...productos];
    renderProductos();
    renderCarrito(); // Renderizar carrito guardado
  })
  .catch(err => {
    console.error("Error cargando productos:", err);
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #c00;">
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">❌ Error al cargar los productos</p>
        <p style="margin-bottom: 1.5rem;">No se pudo conectar con el servidor</p>
        <button onclick="location.reload()" style="background: #a0522d; color: white; padding: 0.7rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
          🔄 Reintentar
        </button>
      </div>
    `;
  });