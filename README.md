# FinFlow · Plan Finanzas Personal 💸

**FinFlow** es una aplicación web *full-stack* de gestión de finanzas personales. Está diseñada con una interfaz moderna, limpia y estéticamente atractiva (componentes premium y estilo "glassmorphism"). Su objetivo es brindarte el control total sobre tus ingresos, gastos, presupuestos y metas financieras de manera sumamente visual e intuitiva.

---

## 🌟 Características Principales

*   📊 **Dashboard Interactivo**: Resumen de tu balance neto, ingresos y gastos del mes actual, apoyado por gráficos de tendencia financiera usando la librería `Recharts`.
*   💳 **Gestión de Cuentas**: Administra múltiples carteras (efectivo, banco, cuenta de ahorros, inversiones) con asignación de tipos de divisa y saldos iniciales.
*   🧾 **Control de Transacciones**: Registra tus ingresos, gastos y transferencias, con soporte de clasificaciones por categorías (alimentación, transporte, vivienda) y cuentas asignadas.
*   🎯 **Presupuestos Inteligentes**: Establece y monitorea límites de gasto por categoría (con notificaciones y métricas de porcentaje).
*   📈 **Reportes y Analíticas**: Distribución detallada de gastos y métricas visuales para analizar a fondo en qué gastas tu dinero.
*   ✨ **Diseño Premium UI/UX**: Paleta de colores estética (fondos beige pastel, sombras suaves, acentos de color `oro` e `ink`), diseño totalmente responsivo y fuentes dedicadas (`Playfair Display`, `DM Sans`, `DM Mono`).
*   🔒 **Arquitectura Segura y Mode Template**: Autenticación integrada de JWT y encriptación `Bcrypt` del lado del servidor. *(Nota actual: La interfaz en el frontend se configuró temporalmente en "Modo Plantilla" que sobrepasa el inicio de sesión para el desarrollo y diseño visual)*.

---

## 🛠️ Stack Tecnológico

El proyecto está segmentado de forma modular, con tecnologías de punta:

### Frontend (`/client`)
*   **Core**: React (con Vite) y TypeScript.
*   **Estilos**: Tailwind CSS con diseño de clases utilitarias personalizadas, y Variables CSS para colores temáticos del sistema de diseño (FinFlow Design System).
*   **Componentes Adicionales**: `Recharts` para gráficas, `Lucide React` para iconografía moderna.
*   **Rutas**: React Router Dom.

### Backend (`/server`)
*   **Framework**: NestJS (TypeScript).
*   **Base de Datos**: PostgreSQL utilizando el ORM `TypeORM`.
*   **Seguridad**: `Passport` para estrategias de sesión, `JWT` para tokens y `Bcrypt` para hash de contraseñas de usuarios.

---

## 🚀 Instalación y Uso (Getting Started)

### Prerrequisitos
*   [Node.js](https://nodejs.org/) (versión 18+ recomendada).
*   Motor de base de datos [PostgreSQL](https://www.postgresql.org/) corriendo de manera local.

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
