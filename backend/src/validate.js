// Kiruvchi ma'lumotni tekshirish va tozalash.
"use strict";

const DIZAYNLAR = ["krem"];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAPS_RE = /^https:\/\/(maps\.app\.goo\.gl|www\.google\.com\/maps|goo\.gl\/maps|yandex\.[a-z]+\/maps)\//;

function matn(v, max) {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string") throw new Error("Matn bo'lishi kerak");
  const s = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (s.length > max) throw new Error(`Matn juda uzun (eng ko'pi ${max} belgi)`);
  return s;
}

function tozala(b, majburiyId) {
  if (!b || typeof b !== "object" || Array.isArray(b)) throw new Error("JSON obyekt yuboring");
  const id = matn(b.id, 60).toLowerCase();
  if (majburiyId && !ID_RE.test(id)) throw new Error("id faqat kichik lotin harf, raqam va '-' dan iborat bo'lsin (masalan: safina-bekjon)");
  const dizayn = b.dizayn === undefined ? "krem" : matn(b.dizayn, 20);
  if (!DIZAYNLAR.includes(dizayn)) throw new Error("dizayn: " + DIZAYNLAR.join(", "));
  const kelin = matn(b.kelin, 40), kuyov = matn(b.kuyov, 40);
  if (!kelin || !kuyov) throw new Error("kelin va kuyov ismi kerak");
  const sana = matn(b.sana, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sana) || isNaN(Date.parse(sana + "T00:00:00Z"))) throw new Error("sana YYYY-OO-KK ko'rinishida bo'lsin (2026-11-22)");
  const vaqt = matn(b.vaqt, 5);
  if (vaqt && !/^([01]\d|2[0-3]):[0-5]\d$/.test(vaqt)) throw new Error("vaqt SS:DD ko'rinishida bo'lsin (11:00)");
  const xarita = matn(b.xarita, 300);
  if (xarita && !MAPS_RE.test(xarita)) throw new Error("xarita havolasi Google yoki Yandex xaritasi bo'lsin (https://)");
  return {
    id, dizayn, kelin, kuyov,
    oila: matn(b.oila, 80), sana, vaqt,
    joy: matn(b.joy, 80), manzil: matn(b.manzil, 160), xarita,
    izoh: matn(b.izoh, 120), matn: matn(b.matn, 400), musiqa: b.musiqa !== false
  };
}

module.exports = { tozala, ID_RE, DIZAYNLAR };
