// Saqlash: Supabase (REST) yoki, kalit bo'lmasa, data.json fayli.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const FILE = path.join(__dirname, "..", "data.json");

function localRead() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; }
}
function localWrite(obj) {
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, FILE);
}

function makeStore(env) {
  const url = (env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = env.SUPABASE_KEY || "";

  if (!url || !key) {
    return {
      kind: "fayl (data.json)",
      async get(id) { return localRead()[id] || null; },
      async list() { return Object.values(localRead()); },
      async put(id, data) { const all = localRead(); all[id] = data; localWrite(all); },
      async del(id) { const all = localRead(); const bor = id in all; delete all[id]; localWrite(all); return bor; },
      async exists(id) { return id in localRead(); }
    };
  }

  const H = { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" };
  const T = url + "/rest/v1/taklifnomalar";
  const enc = encodeURIComponent;
  async function call(u, opt) {
    const r = await fetch(u, { ...opt, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("Supabase " + r.status);
    return r;
  }
  return {
    kind: "Supabase",
    async get(id) {
      const r = await call(`${T}?id=eq.${enc(id)}&select=data`, { headers: H });
      const rows = await r.json();
      return rows[0] ? rows[0].data : null;
    },
    async list() {
      const r = await call(`${T}?select=data&order=created_at.desc&limit=200`, { headers: H });
      return (await r.json()).map((x) => x.data);
    },
    async put(id, data) {
      await call(`${T}?on_conflict=id`, {
        method: "POST",
        headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id, data, updated_at: new Date().toISOString() })
      });
    },
    async del(id) {
      const r = await call(`${T}?id=eq.${enc(id)}`, { method: "DELETE", headers: { ...H, Prefer: "return=representation" } });
      return (await r.json()).length > 0;
    },
    async exists(id) { return (await this.get(id)) !== null; }
  };
}

module.exports = { makeStore };
