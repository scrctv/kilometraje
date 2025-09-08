# KM Electron App

Esta aplicación de escritorio multiplataforma (Windows y macOS) está construida con Electron y TypeScript. Permite recopilar datos introducidos por el usuario y generar un archivo DOCX (Word) rellenando automáticamente una tabla en una plantilla .docx.

## Requisitos previos
- Node.js (https://nodejs.org/) versión recomendada LTS
- npm (se instala junto con Node.js)

## Instalación inicial
1. Abre una terminal en la carpeta raíz del proyecto (`KM`).
2. Ejecuta:
   ```sh
   npm install
   ```

## Scripts principales
- `npm start`: Inicia la aplicación en modo desarrollo.
- `npm run build`: Compila la aplicación.

## Estructura básica
- `src/`: Código fuente principal (TypeScript)
- `main.ts`: Proceso principal de Electron
- `renderer.tsx`: Interfaz de usuario (React/TSX)

## Generación de archivos DOCX
Se utiliza la librería `docxtemplater` para rellenar tablas en archivos Word (.docx) a partir de los datos introducidos por el usuario.

---

Sigue las instrucciones en este archivo y pide ayuda si tienes algún problema durante la instalación o desarrollo.
