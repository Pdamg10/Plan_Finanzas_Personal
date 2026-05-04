# FinFlow · Plan Finanzas Personal 💸

**FinFlow** es una aplicación web _full-stack_ de gestión de finanzas personales. Está diseñada con una interfaz moderna, limpia y estéticamente atractiva (componentes premium y estilo "glassmorphism"). Su objetivo es brindarte el control total sobre tus ingresos, gastos, presupuestos y metas financieras de manera sumamente visual e intuitiva.

---

## 🌟 Características Principales

- 📊 **Dashboard de Página Única (SPA)**: Todo el control financiero en una sola pantalla veloz, organizada en pestañas funcionales (Dashboard, Transacciones, Cuentas, Presupuestos, Reportes). Resumen de balance neto, ingresos y gastos con gráficos interactivos (`Recharts`).
- 🧾 **Gestión Integral en Tiempo Real**: Al agregar transacciones, cuentas o presupuestos desde los modales, las vistas y los gráficos de tendencia financiera se actualizan automáticamente de forma local.
- 🎯 **Control de Presupuestos y Cuentas**: Bloques dedicados para administrar múltiples cuentas (efectivo, ahorro, crédito) y barras de progreso visuales para supervisar el uso de presupuestos por categoría.
- ✨ **Diseño Premium UI/UX (Glassmorphism)**: Paleta vibrante (gradientes púrpuras, rosas y azules), desenfoque de fondo dinámico (backdrop-filter) y formas orgánicas animadas para una experiencia estética y moderna.
- 🔒 **Arquitectura Segura y Modo Demo**: Autenticación integrada de JWT y encriptación `Bcrypt` del lado del servidor. _(Nota actual: La interfaz frontend se reestructuró a un "Modo Plantilla" que inyecta una semilla de datos y omite la autenticación para mostrar de inmediato la capacidad de la herramienta)_.

---

## 🛠️ Stack Tecnológico

El proyecto está segmentado de forma modular, con tecnologías de punta:

### Frontend (`/client`)

- **Core**: React (con Vite) y TypeScript en formato Single-Page puro (sin enrutadores complejos).
- **Estilos**: Tailwind CSS con diseño de clases utilitarias personalizadas, y Variables CSS para colores temáticos del sistema de diseño (FinFlow Design System).
- **Componentes Adicionales**: `Recharts` para gráficas (Líneas y Dona), `Lucide React` para iconografía moderna.

### Backend (`/server`)

- **Framework**: NestJS (TypeScript).
- **Base de Datos**: PostgreSQL utilizando el ORM `TypeORM`.
- **Seguridad**: `Passport` para estrategias de sesión, `JWT` para tokens y `Bcrypt` para hash de contraseñas de usuarios.

---

## 🚀 Instalación y Uso (Getting Started)

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18+ recomendada).
- Motor de base de datos [PostgreSQL](https://www.postgresql.org/) corriendo de manera local.

### 1. Preparando la Base de Datos y Backend

Desde la carpeta raíz del proyecto, navega a la sección del servidor y asegúrate de crear el archivo `.env` basado en la configuración necesaria:

```bash
cd server
npm install
```

Crea tu archivo de entorno `.env` en `/server` para conectar tu base de datos (puedes ajustar el usuario, la contraseña y nombre de tu base de datos):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=finanzas_db
JWT_SECRET=tu_secreto_super_seguro
PORT=3000
```

Arranca el servidor de backend localmente:

```bash
npm run start:dev
```

### 2. Configuración y Ejecución del Frontend

Abre otra terminal y navega al cliente:

```bash
cd client
npm install
npm run dev
```

La aplicación se ejecutará en el puerto 5173 por defecto. Puedes abrir `http://localhost:5173` en tu navegador.

> 📝 **Nota de Recuperación / Desarrollo**: Este proyecto fue restablecido recientemente. Actualmente el frontend se encuentra con la **autenticación superada/simulada** a través del `AuthContext` en un modo demostración (Usuario Demo). Esto te permite interactuar y revisar toda la nueva plantilla gráfica directamente sin necesidad de iniciar sesión primero.
