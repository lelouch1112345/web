# Chess Local Dashboard

Este repositorio contiene dos piezas coordinadas:

1. **`chess-local-backend`**: API Express modular que expone los endpoints `/ping`, `/analysis` y `/coach`.
2. **`chess-local-extension`**: extensión estilo dashboard que consume el backend y muestra la información en un panel con pestañas.

## Requisitos

- Node.js 18+ y npm.
- (Opcional) Google Chrome o cualquier navegador basado en Chromium para cargar la extensión.

## Backend (`chess-local-backend`)

### Instalación

```bash
cd chess-local-backend
npm install
```

### Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor con `nodemon` en `http://localhost:4000`. |
| `npm run lint` | Ejecuta ESLint sobre todo el código fuente. |
| `npm test` | Corre las pruebas con Jest + Supertest. |

### Endpoints

- `GET /api/ping`: devuelve `status`, `uptime` y `timestamp` del proceso.
- `GET /api/analysis`: entrega un payload detallado basado en `src/data/analysis.json` (varias partidas, líneas y recomendaciones).
- `POST /api/coach`: valida `question`, `fen` y `pgn`; responde con planes, tips y un resumen contextual.

El backend usa middlewares de seguridad (`helmet`), CORS abierto, logging (`morgan` + logger JSON propio) y validaciones ligeras de FEN/PGN.

### Ejecutar pruebas

```bash
cd chess-local-backend
npm test
```

## Extensión (`chess-local-extension`)

### Características

- Panel flotante con pestañas **Ping**, **Análisis** y **Coach**.
- Estados de carga, error y rendering incremental.
- Reintentos automáticos al consumir el backend y recordatorio de la pestaña activa usando `chrome.storage`.

### Carga en Chrome

1. Ejecuta el backend (`npm run dev`) para que los `fetch` apunten a `http://localhost:4000`.
2. Abre `chrome://extensions`, activa **Developer mode** y pulsa **Load unpacked**.
3. Selecciona la carpeta `chess-local-extension/`.
4. Navega a cualquier página; el panel aparecerá anclado abajo a la derecha.

### Flujos de prueba sugeridos

1. **Ping**: pulsa “Actualizar Ping” y revisa el uptime y el timestamp.
2. **Análisis**: “Cargar análisis” mostrará varias partidas con métricas y recomendaciones.
3. **Coach**: completa los campos (pregunta, FEN y PGN) y envía el formulario; debería mostrar heurísticas y tips.

Si el backend no está disponible, el panel mostrará estados de error y realizará reintentos automáticos.

## Estructura de carpetas

```
chess-local-backend/
  src/
    routes/
    services/
    utils/
    data/analysis.json
  tests/
chess-local-extension/
  content.js
  styles/panel.css
  icons/
```
