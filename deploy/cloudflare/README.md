# Cloudflare: túnel nombrado + Access

Publica el mock en un hostname de una zona que administres en Cloudflare. **Cloudflare Access** decide quién puede abrir ese hostname (correos corporativos, grupos del IdP). El contenedor `mock` no se expone directamente a Internet; solo `cloudflared` inicia conexiones salientes hacia Cloudflare.

El mock sigue validando `Authorization: Bearer <MOCK_TOKEN>` en los tres endpoints, igual que en local.

## Requisitos

- Zona DNS en Cloudflare (p. ej. `example.com`).
- Cuenta con **Zero Trust** (plan Free sirve para Access básico).
- Docker y Docker Compose en el host del despliegue.

## 1. Variables del mock

```bash
cd deploy/cloudflare
cp .env.example .env
# Edita MOCK_TOKEN (secreto largo; compártelo solo con quien deba llamar la API).
```

## 2. Crear el túnel nombrado

En el host (con [cloudflared instalado](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) o usando un contenedor puntual):

```bash
cloudflared tunnel login
cloudflared tunnel create mock-seguros
```

Anota el **UUID** del túnel. El comando crea un archivo `*.json` de credenciales.

Copia los archivos a este directorio:

```text
deploy/cloudflare/cloudflared/
  <TUNNEL_UUID>.json          # credenciales (no commitear)
  config.yml                  # basado en config.yml.example
```

```bash
cp cloudflared/config.yml.example cloudflared/config.yml
# Edita tunnel, credentials-file y hostname (p. ej. mock-seguros.example.com).
```

En el dashboard de Cloudflare (**DNS** de tu zona), crea un registro **CNAME**:

| Tipo  | Nombre        | Contenido                         |
|-------|---------------|-----------------------------------|
| CNAME | mock-seguros  | `<TUNNEL_UUID>.cfargotunnel.com` |

(O usa **Zero Trust → Networks → Tunnels → Public Hostname** para crear hostname + DNS en un paso.)

## 3. Cloudflare Access (grupo con correos corporativos)

1. **Zero Trust → Access → Applications → Add an application**.
2. Tipo **Self-hosted**.
3. **Application domain**: el mismo hostname del `ingress` (p. ej. `mock-seguros.example.com`).
4. **Policies → Add a policy**:
   - Action: **Allow**
   - Include: **Emails** (lista) o **Emails ending in** `@tuempresa.com`, o un grupo del **Login method** (Google Workspace, Azure AD, etc.).
5. Guarda. Los usuarios verán el login de Cloudflare antes de que la petición llegue al mock.

Opcional: en **Settings** del túnel o Access, ajusta sesión (duración) y MFA según política interna.

## 4. Levantar el stack

Desde `deploy/cloudflare`:

```bash
docker compose up -d --build
docker compose logs -f cloudflared
```

Prueba (tras pasar Access en el navegador o con [service token](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/) para clientes automatizados):

```bash
export BASE=https://mock-seguros.example.com
export HDR="Authorization: Bearer $(grep MOCK_TOKEN .env | cut -d= -f2-)"

curl -sS -H "$HDR" "$BASE/api/v1/seguros-bolivar/carga-masiva?page=1&pageSize=2" | head
```

Magneto y pruebas manuales usan `BASE` + el mismo header que en el README principal.

## 5. Service tokens (API sin navegador)

Si el consumidor es un servicio (sin login interactivo de Access):

1. **Access → Service Auth → Service Tokens** → crear token.
2. En la política de la aplicación, añade **Include → Service Token**.
3. El cliente envía `CF-Access-Client-Id` y `CF-Access-Client-Secret` además del `Authorization: Bearer` del mock.

## Archivos sensibles

No subas a git:

- `deploy/cloudflare/.env`
- `deploy/cloudflare/cloudflared/*.json`
- `deploy/cloudflare/cloudflared/config.yml` (si incluye datos internos; el ejemplo sí puede versionarse)

## Actualizar imagen

```bash
docker compose up -d --build mock
```
