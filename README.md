# 🚀 Hackathon Base — TypeScript

Base lista para trabajar en equipo desde el primer minuto.

---

## ⚡ Setup inicial (cada integrante)

```bash
# 1. Clonar el repo
git clone https://github.com/TU_USUARIO/hackathon-base.git
cd hackathon-base

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales reales

# 4. Correr en modo desarrollo
npm run dev
```

---

## 📁 Estructura del proyecto

```
src/
  index.ts        → Punto de entrada principal
  utils/          → Funciones helpers compartidas
tests/
  index.test.ts   → Pruebas
```

---

## 🌿 Flujo de trabajo en equipo (Git)

```bash
# Antes de empezar a trabajar: siempre pull
git pull origin main

# Crear tu rama para cada feature
git checkout -b feature/nombre-de-lo-que-haces

# Guardar cambios frecuentemente
git add .
git commit -m "feat: descripción corta de lo que hiciste"

# Subir tu rama
git push origin feature/nombre-de-lo-que-haces

# Cuando termines: Pull Request a main
```

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar a JavaScript |
| `npm start` | Correr build compilado |
| `npm test` | Correr tests |

---

## 🤝 Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
refactor: refactor sin cambios funcionales
test:     agregar/modificar tests
docs:     solo documentación
chore:    tareas de mantenimiento
```
