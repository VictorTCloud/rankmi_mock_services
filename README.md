# rankmi_mock_services

Mock HTTP de la integración **Seguros Bolívar · Magneto · Rankmi** (NestJS). Simula carga masiva paginada, consulta por llave y alta de persona. Requiere **Node.js 20+**.

Al abrir la raíz del servicio (`/`) se muestra **Swagger UI** con la documentación interactiva y los endpoints de prueba.

Contrato de campos en `schemas.json`. Datos sintéticos precalculados en `src/mock/records.generated.json`.

## Variables de entorno

| Variable | Default local | Descripción |
|----------|---------------|-------------|
| `MOCK_TOKEN` | `mock-seguros-local` | Secreto del header `Authorization: Bearer …` |
| `MOCK_HOST` | `127.0.0.1` | Interfaz de escucha (`0.0.0.0` en Render) |
| `PORT` / `MOCK_PORT` | `8080` | Puerto (`PORT` lo inyecta Render) |

## Ejecutar en local

```bash
npm ci
npm run start:dev
```

- **Swagger:** http://127.0.0.1:8080/
- **Health:** http://127.0.0.1:8080/health
- **Bearer** en los tres endpoints de negocio: `Authorization: Bearer mock-seguros-local` (o el valor de `MOCK_TOKEN`)

JSON de ejemplo para alta:

```bash
npm run sample-alta
```

## Endpoints

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/` | No — documentación Swagger |
| GET | `/health` | No |
| GET | `/api/v1/seguros-bolivar/carga-masiva` | Bearer |
| GET | `/api/v1/seguros-bolivar/registro` | Bearer |
| POST | `/maestro-personas/api/v1/altas` | Bearer + `application/json` |

Los errores **400**, **401** y **404** de la API mock se devuelven sin cuerpo JSON (comportamiento del mock original).

## Desplegar en Render

[`render.yaml`](render.yaml): **New → Blueprint** o Web Service Node con:

| Campo | Valor |
|-------|--------|
| Build | `npm ci && npm run build` |
| Start | `npm run start:prod` |
| Health check | `/health` |
| `MOCK_HOST` | `0.0.0.0` |
| `MOCK_TOKEN` | Secreto (Blueprint: `generateValue: true`) |

URL pública: `https://<servicio>.onrender.com/` (Swagger) y mismos paths de API bajo el mismo host.

## Convenciones del mock

- 20 perfiles ficticios → 40 registros en carga (estructura + contrato). Paginación desde `page=1`; con `pageSize=2`, la página 21 devuelve `data: []`.
- POST de alta valida el cuerpo contra `schemas.json` → `alta`; `magneto_id` opcional.
- Alcance: solicitudes válidas; escenarios de error del cliente fuera de alcance.
