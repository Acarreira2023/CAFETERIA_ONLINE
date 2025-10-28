# ☕ Tienda de Café

Proyecto de e-commerce básico desarrollado en HTML, CSS y JavaScript puro. Permite visualizar productos de café, navegar entre secciones, ver reseñas y reproducir contenido multimedia.

## 🚀 Funcionalidades

- Catálogo de productos con nombre, descripción y precio
- Botón “+” para agregar productos (sin carrito funcional aún)
- Video informativo sobre el proceso del café
- Navegación entre secciones: Inicio, Productos, Reseñas, Contacto
- Diseño responsive básico

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (sin frameworks)
- Markdown para documentación

## 📁 Estructura del proyecto

- `index.html` — Página principal. Aquí se muestra la estructura del sitio: header, video, sección de productos, reseñas, contacto y carrito.
- `styles.css` — Estilos del sitio (colores, diseño responsivo y componentes).
- `scripts.js` — Lógica para cargar los productos desde un JSON, buscar/filtrar/ordenar, y manejar el carrito (localStorage).
- `assets/` — Carpeta con imágenes y videos usados en la página.
  - `assets/imagenes/` — Imágenes del sitio (logo, fotos de reseñas, etc.).
  - `assets/productos/` — Fotos de los productos.
  - `assets/videos/` — Video del proceso del café y subtítulos.
- `data/productos-cafe.json` — Archivo JSON con los datos de los productos (nombre, precio, descripción, imagen, etc.).

## 🛍️ Productos

Cada producto es un objeto con propiedades (ejemplo):

```json
{
  "id": 1,
  "nombre": "Café Molido Colombia 250g",
  "descripcion": "Café suave con notas frutales",
  "precio": 1200,
  "imagen": "assets/productos/Cafe-molido-Colombia-250g.jpg",
  "oferta": false
}
```

- `id`: número único.
- `nombre` y `descripcion`: texto que se mostrará en la tarjeta.
- `precio`: número (sin símbolo). El script formatea la moneda.
- `imagen`: ruta relativa dentro del proyecto.
- `oferta`: `true` o `false` para mostrar la etiqueta "OFERTA" y el precio original si existe.

## 🛒 Carrito y localStorage

- El carrito se guarda en el `localStorage` del navegador. Si se recarga la página, el carrito persiste.
- Para vaciarlo manualmente se puede usar el botón `Vaciar Carrito` en la UI o borrar el key `carrito` desde las herramientas de desarrollador (Application > Local Storage).

## 📜 Licencia

Este proyecto está bajo la licencia MIT. Se puede usar, modificar y compartir libremente.

## 🙌 Créditos

Creado por Aníbal Carreira, apasionado por el e-commerce de café y la experiencia de usuario modular.

