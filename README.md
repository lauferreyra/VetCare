# 🐾 VetCare

VetCare es una aplicación web desarrollada como proyecto de portfolio para una clínica veterinaria.

La primera versión del proyecto consiste en una landing page moderna, responsive y accesible, desarrollada con **Next.js, React, TypeScript y Tailwind CSS**.

El proyecto está pensado para evolucionar progresivamente hacia una aplicación Full Stack que permita gestionar usuarios, mascotas y turnos veterinarios.

## 🌐 Demo

La aplicación se encuentra desplegada en Vercel:

https://vetcare-demo-mu.vercel.app/

## 🚀 Tecnologías

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide React
* React Icons

### Formularios y validación

* React Hook Form
* Zod
* @hookform/resolvers

### Testing

* Vitest
* React Testing Library
* Testing Library User Event
* jest-dom
* jsdom

## ✨ Funcionalidades actuales

La V1 incluye:

* Landing page responsive.
* Header con navegación.
* Menú mobile interactivo.
* Hero principal.
* Sección de servicios.
* Sección sobre la veterinaria.
* Sección de beneficios.
* Formulario de contacto.
* Validaciones mediante Zod.
* Manejo del formulario mediante React Hook Form.
* Mensajes de validación.
* Confirmación visual del envío.
* Footer con navegación y redes sociales.
* Navegación mediante anchors con scroll suave.
* Diseño responsive para mobile, tablet y desktop.
* Tests de componentes e interacciones.

## 📁 Arquitectura

El proyecto utiliza Next.js con App Router.

```text
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Footer.tsx
│   │
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── About.tsx
│   │   ├── Benefits.tsx
│   │   └── Contact.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Container.tsx
│       ├── SectionTitle.tsx
│       └── ServiceCard.tsx
│
├── constants/
│   ├── navigation.ts
│   └── services.ts
│
├── schemas/
│   └── contactSchema.ts
│
├── types/
│   └── service.ts
│
└── lib/
    └── utils.ts
```

Se utilizan **Route Groups de Next.js** para separar las diferentes áreas de la aplicación.

Actualmente:

```text
(public)
```

contiene la landing pública.

La evolución del proyecto contempla:

```text
(public)
(auth)
(dashboard)
```

permitiendo que cada área tenga su propio layout.

## 🧪 Testing

Los componentes principales cuentan con tests utilizando Vitest y React Testing Library.

Entre los comportamientos testeados se encuentran:

* Renderizado de componentes.
* Renderizado de servicios.
* Navegación.
* Apertura y cierre del menú mobile.
* Interacción del usuario.
* Validaciones del formulario.
* Validación de email.
* Validación de campos obligatorios.
* Submit válido.
* Mensaje de éxito.
* Limpieza del formulario después del submit.

Para ejecutar los tests:

```bash
npm test
```

Para ejecutarlos una única vez:

```bash
npm run test:run
```

## ⚙️ Instalación

Clonar el repositorio:

```bash
git clone https://github.com/lauferreyra/VetCare.git
```

Ingresar al proyecto:

```bash
cd VetCare
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el entorno de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:3000
```

## 🏗️ Build

Generar el build de producción:

```bash
npm run build
```

Ejecutar la aplicación en modo producción:

```bash
npm run start
```

## 🔍 Lint

Ejecutar ESLint:

```bash
npm run lint
```

## ☁️ Deploy

La aplicación se encuentra desplegada utilizando Vercel.

Cada actualización de la rama principal puede generar automáticamente una nueva versión de producción.

Demo:

https://vetcare-demo-mu.vercel.app/

## 🗺️ Roadmap

VetCare está pensado como un proyecto evolutivo.

### V1 — Landing Page

* [x] Next.js
* [x] React
* [x] TypeScript
* [x] Tailwind CSS
* [x] Responsive design
* [x] React Hook Form
* [x] Zod
* [x] Vitest
* [x] React Testing Library
* [x] Deploy en Vercel

### V2 — Full Stack

Próximamente:

* [ ] Backend con NestJS
* [ ] API REST
* [ ] PostgreSQL
* [ ] Prisma ORM
* [ ] Autenticación
* [ ] JWT
* [ ] Roles y autorización
* [ ] Registro e inicio de sesión
* [ ] Gestión de usuarios
* [ ] Gestión de mascotas
* [ ] Gestión de turnos
* [ ] Dashboard
* [ ] TanStack Query
* [ ] Testing de backend
* [ ] Documentación con Swagger
* [ ] Docker

## 🎯 Objetivo

El objetivo de VetCare es aplicar buenas prácticas de desarrollo frontend y evolucionar progresivamente hacia una arquitectura Full Stack.

El proyecto busca trabajar conceptos como:

* Componentización.
* Separación de responsabilidades.
* TypeScript.
* Responsive design.
* Validación de formularios.
* Testing.
* Arquitectura frontend.
* APIs REST.
* Autenticación y autorización.
* Persistencia de datos.
* Arquitectura backend.
* Docker.
* CI/CD.

---

Desarrollado como proyecto de portfolio y aprendizaje.
