# Tailscale en el host (sin Docker, sin URL pública)

El mock corre con Python en el servidor. Solo dispositivos del **tailnet** (cuentas invitadas en Tailscale) alcanzan la API por MagicDNS o IP Tailscale. No hace falta Cloudflare, túnel ni abrir puertos en el router.

Sigue exigiendo `Authorization: Bearer <MOCK_TOKEN>` en los tres endpoints.

## Variables de entorno

Copia el ejemplo y edita:

```bash
cd deploy/tailscale-native
cp .env.example .env
```

| Variable | Obligatoria | Quién la usa | Descripción |
|----------|-------------|--------------|-------------|
| `MOCK_TOKEN` | **Sí** | `run.sh` → mock | Secreto del header `Authorization: Bearer …`. Compártelo solo con el grupo de prueba. |
| `MOCK_HOST` | No (default `0.0.0.0`) | `run.sh` | Interfaz de escucha. Debe ser `0.0.0.0` para que otros nodos del tailnet conecten al puerto del mock. |
| `MOCK_PORT` | No (default `8080`) | `run.sh`, `serve-tailscale.sh` | Puerto HTTP del mock. |
| `TS_AUTHKEY` | No | `setup-tailscale.sh` | Auth key del [admin](https://login.tailscale.com/admin/settings/keys). Para registrar el servidor sin login en navegador. |
| `TS_HOSTNAME` | Recomendada | `setup-tailscale.sh` | Nombre del nodo (p. ej. `mock-seguros` → `mock-seguros.<tailnet>.ts.net` con MagicDNS). |
| `TAILSCALE_SERVE_PORT` | No (default `443`) | `serve-tailscale.sh` | Puerto HTTPS **solo dentro del tailnet** al usar `tailscale serve`. |

Tailscale en sí no lee un `.env` propio; las variables `TS_*` y `TAILSCALE_*` son convención de este directorio para los scripts.

## Requisitos

- Python 3.10+ en el servidor (mismo repo con `mock_seguros.py` y `schemas.json`).
- [Tailscale](https://tailscale.com/download) en el servidor y en cada integrador.
- **MagicDNS** activado: [Admin → DNS](https://login.tailscale.com/admin/dns).
- Usuarios de prueba invitados en [Users](https://login.tailscale.com/admin/users).

## 1. Unir el servidor al tailnet

```bash
chmod +x deploy/tailscale-native/*.sh
./deploy/tailscale-native/setup-tailscale.sh
```

Con `.env` configurado usa `TS_AUTHKEY` y `TS_HOSTNAME`. Sin auth key, el script ejecuta `tailscale up` interactivo.

## 2. Levantar el mock

```bash
./deploy/tailscale-native/run.sh
```

Deja el proceso en foreground (systemd o `tmux` si quieres daemon). El mock no debe quedar expuesto en la NIC pública del host más allá de lo que permita tu firewall; el acceso previsto es vía IP/hostname Tailscale.

## 3. Probar desde un dispositivo del tailnet

Con MagicDNS y `TS_HOSTNAME=mock-seguros`:

```bash
export MOCK_TOKEN='<el mismo valor que en .env>'
export BASE="http://mock-seguros:${MOCK_PORT:-8080}"
export HDR="Authorization: Bearer ${MOCK_TOKEN}"

curl -sS -H "$HDR" "$BASE/api/v1/seguros-bolivar/carga-masiva?page=1&pageSize=2" | head
```

Si el nombre corto no resuelve, usa la columna **Tailscale IP** del nodo en [Machines](https://login.tailscale.com/admin/machines) o el FQDN completo.

## 4. HTTPS opcional (solo tailnet)

Con el mock ya corriendo en el puerto configurado en `MOCK_PORT`:

```bash
./deploy/tailscale-native/serve-tailscale.sh
```

Los clientes pueden usar `https://mock-seguros.<tailnet>.ts.net` (sin `:8080`) más el mismo Bearer del mock.

Quitar el serve:

```bash
sudo tailscale serve reset
```

## Seguridad

- No hagas port-forward del 8080 en el router para este escenario.
- Rota `MOCK_TOKEN` si se filtra; revoca usuarios en el admin al cerrar la prueba.
- Opcional: [ACL](https://tailscale.com/kb/1018/acls) para limitar qué usuarios pueden llegar al servidor mock.

## Archivos sensibles

No subas a git: `deploy/tailscale-native/.env` (listado en `.gitignore`).
