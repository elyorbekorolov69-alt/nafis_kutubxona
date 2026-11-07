// Nafis Taklifnoma API. Tashqi kutubxonasiz (faqat Node.js o'zining modullari).
"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { makeStore } = require("./store");
const { tozala, ID_RE } = require("./validate");

// .env ni o'qish (dotenv shart emas)
try {
  const f = path.join(__dirname, "..", ".env");
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch { /* .env bo'lmasa ham ishlayveradi */ }

const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const FRONTEND_URL = (process.env.FRONTEND_URL || "*").replace(/\/+$/, "");
const store = makeStore(process.env);

// Oddiy cheklov: bir IP dan daqiqasiga 120 so'rov
const hits = new Map();
function limit(ip) {
  const now = Date.now(), w = hits.get(ip) || [];
  const rec = w.filter((t) => now - t < 60000);
  rec.push(now); hits.set(ip, rec);
  if (hits.size > 5000) hits.clear();
  return rec.length <= 120;
}

function adminmi(req) {
  const k = req.headers["x-api-key"] || "";
  if (!ADMIN_KEY || typeof k !== "string") return false;
  const a = Buffer.from(k), b = Buffer.from(ADMIN_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (FRONTEND_URL === "*") res.setHeader("Access-Control-Allow-Origin", "*");
  else if (origin === FRONTEND_URL) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

function body(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on("data", (c) => { n += c.length; if (n > 20000) { reject(new Error("Juda katta so'rov")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch { reject(new Error("JSON noto'g'ri")); } });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const ip = req.socket.remoteAddress || "?";
  if (!limit(req.headers["x-forwarded-for"] || ip)) return json(res, 429, { xato: "Juda ko'p so'rov" });

  const url = new URL(req.url, "http://x");
  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  try {
    if (parts.length === 0) return json(res, 200, { ok: true, xizmat: "Nafis Taklifnoma API", baza: store.kind });

    if (parts[0] !== "api" || parts[1] !== "invitations") return json(res, 404, { xato: "Topilmadi" });
    const id = parts[2];

    // Ro'yxat (admin)
    if (!id && req.method === "GET") {
      if (!adminmi(req)) return json(res, 401, { xato: "Kalit noto'g'ri" });
      return json(res, 200, await store.list());
    }
    // Yaratish (admin)
    if (!id && req.method === "POST") {
      if (!adminmi(req)) return json(res, 401, { xato: "Kalit noto'g'ri" });
      const d = tozala(await body(req), true);
      if (await store.exists(d.id)) return json(res, 409, { xato: "Bu id band, boshqasini tanlang yoki PUT ishlating" });
      await store.put(d.id, d);
      return json(res, 201, { ok: true, id: d.id, havola: `t.html?id=${d.id}` });
    }
    if (id && !ID_RE.test(id)) return json(res, 400, { xato: "id noto'g'ri" });

    // Ko'rish (hamma uchun)
    if (id && req.method === "GET") {
      const d = await store.get(id);
      return d ? json(res, 200, d) : json(res, 404, { xato: "Taklifnoma topilmadi" });
    }
    // O'zgartirish va o'chirish (admin)
    if (id && (req.method === "PUT" || req.method === "DELETE")) {
      if (!adminmi(req)) return json(res, 401, { xato: "Kalit noto'g'ri" });
      if (req.method === "DELETE") return (await store.del(id)) ? json(res, 200, { ok: true }) : json(res, 404, { xato: "Topilmadi" });
      if (!(await store.exists(id))) return json(res, 404, { xato: "Topilmadi" });
      const d = tozala({ ...(await body(req)), id }, true);
      await store.put(id, d);
      return json(res, 200, { ok: true, id });
    }
    return json(res, 405, { xato: "Usul mumkin emas" });
  } catch (e) {
    const user = /kerak|bo'lsin|juda|noto'g'ri|dizayn|matn|JSON|havola|ko'rinishida/i.test(e.message);
    if (!user) console.error(e);
    return json(res, user ? 400 : 500, { xato: user ? e.message : "Server xatosi" });
  }
});

server.listen(PORT, () => {
  console.log(`Nafis Taklifnoma API: http://localhost:${PORT}  (baza: ${store.kind})`);
  if (!ADMIN_KEY) console.log("DIQQAT: ADMIN_KEY yo'q, taklifnoma yaratib bo'lmaydi (faqat ko'rish ishlaydi).");
});
