
## API doc

### Arquitectura por capas

La API separa las responsabilidades en cuatro capas, con el patrón **Repository** entre la lógica de negocio y el acceso a datos:

```
Controller  →  Service  →  Repository  →  DAO  →  Base de datos
  (HTTP)        (negocio)   (entidades)     (persistencia)
```

- **Controller**: maneja `req`/`res`, no conoce la persistencia.
- **Service**: contiene la lógica de negocio (validaciones, reglas) y depende de los **repositories**.
- **Repository**: expone entidades de dominio al service y traduce los documentos de la base a esas entidades (por ejemplo, convierte `_id` a `id` y normaliza la referencia `cart`).
- **DAO**: habla únicamente con la base de datos (Mongoose o archivo JSON) y devuelve documentos crudos, sin mapeo de entidad.

Archivos: `src/repositories/{users,carts,products,password-reset}.repository.js`. Las dependencias se inyectan por constructor, de modo que el service nunca importa un DAO directamente.

### Inyección de dependencias (contenedor)

`src/di/container.js` es un contenedor que construye **una sola instancia** de cada repositorio, service y controller (patrón *lazy singleton* con caché). Las rutas no instancian nada: consumen el contenedor.

```js
const container = require("../di/container");
const usersController = container.usersController;
```

Ventajas: no hay `new` duplicados en cada archivo de rutas, las dependencias quedan centralizadas y son sustituibles por mocks en una futura suite de tests.

### Manejo de errores

- `src/errors/app-error.js`: jerarquía `AppError` con `statusCode` (400, 401, 403, 404, 409, 429, 500) y factories (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `tooManyRequests`, `internal`).
- `src/middleware/errorHandler.js`: exporta `errorHandler` (respuesta `{ success: false, message }`, log con nivel según severidad y stack solo fuera de producción) y `notFoundHandler` (HTML 404 para el sitio, JSON `{ success: false, message: "Ruta no encontrada" }` para `/api/*`).
- Los errores sin tipar (`Error`) conservan el comportamiento previo: `500`.

### Logging

`src/utils/logger.js` escribe con timestamp y nivel (`error`, `warn`, `info`, `debug`), filtrado por `LOG_LEVEL` (`error`, `warn`, `info`, `debug`).

### Configuración y variables de entorno

`config/config.js` centraliza y valida el entorno: convierte tipos (`readNumber`, `readBoolean`), recorta strings, congela el objeto exportado (`Object.freeze`) y **falla rápido** con `ConfigurationError` si falta `JWT_SECRET`, si es menor a 16 caracteres, si `PORT` no es numérico, si `MAIL_TRANSPORT` es inválido o si en `NODE_ENV=production` faltan `MONGO_URI`, `JWT_SECRET` o `FRONTEND_URL`.

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Entorno de ejecución |
| `LOG_LEVEL` | `debug` (`info` en prod) | Nivel de logging |
| `TRUST_PROXY` | `false` | Confía en `X-Forwarded-For` (rate limiting detrás de proxy) |
| `SHUTDOWN_TIMEOUT_MS` | `10000` | Timeout del apagado ordenado |
| `AUTH_RATE_LIMIT_MAX` | `30` | Requests de register/login por ventana (`0` desactiva) |
| `AUTH_RATE_LIMIT_WINDOW_MS` | `900000` | Ventana de auth (15 min) |
| `PASSWORD_RESET_RATE_LIMIT_MAX` | `10` | Requests de forgot/reset por ventana (`0` desactiva) |
| `PASSWORD_RESET_RATE_LIMIT_WINDOW_MS` | `3600000` | Ventana de reset (1 h) |
| `MAIL_TRANSPORT` | `smtp` si hay `SMTP_HOST`, si no `console` | `smtp`, `json`, `stream` o `console` |

### Mailing

`src/services/mailer.service.js` usa el patrón **Strategy** para elegir el transporte según `MAIL_TRANSPORT`, con las plantillas HTML separadas del envío:

- `smtp`: envío real (requiere `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).
- `json`: captura el mensaje en memoria, sin red. Ideal para tests.
- `stream`: vuelca el mensaje crudo en memoria.
- `console`: no envía; registra el enlace y la API responde `previewUrl`.

Un fallo de SMTP no rompe el flujo de recuperación: se loguea y se lanza `AppError.internal`.

### Seguridad y observabilidad

- **helmet**: cabeceras de seguridad (X-Content-Type-Options, X-Frame-Options, HSTS, etc.). CSP y COEP están desactivados porque las vistas `.hbs` usan estilos y scripts inline.
- **express-rate-limit** sobre `register`, `login`, `forgot-password` y `reset-password`; responde `429` con `{ success: false, message }` y cabeceras `RateLimit-*`.
- **Graceful shutdown**: `SIGINT`/`SIGTERM` cierran socket.io, servidor HTTP y conexión de MongoDB antes de salir, con timeout de seguridad.
- Se registran `unhandledRejection` y `uncaughtException`.

### GET /api/health (y /health)
- **Respuesta**: `200` si la base está conectada, `503` si no.

```json
{
  "status": "ok",
  "uptime": 120,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "database": "connected"
}
```

### Lista de 5 Libros para Pruebas
```json
[
  {
    "id": "664f3c8a8d1d1a0f9c7a5b1a",
    "title": "Cien años de soledad",
    "year": 1967,
    "author": "Gabriel García Márquez",
    "genre": "Realismo mágico",
    "description": "La saga de la familia Buendía en Macondo",
    "price": 24.99,
    "stock": 15,
    "img": "https://images.example.com/cien-anos-soledad.jpg"
  },
  {
    "id": "664f3c8a8d1d1a0f9c7a5b1b",
    "title": "1984",
    "year": 1949,
    "author": "George Orwell",
    "genre": "Distopía",
    "description": "Una sociedad vigilada por el Gran Hermano",
    "price": 18.50,
    "stock": 20,
    "img": "https://images.example.com/1984.jpg"
  },
  {
    "id": "664f3c8a8d1d1a0f9c7a5b1c",
    "title": "El Hobbit",
    "year": 1937,
    "author": "J.R.R. Tolkien",
    "genre": "Fantasía",
    "description": "El viaje de Bilbo Bolsón a la Montaña Solitaria",
    "price": 22.95,
    "stock": 12,
    "img": "https://images.example.com/hobbit.jpg"
  },
  {
    "id": "664f3c8a8d1d1a0f9c7a5b1d",
    "title": "Orgullo y prejuicio",
    "year": 1813,
    "author": "Jane Austen",
    "genre": "Clásico",
    "description": "La historia de Elizabeth Bennet y Fitzwilliam Darcy",
    "price": 16.75,
    "stock": 18,
    "img": "https://images.example.com/orgullo-prejuicio.jpg"
  },
  {
    "id": "664f3c8a8d1d1a0f9c7a5b1e",
    "title": "La sombra del viento",
    "year": 2001,
    "author": "Carlos Ruiz Zafón",
    "genre": "Misterio",
    "description": "Un libro misterioso en el Cementerio de los Libros Olvidados",
    "price": 26.50,
    "stock": 10,
    "img": "https://images.example.com/sombra-viento.jpg"
  }
]
```

### Pasos para Probar Todas las Rutas de Libros

#### 1. Preparar el entorno
1. Iniciar el servidor: `npm start`
2. Instalar Thunder Client (extensión de VSCode) o usar Postman
3. Configurar `Content-Type: application/json` en los headers

---

#### 2. Probar GET /api/books (Listar libros)
- **Método**: GET
- **URL**: `http://localhost:8080/api/books`
- **Respuesta Esperada**: Array vacío o con libros existentes
- **Código**: 200 OK

#### 2. b. Probar GET by ID /api/books/:id (Obtener libro por ID)
- **Método**: GET
- **URL**: `http://localhost:8080/api/books/664f3c8a8d1d1a0f9c7a5b1b` (usar id real)
- **Respuesta Esperada**: Objeto del libro correspondiente
- **Código**: 200 OK

---

#### 3. Probar POST /api/books (Crear libro)
- **Método**: POST
- **URL**: `http://localhost:8080/api/books`
- **Body** (usar un libro de la lista sin `id`):
```json
{
  "title": "La Biblioteca de Babel",
  "author": "Jorge Luis Borges",
  "year": 1941,
  "genre": "Fantasía",
  "description": "Un relato sobre un universo en forma de biblioteca",
  "price": 15.99,
  "stock": 12,
  "img": "https://images.example.com/biblioteca-babel.jpg"
}
```

---

## Autenticación y Autorización (JWT)

La API usa JSON Web Tokens. Para acceder a rutas protegidas hay que enviar el token en el header:

```
Authorization: Bearer <token>
```

La autenticación se resuelve con **Passport** mediante tres estrategias definidas en `config/passport.js`:

| Estrategia | Tipo | Uso |
|------------|------|-----|
| `register` | `passport-local` | Crea el usuario (hashea la password con bcrypt y le asigna un carrito) |
| `login` | `passport-local` | Valida email + password contra el modelo `User` |
| `jwt` | `passport-jwt` | Autentica el token `Authorization: Bearer` y carga el usuario |

### Modelo User
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "age": 30,
  "password": "contraseña-hasheada-en-mongo",
  "cart": "65f...ObjectId",
  "role": "user"
}
```
`password` se guarda hasheado con bcrypt y nunca se devuelve en las respuestas. `cart` es un ObjectId con referencia a la colección `Carts`. `role` por defecto es `user`.

---

### POST /api/sessions/register (Registrar usuario)
- **Body**:
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "age": 30,
  "password": "123456"
}
```
- **Respuesta**: `201 Created` con `{ user, token }`. Se crea automáticamente un carrito para el usuario.

### POST /api/sessions/login (Iniciar sesión con JWT)
- **Body**:
```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```
- **Respuesta**: `200 OK` con `{ user, token }`. Con credenciales inválidas devuelve `401`.
```json
{
  "user": {
    "id": "65f...ObjectId",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "age": 30,
    "cart": "65f...ObjectId",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
El JWT se genera con `jwt.sign` usando `JWT_SECRET` y expira según `JWT_EXPIRES_IN` (por defecto `24h`). A partir de acá, todas las rutas protegidas se autentican enviando el token en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

La validación del token la hace la estrategia `jwt` de Passport (`passport-jwt`), que verifica firma y expiración, y carga el usuario real desde la base.

### GET /api/sessions/current (Usuario actual)
- **Requiere**: token (auth) → `Authorization: Bearer <token>`
- **Respuesta**: `200 OK` con `{ user }`. Devuelve un **DTO** con la información mínima necesaria de la sesión, ya validada por la estrategia `jwt` de Passport. No incluye datos sensibles ni personales innecesarios (ni `password` —siempre hasheada y nunca expuesta— ni `age`):
```json
{
  "user": {
    "id": "65f...ObjectId",
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "cart": "65f...ObjectId",
    "role": "user"
  }
}
```
Con token inválido o ausente devuelve `401`. El perfil completo (incluido `age`) se consulta con `GET /api/users/:uid`.

### POST /api/sessions/logout (Cerrar sesión)
- **Requiere**: token (auth)
- **Respuesta**: mensaje de confirmación. El token debe descartarse del lado del cliente.

---

## Recuperación de contraseña

Flujo de dos pasos: se solicita un enlace por correo y luego se envía la nueva contraseña junto al token recibido.

### POST /api/sessions/forgot-password (Solicitar restablecimiento)
- **Body**:
```json
{
  "email": "juan@example.com"
}
```
- **Respuesta**: `200 OK` con `{ message }`. La respuesta es siempre la misma exista o no el email (evita enumerar cuentas). En desarrollo, sin SMTP configurado, también devuelve `previewUrl` con el enlace directo para poder probarlo.

El sistema genera un token aleatorio, guarda **solo su hash SHA-256** en la colección `passwordresets` y envía por correo un botón que apunta a:

```
{FRONTEND_URL}/reset-password?token=<token>
```

Cada solicitud invalida los enlaces activos previos del mismo usuario.

### POST /api/sessions/reset-password (Restablecer contraseña)
- **Body**:
```json
{
  "token": "<token recibido por correo>",
  "password": "nuevaClave123"
}
```
- **Respuesta**: `200 OK` con `{ message }`.

Reglas aplicadas:
- El enlace **expira a la hora** de haber sido enviado (`RESET_TOKEN_EXPIRES_MINUTES`, por defecto `60`). Los documentos vencidos se limpian solos por índice TTL de MongoDB.
- El enlace es de **un solo uso**: al completar el cambio queda marcado como `used`.
- **No se puede restablecer con la misma contraseña anterior**: se compara con `bcrypt.compare` contra el hash actual y se rechaza si coincide.
- La contraseña nueva se guarda hasheada con bcrypt mediante el hook `pre("save")` del modelo `User`.
- Se envía un correo de confirmación al usuario.

Configuración SMTP en `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`) y `FRONTEND_URL` con la URL pública donde vive el formulario.

---

### CRUD de usuarios (`/api/users`)

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/users` | admin | Lista todos los usuarios |
| GET | `/api/users/:uid` | autenticado | Obtiene un usuario por id |
| POST | `/api/users` | admin | Crea un usuario (crea su carrito) |
| PUT | `/api/users/:uid` | admin | Actualiza un usuario (puede cambiar `role`, `password`, etc.) |
| DELETE | `/api/users/:uid` | admin | Elimina un usuario y su carrito |

---

### Autorización en el resto de la API

La autorización se aplica con middlewares propios que trabajan sobre el `req.user` que deja la estrategia `jwt` de Passport (la misma que valida `GET /api/sessions/current`):

- `requireAuth` (`src/middleware/auth.middleware.js`): autentica. Delega en la estrategia `jwt` y llena `req.user`.
- `authorize(roles)` (`src/middleware/authorization.middleware.js`): autoriza por rol. Devuelve `401` si no hay `req.user` y `403` si el rol no está en la lista.
- `adminOnly` = `authorize(["admin"])` · `userOnly` = `authorize(["user"])`
- `requireCartOwnership` / `requireOrderOwnership` (`src/middleware/ownership.middleware.js`): verifica **propiedad** del recurso. `401`/`403` según corresponda, `404` si el recurso no existe, y deja el recurso en `req.cart` / `req.order`.

---

## Roles y compra

### Modelo de roles

Solo hay dos roles (`user` y `admin`), pero el `admin` es **un usuario con permisos adicionales**, no un usuarioMinus: puede comprar igual que cualquiera.

| Capacidad | `user` | `admin` |
|-----------|:------:|:-------:|
| Ver productos | ✅ público | ✅ público |
| Crear/actualizar/eliminar productos (y stock) | ❌ | ✅ |
| Crear un carrito | ✅ (queda a su nombre) | ✅ |
| Ver sus carritos | ✅ | ✅ |
| Ver carritos ajenos | ❌ | ✅ |
| Agregar/quitar productos, cambiar cantidades | ✅ solo **en su carrito** | ✅ en cualquier carrito |
| **Comprar** (`POST /api/carts/:cid/purchase`) | ✅ solo **en su carrito** | ✅ en cualquier carrito |
| Ver sus órdenes | ✅ | ✅ |
| Ver órdenes ajenas | ❌ | ✅ |
| Cambiar el estado de una orden | ❌ | ✅ |
| Gestionar usuarios | ❌ | ✅ |

### Ownership de carritos

Cada carrito tiene un `owner` (referencia al usuario). El middleware `requireCartOwnership` bloquea el acceso ajeno con `403` y loguea el intento. Los carritos creados **antes** de este cambio no tienen dueño: solo un `admin` puede operarlos hasta que se reasignen.

Esto cierra un **IDOR** que existía antes: los endpoints `PUT /api/carts/:cid`, `DELETE /api/carts/:cid`, etc. solo pedían autenticación, así que cualquier usuario autenticado podía leer, vaciar o borrar el carrito de otro con solo conocer el id.

`GET /api/carts` cambió de comportamiento: un `user` ahora recibe únicamente sus carritos; el `admin` sigue recibiendo todos.

### POST /api/carts/:cid/purchase (Comprar)
- **Requiere**: token + ser dueño del carrito (o `admin`)
- **Respuesta**: `201 Created` con la orden creada.

Flujo y reglas (`CartsService.purchaseCart`):

1. El carrito no puede estar vacío → `400`.
2. Por cada línea se resuelve el producto en el servidor. **El precio se toma del catálogo, nunca del carrito ni del body**: el cliente no puede manipular lo que paga.
3. Producto inexistente o cantidad inválida → `400`.
4. Producto con `status: false` o `status` no disponible → `409`.
5. Stock insuficiente (`product.stock < quantity`) → `409`, y no se crea la orden ni se toca el stock.
6. Se crea la orden en la colección `orders` con un **snapshot** de cada ítem (`product`, `title`, `price`, `quantity`, `subtotal`) y el `total` calculado.
7. Se descuenta el stock de cada producto.
8. Se vacía el carrito.

```json
{
  "id": "6a1f...",
  "user": "6a1e...",
  "cart": "6a1d...",
  "items": [
    { "product": "664f3c8a8d1d1a0f9c7a5b1b", "title": "Teclado Logitech K270 Graphite Wireless", "price": 31000, "quantity": 2, "subtotal": 62000 }
  ],
  "total": 62000,
  "status": "paid",
  "createdAt": "2026-01-01T12:00:00.000Z"
}
```

Estados posibles: `paid` (al comprar), `shipped`, `delivered`, `cancelled`.

> **Limitación conocida**: los productos viven en `data/products.json` y las órdenes en MongoDB, así que el checkout no es atómico entre ambos. Si el descuento de stock fallara a mitad de camino, la orden ya quedó creada (priorizamos no perder una venta). Con productos migrados a Mongo se puede resolver con una transacción de sesión.

### Órdenes

| Endpoint | Regla |
|----------|-------|
| `GET /api/orders` | `user` → sus órdenes · `admin` → todas |
| `GET /api/orders/:oid` | dueño de la orden o `admin` |
| `PUT /api/orders/:oid/status` | solo `admin`; `status` debe ser uno de `paid`, `shipped`, `delivered`, `cancelled` (si no, `400`) |

---

### Autorización por rol (resto de la API)

| Regla | Endpoints |
|-------|-----------|
| Solo `admin` crea, actualiza y elimina productos | `POST /api/products`, `PUT /api/products/:pid`, `DELETE /api/products/:pid` |
| Solo el dueño del carrito (o `admin`) opera el carrito | todos los `/api/carts/:cid/*` |
| Solo `admin` gestiona usuarios | `GET`/`POST /api/users`, `PUT` y `DELETE /api/users/:uid` |

- **GET /api/products** y **GET /api/products/:pid**: público.