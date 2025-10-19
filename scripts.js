// Productos
let productos = [];
let productosFiltrados = [];

// Elementos del DOM
const grid = document.querySelector(".products-grid");
const searchInput = document.querySelector(".search-input");
const sortSelect = document.querySelector(".sort-select");
const filterBtns = document.querySelectorAll(".filter-btn");

// Renderizar todos los productos filtrados
function renderProductos() {
  grid.innerHTML = productosFiltrados.map(p => `
    <div class="product-card">
      ${p.oferta ? `<span class="badge">OFERTA</span>` : ""}
      <img class="product-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <h3 class="product-title">${p.nombre}</h3>
      <p class="description">${p.descripcion}</p>
      <div class="product-footer">
        <span class="price">
          ${p.oferta && p.precio_original
            ? `<strong>$${p.precio.toLocaleString("es-AR")}</strong>
               <del class="old-price">$${p.precio_original.toLocaleString("es-AR")}</del>`
            : `<strong>$${p.precio.toLocaleString("es-AR")}</strong>`}
        </span>
        <button class="btn-add-circle" aria-label="Agregar ${p.nombre} al carrito">+</button>
      </div>
    </div>
  `).join("");
}


// Aplicar filtros y orden
function aplicarFiltros() {
  const texto = searchInput.value.toLowerCase();
  const categoriaActiva = document.querySelector(".filter-btn.active").dataset.category;
  const orden = sortSelect.value;

  productosFiltrados = productos.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(texto) || p.descripcion.toLowerCase().includes(texto);
    let coincideCategoria = true;

    if (categoriaActiva === "cafe") coincideCategoria = p.nombre.toLowerCase().includes("café") || p.nombre.toLowerCase().includes("grano") || p.nombre.toLowerCase().includes("molido");
    if (categoriaActiva === "accesorios") coincideCategoria = p.nombre.toLowerCase().includes("taza") || p.nombre.toLowerCase().includes("prensa") || p.nombre.toLowerCase().includes("filtro");
    if (categoriaActiva === "maquinas") coincideCategoria = p.nombre.toLowerCase().includes("máquina") || p.nombre.toLowerCase().includes("espresso");
    if (categoriaActiva === "oferta") coincideCategoria = p.oferta === true;

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

// Eventos
searchInput.addEventListener("input", aplicarFiltros);
sortSelect.addEventListener("change", aplicarFiltros);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    aplicarFiltros();
  });
});

// Cargar archivo JSON
fetch("data/productos-cafe.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    productosFiltrados = [...productos];
    renderProductos();
  })
  .catch(err => console.error("Error cargando productos:", err));