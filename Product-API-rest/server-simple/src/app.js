const express = require("express");
const app = express();
const PORT = 3000;

const db_perifericos = [
  { id: 1, producto: "Teclado Logitech", precio: 32000 },
  { id: 2, producto: "Mouse Trust", precio: 21000 },
  { id: 3, producto: "Monitor Samsung", precio: 194000 },
];

app.get("/", (req, res) => {
  
    try {
      const style = `
      body {
        font-family: Arial, sans-serif;
          text-align: center;
          margin-top: 50px;
      }
      a {
        display: inline-block;
          margin: 10px;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
      }
      a:hover {
        background-color: #45a049;
      }
      `;
      const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Mi Primer Server</title>
          <style>
              ${style}
          </style>
      </head>
      <body>
          <h1>Bienvenido a la tienda de periféricos</h1>
          <a href="/api/perifericos">Ver Perifericos</a>
      </body>
      </html>
      `;
      res.status(200).send(html);
    } catch (error) {
      res.status(500).json({ error: "Error al cargar la página principal" });
    }
});

app.get("/api/perifericos", (req, res) => {
  try {
    console.log("--req--> ", req)
    res.status(200).json(db_bicis);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los periféricos" });
  }
});

app.get("/api/perifericos/:id", (req, res) => { 
  const { id } = req.params;
  const periferico = db_bicis.find((p) => p.id === parseInt(id));
  if (periferico) {
    res.status(200).json(periferico);
  } else {
    res.status(404).json({ error: "Periférico no encontrado" });
  }
});
