# rankmi_mock_services

Mock HTTP de la integración **Seguros Bolívar · Magneto · Rankmi**: carga masiva paginada, consulta por llave y alta de persona. Requiere **Python 3.10+** y solo la biblioteca estándar (`requirements.txt` existe para el runtime de Render).

Datos sintéticos en memoria; el contrato de campos está en `schemas.json`. Referencia técnica: propuesta de contratos v2.3, secciones A, B y C.

## Ejecutar en local

```bash
python mock_seguros.py
```

Por defecto escucha en `http://127.0.0.1:8080`. En los **tres endpoints de negocio** envía:

```http
Authorization: Bearer mock-seguros-local
```

| Parámetro | CLI | Variable de entorno | Default local |
|-----------|-----|---------------------|---------------|
| Host | `--host` | `MOCK_HOST` | `127.0.0.1` |
| Puerto | `--port` | `PORT` o `MOCK_PORT` | `8080` |
| Token | `--token` | `MOCK_TOKEN` | `mock-seguros-local` |

En local el proceso solo escucha en loopback salvo que pases `--host 0.0.0.0` o `MOCK_HOST=0.0.0.0`. Detén con Ctrl+C.

Para imprimir un JSON de alta válido (Postman, pruebas) sin levantar el servidor:

```bash
python mock_seguros.py --sample-alta
```

### Windows (PowerShell)

```powershell
$base = 'http://127.0.0.1:8080'
$headers = @{ Authorization = 'Bearer mock-seguros-local' }

$carga = Invoke-RestMethod "$base/api/v1/seguros-bolivar/carga-masiva?page=1&pageSize=2" -Headers $headers
$carga | ConvertTo-Json -Depth 10

$tipos = @('estructura', 'contrato')
for ($i = 0; $i -lt $tipos.Count; $i++) {
    $tipo = $tipos[$i]
    $llave = [uri]::EscapeDataString($carga.data[$i].key)
    Invoke-RestMethod "$base/api/v1/seguros-bolivar/registro?type=$tipo&key=$llave" -Headers $headers |
        ConvertTo-Json -Depth 10
}

$alta = (python .\mock_seguros.py --sample-alta) -join [Environment]::NewLine
Invoke-RestMethod "$base/maestro-personas/api/v1/altas" -Method Post -Headers $headers -ContentType 'application/json' -Body $alta
```

### Linux / macOS (curl)

```bash
BASE=http://127.0.0.1:8080
AUTH="Authorization: Bearer mock-seguros-local"

curl -sS -H "$AUTH" "$BASE/api/v1/seguros-bolivar/carga-masiva?page=1&pageSize=2"
curl -sS "$BASE/health"
```

## Endpoints

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/health` | No (health check; p. ej. Render) |
| GET | `/api/v1/seguros-bolivar/carga-masiva?page=&pageSize=` | Bearer |
| GET | `/api/v1/seguros-bolivar/registro?type=&key=` | Bearer |
| POST | `/maestro-personas/api/v1/altas` | Bearer (`application/json`) |

Los GET responden con `mark` y `data[]` (cada ítem: `key`, `source`, `fields`). El alta responde `transaction_id`, `magneto_id`, `user_id` y `contract_id` sin llamar a Rankmi.

## Convenciones del mock

- La paginación empieza en 1. Hay 20 perfiles ficticios (estructura + contrato cada uno → 40 registros en la carga). Con `pageSize=2` hay 20 páginas; la página 21 devuelve `data` vacía.
- Se usan `VICEPRESIDENCIA` y `CentroDeCosto` numérico según las tablas v2.3. `CategoriaAsignacion` se emite una sola vez. La llave de estructura combina `POSITION_CODE` y `EMAIL_ADDRESS`.
- El POST acepta `magneto_id` opcional; si falta, se genera uno sintético. Fechas en formato `yyyy-mm-dd`; `last_height_course_date` y `contract_end_date` pueden ir vacíos.
- Alcance acordado: solicitudes válidas y rechazos básicos; escenarios de error del cliente fuera de alcance.

## Desplegar en Render

Archivo [`render.yaml`](render.yaml) en la raíz: **New → Blueprint** en [Render](https://render.com) y conecta el repo, o crea un **Web Service** manual con la misma configuración.

| Campo | Valor |
|-------|--------|
| Build | `pip install -r requirements.txt` |
| Start | `python mock_seguros.py` |
| Health check | `/health` |
| `MOCK_HOST` | `0.0.0.0` |
| `MOCK_TOKEN` | Secreto largo (el Blueprint puede generarlo con `generateValue: true`) |

Render inyecta `PORT`; no hace falta definirlo. Tras el deploy, la base URL es `https://<nombre-del-servicio>.onrender.com` con el mismo Bearer en los tres endpoints de negocio.

```bash
BASE="https://<tu-servicio>.onrender.com"
curl -sS "$BASE/health"
curl -sS -H "Authorization: Bearer <MOCK_TOKEN>" \
  "$BASE/api/v1/seguros-bolivar/carga-masiva?page=1&pageSize=2"
```

En el plan **free** el servicio puede dormir por inactividad (cold start en la primera petición). La URL es pública: usa un token fuerte y compártelo solo con el grupo de prueba.
