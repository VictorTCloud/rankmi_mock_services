# Tailscale: sin exposición pública

El mock escucha solo en la red del contenedor **tailscale**. Los usuarios del **tailnet** (invitados en el admin de Tailscale) acceden por **MagicDNS**, sin publicar puertos en Internet ni DNS público.

Requiere `Authorization: Bearer <MOCK_TOKEN>` en cada llamada.

## Requisitos

- Cuenta [Tailscale](https://tailscale.com/) con **MagicDNS** habilitado (Settings → DNS).
- Docker y Docker Compose en un host con `/dev/net/tun`.
- Una **auth key** para registrar el nodo (Settings → Keys).

## 1. Invitar al grupo

En [Users](https://login.tailscale.com/admin/users) invita por correo a las personas que deben probar. Solo dispositivos autenticados en el tailnet pueden alcanzar el hostname del servicio.

Opcional: **ACL** para limitar quién puede hablar con la etiqueta/host del mock (ver [ACL samples](https://tailscale.com/kb/1018/acls)).

## 2. Configuración

```bash
cd deploy/tailscale
cp .env.example .env
```

Edita `.env`:

- `MOCK_TOKEN`: secreto Bearer (compártelo solo con el grupo de prueba).
- `TS_HOSTNAME`: nombre del nodo (p. ej. `mock-seguros` → `mock-seguros.<tailnet>.ts.net` con MagicDNS).
- `TS_AUTHKEY`: clave de autenticación (reusable recomendada para servidor; marca “Ephemeral” si el nodo es desechable).

## 3. Levantar el stack

```bash
docker compose up -d --build
docker compose logs -f tailscale
```

En el [admin de máquinas](https://login.tailscale.com/admin/machines) debe aparecer el nodo con el hostname elegido.

## 4. Probar desde un dispositivo del tailnet

Instala Tailscale en el PC del integrador y asegúrate de estar logueado con una cuenta invitada.

```bash
# Sustituye el FQDN si MagicDNS usa otro sufijo (visible en el admin).
export BASE=http://mock-seguros:8080
export HDR="Authorization: Bearer <MOCK_TOKEN>"

curl -sS -H "$HDR" "$BASE/api/v1/seguros-bolivar/carga-masiva?page=1&pageSize=2" | head
```

Si MagicDNS no resuelve el nombre corto, usa la IP **Tailscale** del nodo (columna en el admin) o el FQDN completo.

## 5. HTTPS opcional en el tailnet

Por defecto el mock es HTTP en el puerto **8080**. Para HTTPS solo dentro del tailnet, en el host puedes usar [Tailscale Serve](https://tailscale.com/kb/1312/serve) después de levantar los contenedores, por ejemplo:

```bash
docker compose exec tailscale tailscale serve --bg --http=443 http://127.0.0.1:8080
```

Entonces el grupo usa `https://mock-seguros.<tailnet>.ts.net` (sin `:8080`). Ajusta según la versión de la CLI en la imagen.

## Seguridad

- No hagas `ports: "8080:8080"` en este compose: el mock no debe quedar en la NIC pública del host.
- Rota `MOCK_TOKEN` y la auth key si se filtran.
- Revoca usuarios en el admin al cerrar la prueba.

## Actualizar imagen

```bash
docker compose up -d --build mock
```
