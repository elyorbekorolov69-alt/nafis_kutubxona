// ================= SOZLAMALAR =================
// Bu fayl sayt qayerdan ma'lumot olishini belgilaydi.

window.SOZLAMA = {
  // Backend manzili.
  // - GitHub Pages (github.io) dan ochilsa: Render'dagi backendga ulanadi.
  //   Render'da servis yaratgach, quyidagi manzilni o'zingiznikiga almashtiring.
  // - VS Code "Live Server" (5500-port) dan ochilsa: localhost:3000 dagi backend.
  // - Backend ulanmagan bo'lsa yoki javob bermasa: sayt data/<id>.json faylidan o'qiydi,
  //   shuning uchun backendsiz ham taklifnomalar ishlayveradi.
  API_URL: location.port === "5500" ? "http://localhost:3000"
    : location.hostname.endsWith("github.io") ? "https://nafis-taklifnoma.onrender.com"
    : "",

  // Dizayn nomlari va ularning sarlavhalari (galereya uchun)
  DIZAYNLAR: [
    { id: "krem", nom: "Krem-oltin", izoh: "Chiroq va oq atirgullar, nafis va iliq" }
  ]
};
