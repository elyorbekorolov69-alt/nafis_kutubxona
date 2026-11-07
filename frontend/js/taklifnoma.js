// Taklifnoma sahifasi: ma'lumotni olib, tanlangan dizaynga joylaydi.
(function () {
  "use strict";

  var OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul",
    "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
  var DIZAYNLAR = ["krem"];
  var q = new URLSearchParams(location.search);
  var id = (window.TAKLIF_ID || q.get("id") || "safina-bekjon").toLowerCase().replace(/[^a-z0-9-]/g, "");
  var $ = function (x) { return document.getElementById(x); };

  function oldin(url, ms) {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, ms);
    return fetch(url, { signal: ctl.signal }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  // 1) backenddan, bo'lmasa 2) data/<id>.json dan
  function malumotOl() {
    var api = (window.SOZLAMA && window.SOZLAMA.API_URL) || "";
    var local = function () { return oldin("data/" + id + ".json", 6000); };
    if (!api) return local();
    return oldin(api + "/api/invitations/" + id, 4000).catch(local);
  }

  function matn(el, s) { if (el) el.textContent = s || ""; }

  function sanaMatni(sana) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sana || "");
    if (!m) return sana || "";
    return parseInt(m[3], 10) + " " + OYLAR[parseInt(m[2], 10) - 1];
  }

  function joylash(d) {
    var diz = q.get("d") || d.dizayn || "krem";
    if (DIZAYNLAR.indexOf(diz) < 0) diz = "krem";
    document.body.className = "d-" + diz;
    var theme = { krem: "#f6ecd9" };
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme[diz]);

    var kelin = d.kelin || "", kuyov = d.kuyov || "";
    document.title = kelin + " & " + kuyov + " | Taklifnoma";
    matn($("kelin"), kelin);
    matn($("kuyov"), kuyov);
    matn($("oila"), d.oila);
    matn($("sana"), sanaMatni(d.sana));
    matn($("vaqt"), d.vaqt ? "soat " + d.vaqt : "");
    matn($("joy"), d.joy);
    matn($("izoh"), d.izoh);
    matn($("joy2"), d.joy);
    matn($("manzil"), d.manzil);

    // Xarita tugmasi
    var a = $("xarita");
    var href = "";
    if (d.xarita && /^https:\/\/(maps\.app\.goo\.gl|www\.google\.com\/maps|goo\.gl\/maps|yandex\.[a-z]+\/maps)/.test(d.xarita)) {
      href = d.xarita;
    } else if (d.joy || d.manzil) {
      href = "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent([d.joy, d.manzil].filter(Boolean).join(", "));
    }
    if (href) a.href = href; else a.hidden = true;

    bolimlar(d, kelin, kuyov);

    // Musiqa
    var bgm = $("bgm");
    if (d.musiqa === false) { bgm.remove(); } else { $("musiqa-tugma").hidden = false; }

    taymer(d);
  }

  var HAFTA = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

  function bolimlar(d, kelin, kuyov) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.sana || "");
    if (m) {
      var y = +m[1], oy = +m[2], kun = +m[3];
      matn($("oy-nomi"), OYLAR[oy - 1] + " " + y);
      var birinchi = (new Date(Date.UTC(y, oy - 1, 1)).getUTCDay() + 6) % 7;
      var soni = new Date(Date.UTC(y, oy, 0)).getUTCDate();
      var box = $("kunlar");
      box.textContent = "";
      for (var i = 0; i < birinchi; i++) box.appendChild(document.createElement("span"));
      var hafta = HAFTA[new Date(Date.UTC(y, oy - 1, kun)).getUTCDay()];
      var kunTugmalar = [];
      for (var k = 1; k <= soni; k++) {
        var sp = document.createElement("button");
        sp.type = "button";
        sp.textContent = String(k);
        sp.setAttribute("aria-label", k + "-kun");
        box.appendChild(sp);
        kunTugmalar.push(sp);
        (function (b, n) {
          if (n === kun) {
            b.addEventListener("click", function () {
              b.className = "togri";
              kunTugmalar.forEach(function (x) { x.disabled = true; x.style.translate = ""; });
              $("maslahat").textContent = "Topdingiz! 🎉";
              matn($("hafta-kuni"), hafta + (d.vaqt ? ", soat " + d.vaqt : ""));
              $("hafta-kuni").hidden = false;
              soatlarOyini(d);
            });
          } else qoch(b, 70);
        })(sp, k);
      }
    }
    matn($("soat-vaqt"), d.vaqt || "");
    matn($("matn"), d.matn || "Hayotimizdagi eng baxtli kunni siz bilan birga nishonlashni istaymiz. Duo va ezgu tilaklaringiz bilan to‘yimiz yanada bahtli bo‘lsin. Sizni kutib qolamiz!");
    matn($("imzo"), kelin + " & " + kuyov);
    matn($("yakun-matn"), d.izoh || "Sizni kutib qolamiz!");
    matn($("yakun-oila"), d.oila);
    var bosh = document.querySelector("#ochish .muhr");
    if (bosh && kelin && kuyov) bosh.textContent = kelin.charAt(0).toUpperCase() + "&" + kuyov.charAt(0).toUpperCase();
  }

  // Noto'g'ri tugma bosilsa/yaqinlashilsa, u qochib ketadi (hech qachon "bosilmaydi")
  function qoch(b, oraliq) {
    function yur(e) {
      if (e && e.cancelable) e.preventDefault();
      var dx = (Math.random() * 2 - 1) * oraliq, dy = (Math.random() * 2 - 1) * oraliq;
      if (Math.abs(dx) < oraliq * .4) dx = (dx < 0 ? -1 : 1) * oraliq * .4;
      b.style.translate = dx + "px " + dy + "px";
      b.style.rotate = (Math.random() * 40 - 20) + "deg";
      b.classList.add("qochgan");
    }
    b.addEventListener("pointerdown", yur);
    b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") yur(e); });
    b.addEventListener("click", function (e) { e.preventDefault(); yur(); });
  }

  function soatlarOyini(d) {
    var blok = $("vaqt-blok"), box = $("soatlar");
    var togri = d.vaqt || "11:00";
    var h = parseInt(togri.slice(0, 2), 10);
    var royxat = [h - 3, h - 2, h - 1, h, h + 1, h + 2, h + 3, h + 4, h - 4].filter(function (x) { return x >= 0 && x < 24; });
    var tanlov = royxat.filter(function (x) { return x !== h; }).slice(0, 5);
    tanlov.push(h);
    tanlov.sort(function (a, b) { return a - b; });
    box.textContent = "";
    tanlov.forEach(function (x) {
      var s = (x < 10 ? "0" : "") + x + ":" + togri.slice(3, 5);
      var b = document.createElement("button");
      b.type = "button"; b.textContent = s;
      box.appendChild(b);
      if (s === togri) {
        b.className = "togri";
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(box.children, function (z) { z.disabled = true; z.style.translate = ""; });
          javobOyini();
        });
      } else qoch(b, 50);
    });
    blok.hidden = false;
    blok.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function javobOyini() {
    var blok = $("javob-blok"), r = $("rahmat");
    blok.hidden = false;
    blok.scrollIntoView({ behavior: "smooth", block: "center" });
    function javob(s) {
      r.textContent = s; r.hidden = false;
      $("kelaman").disabled = true; $("kelolmayman").disabled = true;
    }
    $("kelaman").addEventListener("click", function () { javob("Rahmat! Sizni kutib qolamiz ♡"); });
    $("kelolmayman").addEventListener("click", function () { javob("Afsus, lekin duolaringiz biz bilan ♡"); });
  }

  function korinish() {
    var els = document.querySelectorAll(".rv");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add("korin"); });
      return;
    }
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("korin"); io.unobserve(x.target); } });
    }, { threshold: .25 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  function taymer(d) {
    if (!d.sana) { $("taymer").hidden = true; return; }
    var t = new Date(d.sana + "T" + (d.vaqt || "00:00") + ":00+05:00").getTime();
    if (isNaN(t)) { $("taymer").hidden = true; return; }
    function yangila() {
      var farq = t - Date.now();
      if (farq <= 0) {
        $("taymer").hidden = true;
        matn($("holat"), "To‘y marosimi boshlandi yoki o‘tib bo‘ldi");
        return false;
      }
      var s = Math.floor(farq / 1000);
      matn($("t-kun"), String(Math.floor(s / 86400)));
      matn($("t-soat"), String(Math.floor(s % 86400 / 3600)));
      matn($("t-daq"), String(Math.floor(s % 3600 / 60)));
      matn($("t-son"), String(s % 60));
      return true;
    }
    if (yangila()) {
      var iv = setInterval(function () { if (!yangila()) clearInterval(iv); }, 1000);
    }
  }

  function ochishniUla() {
    var bgm = $("bgm"), tugma = $("musiqa-tugma");
    function musiqaHolat() { tugma.classList.toggle("ochiq", bgm && !bgm.paused); }
    $("ochish").addEventListener("click", function () {
      document.body.classList.add("open");
      $("sahifa").hidden = false;
      if (bgm && document.body.contains(bgm)) {
        var p2 = bgm.play(); if (p2 && p2.then) p2.then(musiqaHolat).catch(function () {});
      }
      setTimeout(function () { $("intro").remove(); }, 1700);
    });
    var rk = $("reklama");
    if (rk) rk.addEventListener("play", function () { if (bgm && !bgm.paused) { bgm.pause(); musiqaHolat(); } });
    tugma.addEventListener("click", function () {
      if (!bgm) return;
      if (bgm.paused) bgm.play().then(musiqaHolat).catch(function () {}); else { bgm.pause(); musiqaHolat(); }
    });
  }

  malumotOl().then(function (d) {
    joylash(d);
    $("sahifa").hidden = false;     // intro ostida tayyor turadi
    ochishniUla();
    korinish();
    document.body.classList.add("tayyor");
  }).catch(function () {
    $("intro").hidden = true;
    $("xato").hidden = false;
  });
})();
