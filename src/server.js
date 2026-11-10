import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { ALTA, BASE, HEALTH, SOURCES } from "./config.js";
import {
  buildIndex,
  makeRecords,
  sampleAlta,
} from "./records.js";
import { validAlta } from "./validate.js";

const MAX_BODY = 65536;

function defaultPort() {
  for (const name of ["PORT", "MOCK_PORT"]) {
    const raw = process.env[name];
    if (raw) return Number.parseInt(raw, 10);
  }
  return 8080;
}

function parseArgs(argv) {
  const args = {
    host: process.env.MOCK_HOST ?? "127.0.0.1",
    port: defaultPort(),
    token: process.env.MOCK_TOKEN ?? "mock-seguros-local",
    sampleAlta: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--sample-alta") {
      args.sampleAlta = true;
    } else if (arg === "--host") {
      args.host = argv[++i];
    } else if (arg === "--port") {
      args.port = Number.parseInt(argv[++i], 10);
    } else if (arg === "--token") {
      args.token = argv[++i];
    }
  }
  return args;
}

function tokenValid(token) {
  if (!token) return false;
  for (const ch of token) {
    const code = ch.codePointAt(0);
    if (code === undefined || code < 33 || code > 126 || ch === " ") {
      return false;
    }
  }
  return true;
}

function authorized(req, bearerExpected) {
  const given = req.headers.authorization ?? "";
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(bearerExpected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function reply(res, status, body) {
  if (body === undefined) {
    res.writeHead(status);
    res.end();
    return;
  }
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload, "utf8"),
  });
  res.end(payload);
}

function jsonContentType(req) {
  const raw = req.headers["content-type"] ?? "";
  return raw.split(";")[0].trim().toLowerCase() === "application/json";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function loadPage(query, records, res) {
  const pageRaw = query.get("page");
  const sizeRaw = query.get("pageSize");
  if (pageRaw === null || sizeRaw === null) {
    reply(res, 400);
    return;
  }
  const page = Number.parseInt(pageRaw, 10);
  const size = Number.parseInt(sizeRaw, 10);
  if (
    !Number.isFinite(page) ||
    !Number.isFinite(size) ||
    Math.min(page, size) < 1
  ) {
    reply(res, 400);
    return;
  }
  const start = (page - 1) * size;
  const rows = records.slice(start, start + size).map(([, record]) => record);
  reply(res, 200, { mark: "SEGUROS", data: rows });
}

function lookup(query, index, res) {
  const types = query.getAll("type");
  const keys = query.getAll("key");
  if (
    types.length !== 1 ||
    !(types[0] in SOURCES) ||
    keys.length !== 1 ||
    !keys[0]
  ) {
    reply(res, 400);
    return;
  }
  const record = index.get(`${types[0]}\0${keys[0]}`);
  if (record === undefined) {
    reply(res, 404);
    return;
  }
  reply(res, 200, { mark: "SEGUROS", data: [record] });
}

function createMockServer(bearer, records, index) {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const { pathname } = url;

    if (req.method === "GET" && pathname === HEALTH) {
      reply(res, 200, { status: "ok" });
      return;
    }

    if (req.method === "GET") {
      const paths = new Set([`${BASE}/carga-masiva`, `${BASE}/registro`]);
      if (!paths.has(pathname)) {
        reply(res, 404);
        return;
      }
      if (!authorized(req, bearer)) {
        reply(res, 401);
        return;
      }
      if (pathname.endsWith("/carga-masiva")) {
        loadPage(url.searchParams, records, res);
      } else {
        lookup(url.searchParams, index, res);
      }
      return;
    }

    if (req.method === "POST" && pathname === ALTA) {
      if (!authorized(req, bearer)) {
        reply(res, 401);
        return;
      }
      try {
        const length = Number.parseInt(req.headers["content-length"] ?? "0", 10);
        if (!jsonContentType(req) || !(length > 0 && length <= MAX_BODY)) {
          throw new Error("bad request");
        }
        const raw = await readBody(req);
        if (raw.length !== length) throw new Error("bad request");
        const body = JSON.parse(raw.toString("utf8"));
        if (!validAlta(body)) {
          reply(res, 400);
          return;
        }
        const transaction = randomUUID();
        reply(res, 200, {
          transaction_id: transaction,
          magneto_id: body.magneto_id ?? `MAG-MOCK-${transaction}`,
          user_id: `USER-MOCK-${transaction}`,
          contract_id: `CONTRACT-MOCK-${transaction}`,
        });
      } catch {
        reply(res, 400);
      }
      return;
    }

    reply(res, 404);
  });
}

function main() {
  const args = parseArgs(process.argv);
  if (args.sampleAlta) {
    console.log(JSON.stringify(sampleAlta(), null, 2));
    return;
  }
  if (!tokenValid(args.token)) {
    console.error("--token debe contener caracteres ASCII visibles, sin espacios");
    process.exit(1);
  }
  const bearer = `Bearer ${args.token}`;
  const tuples = makeRecords();
  const records = tuples;
  const index = buildIndex(tuples);
  const server = createMockServer(bearer, records, index);
  server.listen(args.port, args.host, () => {
    console.log(`Mock disponible en http://${args.host}:${args.port}`);
  });
}

main();
