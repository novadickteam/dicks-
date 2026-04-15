# 🌿 BioSmart Platform

**BioSmart** (anteriormente AgroSmart) es una plataforma inteligente e integral para agricultura urbana, trazabilidad de donaciones e e-commerce de productos ecológicos. El sistema fusiona análisis ambientales, IoT y una sólida arquitectura moderna orientada a comunidades sustentables.

---

## 🚀 Capacidades Destacadas

### 🌎 Globo 3D & Mapeo de Donaciones 
* **Visualización Dinámica:** Un imponente globo terráqueo en 3D impulsado por *Three.js* visualiza en tiempo real las donaciones globales.
* **Transición 3D a 2D:** Navegación inmersiva donde el mapa global pasa a una vista satelital y topográfica regional con *Leaflet.js* de forma fluida y reaccionando según el nivel de zoom del usuario.

### 🔐 Autenticación Avanzada
* **SSO y JWT:** Login social automatizado mediante **Google OAuth 2.0**.
* **Gestión de Sesiones Seguras:** Combinación de `Passport.js` y firma de tokens JWT (`bcryptjs` para cifrado de los usuarios nativos).
* **Control de Múltiples Roles (RBAC):** Flujos y dashboards estrictamente separados para Usuarios, Vendedores (`seller`) y Administradores (`admin`). 

### 🛒 E-Commerce y Marketplace Integrado
* **Multivendedor:** Posibilidad de abrir tiendas y listar inventarios ("Ventas de productos").
* **Procesamiento de Compras:** Cálculo en tiempo real, catálogo público responsivo y administración interna de operaciones. 
* **Almacenamiento en la Nube (Cloudinary):** Todas las cargas pesadas de recursos gráficos (imágenes de los productos y avatares) se suben directamente y quedan alojadas en formato optimizado dentro de la infraestructura serverless de **Cloudinary**.

### 📊 Dashboard IoT & Análisis
* Paneles interactivos de información meteorológica ("Nuestras Tecnologías").
* Control simulado y sincronización virtual de sensores embebidos *(Arduino, Apps Blynk)* para granjas hidropónicas urbanas.

---

## 🛠️ Stack Tecnológico

El proyecto se despliega unificando tecnologías escalables:

### 🖥️ Frontend (Client)
* **React 18 + Vite:** Estructura web SPAs extremadamente veloz.
* **Tailwind CSS & Framer Motion:** Microinteracciones visuales premium, "Glassmorphism" adaptativo y "Dark Mode" fluido en todo el ecosistema web.
* **Recharts:** Diagramación predictiva de humedad y clima en los paneles de control. 

### ⚙️ Backend (Server)
* **Express.js (Node):** API RESTFUL para orquestar la recepción de datos.
* **Drizzle ORM:** Definición de esquemas typesafe de alta complejidad.
* **Neon DB (Serverless PostgreSQL):** Nuestra columna vertebral relacional. Funciona 100% en la nube y maneja toda la persistencia de usuarios, roles, suscripciones y geolocalizaciones de donantes. 

---

## ⚙️ Estructura del Proyecto

El código está dividido en un monorepositorio con despliegue concurrente:
- `/client`: Aplicación SPA y estilos.
- `/server`: Rutas Express, esquemas de bases de datos de Neondb (`/db/schema.ts`) y utilidades.

## 🔑 Instalación en Entorno Local

1. Instalar las dependencias de todos los espacios de trabajo (frontend y backend):
   ```bash
   npm install
   ```

2. Definir las variables de entorno en tus propios ficheros `.env`:
   - `DATABASE_URL` (De tu portal NeonDB)
   - `GOOGLE_CLIENT_ID=tu_google_client_id`
   - `GOOGLE_CLIENT_SECRET=tu_google_client_secret`
   - `CLOUDINARY_URL` / Api keys.
   - `JWT_SECRET`

3. Ejecuta los procesos y visualiza la web simultáneamente:
   ```bash
   npm run dev
   ```
