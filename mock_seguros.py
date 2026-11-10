"""Mock local de Seguros Bolívar, Magneto y Rankmi."""
import argparse
import json
import math
import re
from datetime import date
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from secrets import compare_digest
from unicodedata import normalize
from urllib.parse import parse_qs, urlsplit
from uuid import uuid4

BASE = "/api/v1/seguros-bolivar"
ALTA = "/maestro-personas/api/v1/altas"
SCHEMAS = json.loads(Path(__file__).with_name("schemas.json").read_text(encoding="utf-8"))
SOURCES = {
    "estructura": "DATOS_ESTRUCTURA_ATS.xlsx",
    "contrato": "GB_DATOS_DE_CONTRATO_ATS_2026_10_05.txt",
}
EMPTY_DATES = {"last_height_course_date", "contract_end_date"}


def profiles():
    initial = (
        dict(
            names=("Valentina", "Isabel", "Rojas", "Beltrán"), city="Bogotá D.C.",
            department="Operaciones de Siniestros", role="Analista de Siniestros",
            division="Operaciones", family="Gestión de Siniestros", salary=3850000,
            start="2026-03-02", end="2027-03-01", birth="1994-06-18", issued="2012-07-03",
            sex="FEMENINO", degree="Administración de Empresas", postal="110231",
            boss="Catalina Duarte Acosta", boss_role="Coordinadora de Siniestros",
            contact="Andrés Rojas Beltrán", relation="HERMANO", blood="O+",
            status="SOLTERA", address="Calle 63 # 13-42", branch="Bogotá Centro",
        ),
        dict(
            names=("Mateo", "Andrés", "Salazar", "Mejía"), city="Medellín",
            department="Servicio al Cliente", role="Asesor de Servicio al Cliente",
            division="Experiencia del Cliente", family="Atención al Cliente", salary=2750000,
            start="2026-05-04", end="2027-05-03", birth="1997-02-12", issued="2015-03-10",
            sex="MASCULINO", degree="Tecnología en Gestión Comercial", postal="050021",
            boss="Laura Restrepo Castaño", boss_role="Coordinadora de Servicio",
            contact="Claudia Mejía Torres", relation="MADRE", blood="A+",
            status="CASADO", address="Carrera 43A # 16-52", branch="Medellín Sur",
        ),
    )
    locations = (
        ("Bogotá D.C.", "11001", "Bogotá Centro", "BOG-01", "110231"),
        ("Medellín", "05001", "Medellín Sur", "MED-02", "050021"),
        ("Cali", "76001", "Cali Norte", "CLO-01", "760046"),
        ("Barranquilla", "08001", "Barranquilla Centro", "BAQ-01", "080003"),
        ("Bucaramanga", "68001", "Bucaramanga Centro", "BGA-01", "680003"),
        ("Pereira", "66001", "Pereira Centro", "PEI-01", "660003"),
    )
    roles = (
        ("Suscripción", "Analista de Suscripción", "Operaciones", "Gestión de Pólizas", 4200000, "Coordinación de Suscripción", "Administración Financiera"),
        ("Cartera y Recaudo", "Auxiliar de Cartera", "Finanzas", "Gestión Financiera", 2450000, "Coordinación de Cartera", "Tecnología en Contabilidad"),
        ("Operaciones de Siniestros", "Gestor de Indemnizaciones", "Operaciones", "Gestión de Siniestros", 3500000, "Coordinación de Siniestros", "Administración de Empresas"),
        ("Servicio al Cliente", "Asesor de Servicio al Cliente", "Experiencia del Cliente", "Atención al Cliente", 2800000, "Coordinación de Servicio", "Tecnología en Gestión Comercial"),
        ("Riesgo y Cumplimiento", "Analista de Riesgos", "Riesgos", "Gestión de Riesgos", 4800000, "Coordinación de Riesgos", "Economía"),
        ("Canales Comerciales", "Ejecutivo Comercial de Seguros", "Comercial", "Gestión Comercial", 3900000, "Coordinación Comercial", "Mercadeo"),
    )
    people = (
        ("Lucía", "Elena", "Mora", "Vega"),
        ("Julián", "David", "Pardo", "Navas"),
        ("Camila", "Andrea", "Ortiz", "Lara"),
        ("Tomás", "Felipe", "León", "Ruiz"),
        ("Daniela", "Paola", "Prieto", "Reyes"),
        ("Samuel", "Esteban", "Luna", "Gil"),
        ("Mariana", "Sofía", "Vargas", "Ríos"),
        ("Nicolás", "Alejandro", "Arias", "Mena"),
        ("Laura", "Beatriz", "Peña", "Acuña"),
        ("Gabriel", "Antonio", "Vera", "Paz"),
        ("Sara", "Juliana", "Solano", "Marín"),
        ("Felipe", "Javier", "Díaz", "Peralta"),
        ("Elena", "Victoria", "Vidal", "Serna"),
        ("Andrés", "Felipe", "Orozco", "Lozano"),
        ("Adriana", "Patricia", "Soto", "Duarte"),
        ("Diego", "Alejandro", "Ibarra", "Cano"),
        ("Natalia", "Inés", "Torres", "Rico"),
        ("Sebastián", "José", "Sierra", "Vivas"),
    )
    additional = []
    for i, names in enumerate(people):
        city, city_code, branch, branch_code, postal = locations[i % len(locations)]
        department, role, division, family, salary, boss_role, degree = roles[(i + i // 6) % len(roles)]
        is_woman = i % 2 == 0
        month = 2 + i % 8
        day = 3 + i % 15
        year = 1988 + i % 13
        additional.append(dict(
            names=names, city=city, city_code=city_code, branch=branch, branch_code=branch_code,
            postal=postal, department=department, role=role, division=division, family=family,
            salary=salary, boss_role=boss_role, degree=degree, start=f"2026-{month:02d}-{day:02d}",
            end=f"2027-{month:02d}-{day - 1:02d}", birth=f"{year}-01-19", issued=f"{year + 18}-02-11",
            sex="FEMENINO" if is_woman else "MASCULINO", boss="Alejandra Cifuentes Ríos",
            contact=f"Mónica {names[2]} {names[3]}", relation="HERMANA", blood=("O+", "A+", "B+")[i % 3],
            status="SOLTERA" if is_woman else "SOLTERO", address=f"Calle {20 + i} # {12 + i}-35",
            training=f"2026-{month:02d}-{day + 2:02d}",
            absence_start="2026-10-26", absence_end="2026-10-30",
        ))
    return initial + tuple(additional)


def make_alta(profile, index):
    first, second, last, second_last = profile["names"]
    email_name = normalize("NFKD", f"{first}.{last}".lower()).encode("ascii", "ignore").decode("ascii")
    return dict(
        magneto_id=f"MAG-{1000 + index}", work_city=profile["city"], position_id=100 + index,
        job_id=200 + index, area_id=300 + index, salary_type="FIJO",
        monthly_salary_amount=profile["salary"], contract_type="TERMINO_FIJO",
        contract_start_date=profile["start"], work_schedule="COMPLETA",
        salary_definition="FIJO", collective_agreement="", height_course="S",
        last_height_course_date=profile.get("training", "2026-06-12" if index == 1 else "2026-07-17"),
        contract_end_date=profile["end"], identification_type="CC",
        identification_number=str(9900000000 + index), identification_issued_at=profile["issued"],
        identification_issued_city=profile["city"], first_name=first, second_name=second,
        last_name=last, second_last_name=second_last, nationality="COLOMBIANA",
        birthday=profile["birth"], personal_email=f"{email_name}@example.invalid",
        phone=f"+57 300 000 {100 + index:04d}", phone_2=f"+57 310 000 {100 + index:04d}",
        marital_status=profile["status"], sex=profile["sex"], address_city=profile["city"],
        address=profile["address"], address_2="Apartamento 302" if index == 1 else "Interior 2",
        postal_code=profile["postal"], blood_type=profile["blood"], allergies="NINGUNA REPORTADA",
        academic_level="PROFESIONAL" if index == 1 else "TECNOLÓGICO", career=profile["degree"],
        main_language="es", disability=False, disability_type="", disability_certified="N",
        emergency_contacts_name=profile["contact"], emergency_contacts_phone=f"+57 320 000 {100 + index:04d}",
        emergency_contacts_relationship=profile["relation"],
    )


def make_records():
    rows = []
    for index, profile in enumerate(profiles(), 1):
        alta = make_alta(profile, index)
        name = " ".join(profile["names"])
        city = profile["city"]
        city_code = profile.get("city_code", "11001" if index == 1 else "05001")
        branch_code = profile.get("branch_code", "BOG-01" if index == 1 else "MED-02")
        code = f"POS-{100 + index:04d}"
        job = f"CAR-{200 + index:04d}"
        dept = f"DEP-{300 + index:03d}"
        cost_center = 4100 + index
        identifier = alta["identification_number"]
        email = alta["personal_email"].replace("@example.invalid", "@seguros.example.invalid")
        structure = dict(
            COUNTRY_CODE="CO", COUNTRY="Colombia", BUSINESS_UNIT_SET_CODE="SEG-CO",
            BUSINESS_UNIT_NAME="Seguros Colombia", DEPARTAMENT_CODE=dept,
            DEPARTAMENT_NAME=profile["department"], COST_CENTER_ID=cost_center,
            COST_CENTER_NAME=profile["department"], JOB_FAMILY_NAME=profile["family"],
            JOB_CODE=job, JOB_NAME=profile["role"], POSITION_CODE=code, POSITION_NAME=profile["role"],
            VICEPRESIDENCIA=profile["division"], SUCURSAL=profile["branch"],
            GRADO_SISTEMA="11" if index == 1 else "8", FULL_NAME=name,
            NATIONAL_IDENTIFIER_NUMBER=identifier, EMAIL_ADDRESS=email,
        )
        if index % 2 == 1:
            structure.update(
                BUSINESS_UNIT_ID=10, DEPARTAMENT_ID=alta["area_id"], JOB_FAMILY_ID=str(11 + index),
                JOB_FAMILY_CODE=f"FAM-{index:02d}", JOB_ID=alta["job_id"], POSITION_ID=alta["position_id"],
                CODIGO_SUCURSAL=branch_code,
            )
        contract = dict(
            CodigoEmpresa="SEG01", EntidadLegal="Compañía de Seguros Horizonte S.A. (ficticia)",
            CodigoDepartamento=dept, NombreDepartamento=profile["department"],
            CentroDeCosto=cost_center, NombreCentroDeCosto=profile["department"],
            CodigoPuesto=job, NombrePuesto=profile["role"], CodigoPosicion=code,
            NombrePosicion=profile["role"], Vicepresidencia=profile["division"],
            NombreSucursal=profile["branch"], NombreCompletoJefe=profile["boss"],
            IdentificadorNacionalJefe=str(9900000100 + index), IdentificadorNacional=identifier,
            TipoIdentificadorNacional="CC", PrimerNombre=alta["first_name"],
            SegundoNombre=alta["second_name"], PrimerApellido=alta["last_name"],
            SegundoApellido=alta["second_last_name"], NombreCompleto=name,
            NombreUbicacion=profile["branch"], NombreCiudadTrabajo=city,
            CodigoCargoJefe=f"CAR-{500 + index:04d}", NombreCargoJefe=profile["boss_role"],
            NombreUbicacionJefe=profile["branch"], CodigoCentroDeCostoJefe=str(cost_center),
            NombreCentroDeCostoJefe=profile["department"], TipoIdCompania="NIT",
            NumeroIdCompania=900000001, NumeroPersona=f"P-{1000 + index:06d}",
            FechaIngreso=profile["start"], FechaFinContrato=profile["end"],
            FechaTerminacion=profile["end"], Estado=True,
            FechaInicioAusencia=profile.get("absence_start", "2026-09-07" if index == 1 else "2026-10-05"),
            FechaFinAusencia=profile.get("absence_end", "2026-09-11" if index == 1 else "2026-10-09"),
            FechaRegistro=profile["start"], UsuarioRegistro="gestion.personas",
            CategoriaAsignacion="TIEMPO COMPLETO", TelefonoLaboral=f"+57 601 000 {200 + index:04d}",
            PersonaNatural="S", CodigoTipoContrato="TERMINO_FIJO",
            DescripcionTipoContrato="Término fijo", SystemPersonType="EMP",
            Genero=profile["sex"], ContratoPrincipal=True, EmailCorporativo=email,
            NombrePrimerContacto=profile["contact"], TelefonoContacto=alta["emergency_contacts_phone"],
            CursoAltura=alta["height_course"], FechaUltimoCurso=alta["last_height_course_date"],
            GrupoSanguineo=profile["blood"], FechaNacimiento=profile["birth"],
            NivelAcademico=alta["academic_level"], weekly_hours="42",
        )
        for field in (
            "identification_issued_at", "identification_issued_city", "nationality", "phone_2",
            "marital_status", "address_city", "address", "postal_code", "allergies", "career",
            "main_language", "disability", "disability_type", "emergency_contacts_relationship",
            "salary_type", "monthly_salary_amount", "work_schedule", "salary_definition",
            "collective_agreement",
        ):
            contract[field] = alta[field]
        contract["disability_certified"] = False
        if index % 2 == 1:
            contract.update({
                "CodigoSucursal": branch_code, "CodigoUbicación": branch_code,
                "CodigoCiudadTrabajo": city_code, "CodigoUbicacionJefe": branch_code,
                "CodigoSucursalJefe": branch_code, "NombreSucursalJefe": profile["branch"],
                "TipoAusencia": "VACACIONES", "DireccionUbicacion": f"Calle {70 + index} # 10-34",
                "Extension": str(2400 + index), "PersonTypeCode": "EMP", "CiudadUbicacion": city,
                "CódigoUbicacionNivel1": branch_code, "NombreUbicacionNivel1": profile["branch"],
                "IdentificadorNacionalNivel1": contract["IdentificadorNacionalJefe"],
                "NombreJefeNivel1": profile["boss"], "TipodeJefe": "DIRECTO",
            })
        for kind, key, fields in [
            ("estructura", f"{code}-{email}", structure), ("contrato", identifier, contract)
        ]:
            rows.append((kind, {"key": key, "source": SOURCES[kind], "fields": fields}))
    return rows



def matches_kind(value, kind):
    if kind == "string":
        return isinstance(value, str)
    if kind == "number":
        return type(value) is int or (type(value) is float and math.isfinite(value))
    if kind == "boolean":
        return type(value) is bool
    if not isinstance(value, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value):
        return False
    try:
        date.fromisoformat(value)
    except ValueError:
        return False
    return True


def valid_alta(body):
    if not isinstance(body, dict):
        return False
    schema = SCHEMAS["alta"]
    if body.keys() - (schema.keys() | {"magneto_id"}):
        return False
    if "magneto_id" in body and not isinstance(body["magneto_id"], str):
        return False
    for field, (kind, required) in schema.items():
        if field not in body:
            if required:
                return False
        elif not (field in EMPTY_DATES and body[field] == "") and not matches_kind(body[field], kind):
            return False
    return True


def sample_alta():
    return make_alta(profiles()[0], 1)


def json_object(pairs):
    result = dict(pairs)
    if len(result) != len(pairs):
        raise ValueError("Clave JSON repetida")
    return result


class MockHandler(BaseHTTPRequestHandler):
    def reply(self, status, body=None):
        payload = b"" if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        if body is not None:
            self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if payload:
            self.wfile.write(payload)

    def authorized(self):
        given = self.headers.get("Authorization", "").encode("utf-8")
        if compare_digest(given, self.server.bearer):
            return True
        self.reply(401)
        return False

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path not in {f"{BASE}/carga-masiva", f"{BASE}/registro"}:
            self.reply(404)
            return
        if not self.authorized():
            return
        query = parse_qs(url.query, keep_blank_values=True)
        if url.path.endswith("/carga-masiva"):
            self.load_page(query)
        else:
            self.lookup(query)

    def load_page(self, query):
        try:
            page_text, = query["page"]
            size_text, = query["pageSize"]
            page, size = int(page_text), int(size_text)
            if min(page, size) < 1:
                raise ValueError
        except (KeyError, ValueError):
            self.reply(400)
            return
        start = (page - 1) * size
        rows = [record for _, record in self.server.records[start : start + size]]
        self.reply(200, {"mark": "SEGUROS", "data": rows})

    def lookup(self, query):
        types, keys = query.get("type", []), query.get("key", [])
        if len(types) != 1 or types[0] not in SOURCES or len(keys) != 1 or not keys[0]:
            self.reply(400)
            return
        record = self.server.index.get((types[0], keys[0]))
        if record is None:
            self.reply(404)
            return
        self.reply(200, {"mark": "SEGUROS", "data": [record]})

    def do_POST(self):
        if urlsplit(self.path).path != ALTA:
            self.reply(404)
            return
        if not self.authorized():
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if self.headers.get_content_type() != "application/json" or not 0 < length <= 65536:
                raise ValueError
            body = json.loads(self.rfile.read(length), object_pairs_hook=json_object)
        except (ValueError, RecursionError):
            self.reply(400)
            return
        if not valid_alta(body):
            self.reply(400)
            return
        transaction = str(uuid4())
        self.reply(200, {
            "transaction_id": transaction,
            "magneto_id": body.get("magneto_id", f"MAG-MOCK-{transaction}"),
            "user_id": f"USER-MOCK-{transaction}",
            "contract_id": f"CONTRACT-MOCK-{transaction}",
        })

    def log_message(self, format_string, *args):
        # Do not log tokens, payloads, or query parameters.
        return


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--token", default="mock-seguros-local", help="Token sintético para los tres endpoints")
    parser.add_argument("--sample-alta", action="store_true", help="Imprime un JSON sintético válido y termina")
    args = parser.parse_args()
    if args.sample_alta:
        print(json.dumps(sample_alta(), ensure_ascii=True, indent=2))
        return
    if not args.token or not args.token.isascii() or not args.token.isprintable() or " " in args.token:
        parser.error("--token debe contener caracteres ASCII visibles, sin espacios")
    with ThreadingHTTPServer((args.host, args.port), MockHandler) as server:
        server.bearer = f"Bearer {args.token}".encode("ascii")
        server.records = make_records()
        server.index = {(kind, record["key"]): record for kind, record in server.records}
        print(f"Mock disponible en http://{args.host}:{server.server_port}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
