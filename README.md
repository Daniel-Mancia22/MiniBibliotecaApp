# 📚 Mini Biblioteca Digital App 
Este proyecto es una aplicación móvil desarrollada en React Native con Expo SDK 54 que implementa un sistema completo de gestión de biblioteca digital. La aplicación permite a los usuarios registrarse, explorar libros, gestionar favoritos, mantener una lista de lecturas pendientes y consultar un chatbot inteligente para recomendaciones.

## 🛠 Tecnologías Utilizadas

- **Expo SDK 54** - Framework para desarrollo móvil
- **React Navigation** - Navegación (Tabs + Stacks)
- **@expo/vector-icons** - Iconografía consistente
- **AsyncStorage** - Almacenamiento local persistente
- **Firebase Firestore** - Base de datos en tiempo real
- **API Groq** - Servicios de inteligencia artificial

## 🎯Funcionalidades

### 🔐 Sistema de Registro

- **Formulario de registro validado con campos:** Nombre, email y contraseña
- **Almacenamiento:** Seguro en Firebase Firestore
- **Persistencia:** Local del ID de usuario con AsyncStorage
- **Navegación:** Automática al dashboard principal después del registro

### 📚 Gestión de Libros

- **Explorar Biblioteca:** Lista completa de libros desde la colección global libros_demo
- **Detalles Completos:** Visualización de imagen grande, título, autor y descripción
- **Acciones Rápidas:** Agregar a favoritos o marcar como pendiente directamente desde el detalle

#### ❤️ Sistema de Favoritos

- Colección personalizada Daniel_Mancia-favoritos
- Visualización de miniaturas, títulos y autores
- Funcionalidad de eliminación de favoritos
- Sistema de valoración con campos recomendado y rating

### 📋 Lista de Pendientes

- Colección personalizada Daniel_Mancia-pendientes
- Seguimiento del estado de lectura: pendiente ↔ leído
- Interfaz intuitiva para cambiar estados y eliminar libros

### 🤖 Chatbot Inteligente

- Integración con API de Groq para recomendaciones de libros
- Historial de conversaciones persistente en Firestore (chat_Daniel_Mancia)
- Mantenimiento de contexto entre mensajes
- Interfaz de chat moderna y responsive

## 🎨 Características de Diseño

- Interfaz intuitiva con navegación fluida
- Iconos cohesivos usando @expo/vector-icons
- Estilos responsivos para diferentes dispositivos
- Feedback visual inmediato para todas las acciones
- Alertas informativas para confirmaciones y datos de usuario

## 🔧 Configuración e Instalación

**Prerrequisitos:**
- Node.js y npm instalados
- Expo CLI
- Cuenta de Firebase
- API Key de Groq

**Pasos de Ejecución:**

1. Instalar dependencias
   
       npm install
2. Configurar variables de entorno
    - Firebase configuration & Groq API key

3. Ejecutar la aplicación

       npx expo start

## 👨🏽‍💻 Desarrollador
- [Daniel Mancia](https://github.com/Daniel-Mancia22) - DevMadCode

## 📄 Notas
Este proyecto fue desarrollado con fines académicos, aún se pueden mejorar los diseños y funcionalidades. Espero en un futuro cercano hacerle una actualización.
