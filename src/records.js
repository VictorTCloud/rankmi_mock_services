import { SOURCES } from "./config.js";

function asciiEmailName(first, last) {
  return `${first}.${last}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
}

function pad(n, width) {
  return String(n).padStart(width, "0");
}

export function profiles() {
  const initial = [
    {
      names: ["Valentina", "Isabel", "Rojas", "Beltrán"],
      city: "Bogotá D.C.",
      department: "Operaciones de Siniestros",
      role: "Analista de Siniestros",
      division: "Operaciones",
      family: "Gestión de Siniestros",
      salary: 3850000,
      start: "2026-03-02",
      end: "2027-03-01",
      birth: "1994-06-18",
      issued: "2012-07-03",
      sex: "FEMENINO",
      degree: "Administración de Empresas",
      postal: "110231",
      boss: "Catalina Duarte Acosta",
      boss_role: "Coordinadora de Siniestros",
      contact: "Andrés Rojas Beltrán",
      relation: "HERMANO",
      blood: "O+",
      status: "SOLTERA",
      address: "Calle 63 # 13-42",
      branch: "Bogotá Centro",
    },
    {
      names: ["Mateo", "Andrés", "Salazar", "Mejía"],
      city: "Medellín",
      department: "Servicio al Cliente",
      role: "Asesor de Servicio al Cliente",
      division: "Experiencia del Cliente",
      family: "Atención al Cliente",
      salary: 2750000,
      start: "2026-05-04",
      end: "2027-05-03",
      birth: "1997-02-12",
      issued: "2015-03-10",
      sex: "MASCULINO",
      degree: "Tecnología en Gestión Comercial",
      postal: "050021",
      boss: "Laura Restrepo Castaño",
      boss_role: "Coordinadora de Servicio",
      contact: "Claudia Mejía Torres",
      relation: "MADRE",
      blood: "A+",
      status: "CASADO",
      address: "Carrera 43A # 16-52",
      branch: "Medellín Sur",
    },
  ];

  const locations = [
    ["Bogotá D.C.", "11001", "Bogotá Centro", "BOG-01", "110231"],
    ["Medellín", "05001", "Medellín Sur", "MED-02", "050021"],
    ["Cali", "76001", "Cali Norte", "CLO-01", "760046"],
    ["Barranquilla", "08001", "Barranquilla Centro", "BAQ-01", "080003"],
    ["Bucaramanga", "68001", "Bucaramanga Centro", "BGA-01", "680003"],
    ["Pereira", "66001", "Pereira Centro", "PEI-01", "660003"],
  ];

  const roles = [
    [
      "Suscripción",
      "Analista de Suscripción",
      "Operaciones",
      "Gestión de Pólizas",
      4200000,
      "Coordinación de Suscripción",
      "Administración Financiera",
    ],
    [
      "Cartera y Recaudo",
      "Auxiliar de Cartera",
      "Finanzas",
      "Gestión Financiera",
      2450000,
      "Coordinación de Cartera",
      "Tecnología en Contabilidad",
    ],
    [
      "Operaciones de Siniestros",
      "Gestor de Indemnizaciones",
      "Operaciones",
      "Gestión de Siniestros",
      3500000,
      "Coordinación de Siniestros",
      "Administración de Empresas",
    ],
    [
      "Servicio al Cliente",
      "Asesor de Servicio al Cliente",
      "Experiencia del Cliente",
      "Atención al Cliente",
      2800000,
      "Coordinación de Servicio",
      "Tecnología en Gestión Comercial",
    ],
    [
      "Riesgo y Cumplimiento",
      "Analista de Riesgos",
      "Riesgos",
      "Gestión de Riesgos",
      4800000,
      "Coordinación de Riesgos",
      "Economía",
    ],
    [
      "Canales Comerciales",
      "Ejecutivo Comercial de Seguros",
      "Comercial",
      "Gestión Comercial",
      3900000,
      "Coordinación Comercial",
      "Mercadeo",
    ],
  ];

  const people = [
    ["Lucía", "Elena", "Mora", "Vega"],
    ["Julián", "David", "Pardo", "Navas"],
    ["Camila", "Andrea", "Ortiz", "Lara"],
    ["Tomás", "Felipe", "León", "Ruiz"],
    ["Daniela", "Paola", "Prieto", "Reyes"],
    ["Samuel", "Esteban", "Luna", "Gil"],
    ["Mariana", "Sofía", "Vargas", "Ríos"],
    ["Nicolás", "Alejandro", "Arias", "Mena"],
    ["Laura", "Beatriz", "Peña", "Acuña"],
    ["Gabriel", "Antonio", "Vera", "Paz"],
    ["Sara", "Juliana", "Solano", "Marín"],
    ["Felipe", "Javier", "Díaz", "Peralta"],
    ["Elena", "Victoria", "Vidal", "Serna"],
    ["Andrés", "Felipe", "Orozco", "Lozano"],
    ["Adriana", "Patricia", "Soto", "Duarte"],
    ["Diego", "Alejandro", "Ibarra", "Cano"],
    ["Natalia", "Inés", "Torres", "Rico"],
    ["Sebastián", "José", "Sierra", "Vivas"],
  ];

  const bloodTypes = ["O+", "A+", "B+"];
  const additional = people.map((names, i) => {
    const [city, city_code, branch, branch_code, postal] =
      locations[i % locations.length];
    const [
      department,
      role,
      division,
      family,
      salary,
      boss_role,
      degree,
    ] = roles[(i + Math.floor(i / 6)) % roles.length];
    const isWoman = i % 2 === 0;
    const month = 2 + (i % 8);
    const day = 3 + (i % 15);
    const year = 1988 + (i % 13);
    return {
      names,
      city,
      city_code,
      branch,
      branch_code,
      postal,
      department,
      role,
      division,
      family,
      salary,
      boss_role,
      degree,
      start: `2026-${pad(month, 2)}-${pad(day, 2)}`,
      end: `2027-${pad(month, 2)}-${pad(day - 1, 2)}`,
      birth: `${year}-01-19`,
      issued: `${year + 18}-02-11`,
      sex: isWoman ? "FEMENINO" : "MASCULINO",
      boss: "Alejandra Cifuentes Ríos",
      contact: `Mónica ${names[2]} ${names[3]}`,
      relation: "HERMANA",
      blood: bloodTypes[i % 3],
      status: isWoman ? "SOLTERA" : "SOLTERO",
      address: `Calle ${20 + i} # ${12 + i}-35`,
      training: `2026-${pad(month, 2)}-${pad(day + 2, 2)}`,
      absence_start: "2026-10-26",
      absence_end: "2026-10-30",
    };
  });

  return [...initial, ...additional];
}

export function makeAlta(profile, index) {
  const [first, second, last, secondLast] = profile.names;
  const emailName = asciiEmailName(first, last);
  return {
    magneto_id: `MAG-${1000 + index}`,
    work_city: profile.city,
    position_id: 100 + index,
    job_id: 200 + index,
    area_id: 300 + index,
    salary_type: "FIJO",
    monthly_salary_amount: profile.salary,
    contract_type: "TERMINO_FIJO",
    contract_start_date: profile.start,
    work_schedule: "COMPLETA",
    salary_definition: "FIJO",
    collective_agreement: "",
    height_course: "S",
    last_height_course_date:
      profile.training ??
      (index === 1 ? "2026-06-12" : "2026-07-17"),
    contract_end_date: profile.end,
    identification_type: "CC",
    identification_number: String(9900000000 + index),
    identification_issued_at: profile.issued,
    identification_issued_city: profile.city,
    first_name: first,
    second_name: second,
    last_name: last,
    second_last_name: secondLast,
    nationality: "COLOMBIANA",
    birthday: profile.birth,
    personal_email: `${emailName}@example.invalid`,
    phone: `+57 300 000 ${pad(100 + index, 4)}`,
    phone_2: `+57 310 000 ${pad(100 + index, 4)}`,
    marital_status: profile.status,
    sex: profile.sex,
    address_city: profile.city,
    address: profile.address,
    address_2: index === 1 ? "Apartamento 302" : "Interior 2",
    postal_code: profile.postal,
    blood_type: profile.blood,
    allergies: "NINGUNA REPORTADA",
    academic_level: index === 1 ? "PROFESIONAL" : "TECNOLÓGICO",
    career: profile.degree,
    main_language: "es",
    disability: false,
    disability_type: "",
    disability_certified: "N",
    emergency_contacts_name: profile.contact,
    emergency_contacts_phone: `+57 320 000 ${pad(100 + index, 4)}`,
    emergency_contacts_relationship: profile.relation,
  };
}

export function sampleAlta() {
  return makeAlta(profiles()[0], 1);
}

export function makeRecords() {
  const rows = [];
  for (const [i, profile] of profiles().entries()) {
    const index = i + 1;
    const alta = makeAlta(profile, index);
    const name = profile.names.join(" ");
    const city = profile.city;
    const city_code = profile.city_code ?? (index === 1 ? "11001" : "05001");
    const branch_code = profile.branch_code ?? (index === 1 ? "BOG-01" : "MED-02");
    const code = `POS-${pad(100 + index, 4)}`;
    const job = `CAR-${pad(200 + index, 4)}`;
    const dept = `DEP-${pad(300 + index, 3)}`;
    const cost_center = 4100 + index;
    const identifier = alta.identification_number;
    const email = alta.personal_email.replace(
      "@example.invalid",
      "@seguros.example.invalid",
    );
    const structure = {
      COUNTRY_CODE: "CO",
      COUNTRY: "Colombia",
      BUSINESS_UNIT_SET_CODE: "SEG-CO",
      BUSINESS_UNIT_NAME: "Seguros Colombia",
      DEPARTAMENT_CODE: dept,
      DEPARTAMENT_NAME: profile.department,
      COST_CENTER_ID: cost_center,
      COST_CENTER_NAME: profile.department,
      JOB_FAMILY_NAME: profile.family,
      JOB_CODE: job,
      JOB_NAME: profile.role,
      POSITION_CODE: code,
      POSITION_NAME: profile.role,
      VICEPRESIDENCIA: profile.division,
      SUCURSAL: profile.branch,
      GRADO_SISTEMA: index === 1 ? "11" : "8",
      FULL_NAME: name,
      NATIONAL_IDENTIFIER_NUMBER: identifier,
      EMAIL_ADDRESS: email,
    };
    if (index % 2 === 1) {
      Object.assign(structure, {
        BUSINESS_UNIT_ID: 10,
        DEPARTAMENT_ID: alta.area_id,
        JOB_FAMILY_ID: String(11 + index),
        JOB_FAMILY_CODE: `FAM-${pad(index, 2)}`,
        JOB_ID: alta.job_id,
        POSITION_ID: alta.position_id,
        CODIGO_SUCURSAL: branch_code,
      });
    }
    const contract = {
      CodigoEmpresa: "SEG01",
      EntidadLegal: "Compañía de Seguros Horizonte S.A. (ficticia)",
      CodigoDepartamento: dept,
      NombreDepartamento: profile.department,
      CentroDeCosto: cost_center,
      NombreCentroDeCosto: profile.department,
      CodigoPuesto: job,
      NombrePuesto: profile.role,
      CodigoPosicion: code,
      NombrePosicion: profile.role,
      Vicepresidencia: profile.division,
      NombreSucursal: profile.branch,
      NombreCompletoJefe: profile.boss,
      IdentificadorNacionalJefe: String(9900000100 + index),
      IdentificadorNacional: identifier,
      TipoIdentificadorNacional: "CC",
      PrimerNombre: alta.first_name,
      SegundoNombre: alta.second_name,
      PrimerApellido: alta.last_name,
      SegundoApellido: alta.second_last_name,
      NombreCompleto: name,
      NombreUbicacion: profile.branch,
      NombreCiudadTrabajo: city,
      CodigoCargoJefe: `CAR-${pad(500 + index, 4)}`,
      NombreCargoJefe: profile.boss_role,
      NombreUbicacionJefe: profile.branch,
      CodigoCentroDeCostoJefe: String(cost_center),
      NombreCentroDeCostoJefe: profile.department,
      TipoIdCompania: "NIT",
      NumeroIdCompania: 900000001,
      NumeroPersona: `P-${pad(1000 + index, 6)}`,
      FechaIngreso: profile.start,
      FechaFinContrato: profile.end,
      FechaTerminacion: profile.end,
      Estado: true,
      FechaInicioAusencia:
        profile.absence_start ??
        (index === 1 ? "2026-09-07" : "2026-10-05"),
      FechaFinAusencia:
        profile.absence_end ?? (index === 1 ? "2026-09-11" : "2026-10-09"),
      FechaRegistro: profile.start,
      UsuarioRegistro: "gestion.personas",
      CategoriaAsignacion: "TIEMPO COMPLETO",
      TelefonoLaboral: `+57 601 000 ${pad(200 + index, 4)}`,
      PersonaNatural: "S",
      CodigoTipoContrato: "TERMINO_FIJO",
      DescripcionTipoContrato: "Término fijo",
      SystemPersonType: "EMP",
      Genero: profile.sex,
      ContratoPrincipal: true,
      EmailCorporativo: email,
      NombrePrimerContacto: profile.contact,
      TelefonoContacto: alta.emergency_contacts_phone,
      CursoAltura: alta.height_course,
      FechaUltimoCurso: alta.last_height_course_date,
      GrupoSanguineo: profile.blood,
      FechaNacimiento: profile.birth,
      NivelAcademico: alta.academic_level,
      weekly_hours: "42",
    };
    for (const field of [
      "identification_issued_at",
      "identification_issued_city",
      "nationality",
      "phone_2",
      "marital_status",
      "address_city",
      "address",
      "postal_code",
      "allergies",
      "career",
      "main_language",
      "disability",
      "disability_type",
      "emergency_contacts_relationship",
      "salary_type",
      "monthly_salary_amount",
      "work_schedule",
      "salary_definition",
      "collective_agreement",
    ]) {
      contract[field] = alta[field];
    }
    contract.disability_certified = false;
    if (index % 2 === 1) {
      Object.assign(contract, {
        CodigoSucursal: branch_code,
        "CodigoUbicación": branch_code,
        CodigoCiudadTrabajo: city_code,
        CodigoUbicacionJefe: branch_code,
        CodigoSucursalJefe: branch_code,
        NombreSucursalJefe: profile.branch,
        TipoAusencia: "VACACIONES",
        DireccionUbicacion: `Calle ${70 + index} # 10-34`,
        Extension: String(2400 + index),
        PersonTypeCode: "EMP",
        CiudadUbicacion: city,
        "CódigoUbicacionNivel1": branch_code,
        NombreUbicacionNivel1: profile.branch,
        IdentificadorNacionalNivel1: contract.IdentificadorNacionalJefe,
        NombreJefeNivel1: profile.boss,
        TipodeJefe: "DIRECTO",
      });
    }
  for (const [kind, key, fields] of [
      ["estructura", `${code}-${email}`, structure],
      ["contrato", identifier, contract],
    ]) {
      rows.push([kind, { key, source: SOURCES[kind], fields }]);
    }
  }
  return rows;
}

export function buildIndex(records) {
  const index = new Map();
  for (const [kind, record] of records) {
    index.set(`${kind}\0${record.key}`, record);
  }
  return index;
}
