const socket = io();

const form = document.getElementById("productForm");
const productsList = document.getElementById("productsList");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const productData = {
    producto: document.getElementById("producto").value,
    precio: parseFloat(document.getElementById("precio").value),
    stock: parseInt(document.getElementById("stock").value),
    img: document.getElementById("img").value || "",
  };
  socket.emit("new-product", productData);
  form.reset();
});

productsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    socket.emit("delete-product", id);
  }
});

socket.on("products", (products) => {
  productsList.innerHTML = "";
  products.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.producto}</td>
      <td>$${p.precio}</td>
      <td>${p.stock}</td>
      <td><img src="/static/img/${p.img}" alt="${p.producto}" width="50"></td>
      <td><button class="delete-btn" data-id="${p.id}">Eliminar</button></td>
    `;
    productsList.appendChild(row);
  });
});

socket.on("error", (msg) => {
  errorMessage.textContent = msg;
});
