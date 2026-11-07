# Nafis Taklifnoma

Onlayn to'y taklifnomalari: mijozga havola beriladi, havola telefonda ochiladi.
Taklifnomada: ochilish effekti, to'ygacha taymer, xarita tugmasi, fon musiqasi.

```
nafis-taklifnoma/
├── frontend/   HTML + CSS + JavaScript (sayt), qurish (build) kerak emas
└── backend/    Node.js API (tashqi kutubxonasiz), taklifnomalarni saqlaydi
```

## Dizaynlar

| Kod | Nomi |
| --- | --- |
| `krem` | Krem-oltin (chiroq, atirgul) |

Hozircha faqat bitta dizayn qoldi. `frontend/index.html` shu taklifnomaga yo'naltiradi. Sahifa oxirida reklama bloki (video, @nafis_taklifnomabot, @Urolov20_05) bor.

## 1. Backendsiz ishlatish (eng tez)

Backend shart emas. Taklifnoma ma'lumoti `frontend/data/<id>.json` faylida turadi:

1. `frontend/data/safina-bekjon.json` faylini nusxalab, yangi nom bering (masalan `ali-vali.json`).
2. Ichidagi ism, sana, vaqt, joy va `dizayn` ni o'zgartiring.
3. GitHub'ga yuboring. Havola: `https://FOYDALANUVCHI.github.io/REPO/t.html?id=ali-vali`

## 2. GitHub'ga joylash (sayt)

1. github.com'da yangi repository yarating (`nafis-taklifnoma`).
2. Loyiha papkasida terminalda:

```
git init
git add .
git commit -m "Nafis Taklifnoma"
git branch -M main
git remote add origin https://github.com/FOYDALANUVCHI/nafis-taklifnoma.git
git push -u origin main
```

3. GitHub'da: **Settings → Pages → Source: GitHub Actions**. Bir-ikki daqiqadan keyin sayt ochiladi.

`git add .` dan keyin `git status` yozib, `.env` ro'yxatda YO'Qligini tekshiring.

## 3. Backend (ixtiyoriy: buyurtmalar saqlansin)

Mahalliy sinash:

```
cd backend
copy .env.example .env        (.env ichiga ADMIN_KEY yozing)
npm start
```

Brauzerda http://localhost:3000 ochilsa, `{"ok":true...}` chiqadi. Baza sozlanmasa ma'lumot `backend/data.json` ga yoziladi.

Doimiy ishlashi uchun (kutubxona loyihasidagidek):

1. Supabase'da yangi loyiha yarating, **SQL Editor** ga `backend/schema.sql` ni qo'yib ishga tushiring.
2. Render'da **New → Blueprint** → repozitoriyani tanlang.
3. Render panelida `ADMIN_KEY`, `FRONTEND_URL` (`https://FOYDALANUVCHI.github.io`), `SUPABASE_URL`,
   `SUPABASE_KEY` (**service_role** kaliti, faqat Render'da turadi) ni kiriting.
4. `frontend/js/config.js` dagi `API_URL` ga Render bergan manzilni yozing.

Supabase kaliti va `ADMIN_KEY` hech qachon GitHub'ga, chatga yoki frontendga yozilmaydi.

### Taklifnoma yaratish (PowerShell)

```powershell
$h = @{ "X-API-Key" = "ADMIN_KEY_SHU_YERGA" }
$b = @{ id="ali-vali"; dizayn="krem"; kelin="Vali"; kuyov="Ali"; oila="Karimovlar oilasi";
        sana="2026-12-05"; vaqt="18:00"; joy="Registon to'yxonasi"; izoh="Sizni kutamiz!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://SERVIS.onrender.com/api/invitations" -Headers $h -Body $b -ContentType "application/json; charset=utf-8"
```

| Usul | Manzil | Kalit |
| --- | --- | --- |
| GET | `/api/invitations/<id>` | kerak emas (taklifnomani ko'rish) |
| GET | `/api/invitations` | kerak (ro'yxat) |
| POST | `/api/invitations` | kerak (yaratish) |
| PUT | `/api/invitations/<id>` | kerak (o'zgartirish) |
| DELETE | `/api/invitations/<id>` | kerak (o'chirish) |

Backend ishlamay qolsa yoki uxlab yotgan bo'lsa (Render bepul rejasi), sayt `frontend/data/<id>.json` ga o'tadi.

## Eslatmalar

- Sahifadagi shriftlar (Pinyon Script, Cormorant Garamond, Montserrat) Google Fonts'dan yuklanadi.
  Mijozlarga sotishdan oldin muallifdan ruxsat oling.
- Havolani bilgan har kim sahifani ochadi. Sahifada maxfiy ma'lumot (telefon, to'liq manzil) yozmang.
