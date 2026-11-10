# Mock local de Seguros Bolívar

Simula la carga inicial, la consulta individual y el alta exitosa de la integración de Magneto con Seguros Bolívar y Rankmi. Requiere Python 3.10 o posterior y usa únicamente la biblioteca estándar.

## Ejecutar en Windows

Extrae el ZIP, abre PowerShell en la carpeta extraída y ejecuta:

    python .\mock_seguros.py

El host local es http://127.0.0.1:8080. Usa esa URL base en Magneto si el consumidor corre en el mismo equipo. Envía este encabezado en los tres endpoints:

    Authorization: Bearer mock-seguros-local

Puedes cambiar el puerto y el token con --port y --token. El proceso escucha solo en el equipo local por defecto. Para consumirlo desde otro equipo, configura el host y el acceso de red del ambiente de pruebas antes de usar --host. Detén el proceso con Ctrl+C.

## Probar en otra ventana de PowerShell

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

--sample-alta también permite copiar el JSON en Postman. Los GET responden con mark y data[]. Cada registro incluye key, source y fields. El alta devuelve transaction_id, magneto_id, user_id y contract_id sin conectarse a Rankmi.

## Convenciones provisionales del mock

- La paginación empieza en 1. La carga contiene 20 perfiles ficticios, cada uno con su estructura y contrato. Los 40 registros se recorren en 20 páginas con pageSize=2. La página 21 devuelve data como lista vacía.
- Ante las diferencias de la v2.3, se usan VICEPRESIDENCIA y CentroDeCosto numérico según las tablas. CategoriaAsignacion se emite una sola vez. La llave de estructura se arma con POSITION_CODE y el mismo EMAIL_ADDRESS del registro.
- El POST acepta magneto_id como campo adicional opcional. Lo devuelve si viene en la solicitud y genera uno sintético si se omite. Las fechas se validan como cadenas yyyy-mm-dd. También se aceptan cadenas vacías en last_height_course_date y contract_end_date, como en el ejemplo.
- El token se compara con el valor de prueba configurado. El mock opera en memoria con datos sintéticos. El alta de ejemplo usa el perfil ficticio de Bogotá. Las correspondencias entre valores de prueba sirven únicamente para el mock.
- La primera entrega cubre solicitudes válidas. Los rechazos básicos con cuerpo vacío sirven para operar el mock local. Los escenarios de error del cliente y las entregas incrementales están fuera del alcance acordado.

El diccionario de campos está en schemas.json. La fuente técnica es la propuesta de contratos Seguros Bolívar · Magneto · Rankmi v2.3, secciones A, B y C.

## Contenedor y despliegue para un grupo de prueba

Imagen Docker en la raíz del repo (`Dockerfile`). Obligatorio: variable `MOCK_TOKEN` (el entrypoint la pasa como `--token`).

| Escenario | Directorio | Acceso |
|-----------|------------|--------|
| Correos corporativos + zona en Cloudflare (HTTPS, Access) | [deploy/cloudflare](deploy/cloudflare/) | Túnel nombrado + política Access; luego Bearer del mock |
| Sin exposición pública (solo tailnet) | [deploy/tailscale](deploy/tailscale/) | MagicDNS / IP Tailscale + Bearer del mock |

Guías paso a paso en cada `README.md`. Para desarrollo local sin Docker sigue siendo válido `python mock_seguros.py`.

# rankmi_mock_services
