/* Plan verisi. Kaynak: YDS_2027-1_95_plus_plan.md
   Video işaretleri (m): "v" = hoca/kanal doğrulandı, "~" = kanal kesin değil, "seri" = sahibi doğrulanamayan numaralı seri.
   Video konusu (s): "A" = Pazartesi, "B" = Perşembe, "AB" = ikisi de. */
(function (root) {
  const yt = (id) => "https://www.youtube.com/watch?v=" + id;
  const pl = (id) => "https://www.youtube.com/playlist?list=" + id;
  const v = (t, u, m, s) => ({ t, u, m, s });

  const PHASES = [
    { id: 1, title: "Temel ve kelime", range: "H1–H11" },
    { id: 2, title: "Çeviri ve paragraf", range: "H12–H13" },
    { id: 3, title: "Deneme ve cilalama", range: "H14–H21" },
  ];

  const denemeFazi = [
    "Pzt: önceki denemenin analizi (90 dk). Her yanlışı etiketle, hata defterine yaz.",
    "Sal: zayıf konu 1, video + 30 soru.",
    "Çar: süreli paragraf seti (6 paragraf) + analiz.",
    "Per: zayıf konu 2, video + 30 soru.",
    "Cuma: çeviri + cloze karışık.",
    "Cmt: kelime/edat testi + 2 haftalık hata defteri tekrarı.",
    "Zayıf konu: önceki denemede en çok yanlış yapılan 2 soru tipi.",
  ];

  const WEEKS = [
    {
      n: 1, phase: 1, start: "2026-11-04", end: "2026-11-08", title: "Tanı ve kurulum",
      notes: [
        "Çar–Cum: kitapların içindekiler sayfasını incele. Stratejiler 1–2'de hangi konuların olduğunu not et.",
        "Günlük okuma ve hata defteri başlasın.",
        "Pazar 8 Kasım: tam tanı denemesi (eski bir ÖSYM sınavı, 180 dk). Soru tipine göre doğru sayını yaz.",
      ],
      videos: [
        v("Hakkı Hoca: YDS hangi sıralama ile çözülmeli", yt("-RKSgHugD6E"), "v"),
        v("Hakkı Hoca: en çok sorulan sorular", yt("gw6l4IXBPcs"), "v"),
        v("YDS YÖKDİL sıfırdan nasıl hazırlanmalı", yt("9QZjLpjfvYg"), "~"),
      ],
    },
    {
      n: 2, phase: 1, start: "2026-11-09", end: "2026-11-15", title: "Tenses I",
      a: "Present/Past tenses", b: "Perfect tenses",
      videos: [
        v("Tüm tenseler bir arada", yt("_UIAcHHE5mQ"), "~", "A"),
        v("Present Perfect (seri 04)", yt("1fYRaliO3xY"), "seri", "B"),
      ],
    },
    {
      n: 3, phase: 1, start: "2026-11-16", end: "2026-11-22", title: "Tenses II ve Modals",
      a: "Future/karışık tense", b: "Modals",
      videos: [
        v("En önemli 2 tense stratejisi", yt("HgHbekHo3AI"), "~", "A"),
        v("Past Perfect", yt("AKSnDP2m6cE"), "~", "A"),
        v("Modals (seri 17)", yt("St9cf2zTArU"), "seri", "B"),
        v("Modals örnek ders", yt("jsV7VxrQxrk"), "~", "B"),
        v("Modals soru çözümü", yt("XNj2S4SoMi4"), "~", "B"),
      ],
    },
    {
      n: 4, phase: 1, start: "2026-11-23", end: "2026-11-29", title: "Passive ve Conditionals",
      a: "Passive", b: "Conditionals + Wish",
      videos: [
        v("Passives (seri 18)", yt("CwjQpgemSxY"), "seri", "A"),
        v("Passive soru çözümü", yt("mqUgREhAOHI"), "~", "A"),
        v("Passive-Causatives örnek sorular", yt("munIpo4Zgx4"), "~", "A"),
        v("If Clauses soru çözümü, Oğuz Canbaz", yt("VbGih1nWYq4"), "v", "B"),
        v("If Clause konu anlatımı", yt("1YxOQzhet5Y"), "~", "B"),
        v("If & Wish çıkmış sorular", yt("XKfbsdddQEw"), "~", "B"),
      ],
    },
    {
      n: 5, phase: 1, start: "2026-11-30", end: "2026-12-06", title: "Noun ve Relative Clauses",
      a: "Noun clauses", b: "Relative clauses",
      videos: [
        v("Hakkı Hoca: 25 Noun Clause", yt("N83d7jmc5dU"), "v", "A"),
        v("Noun Clauses soru çözümü: 10 kural", yt("17Dnyled_Bs"), "~", "A"),
        v("Relative Clauses (seri 19)", yt("wMokUtxpaWk"), "seri", "B"),
        v("Hakkı Hoca: 25 Relative Clause", yt("7noxY6gDbQY"), "v", "B"),
        v("Relative Clause ve Noun Clause oynatma listesi", pl("PLXdAJUtUkho0zhtGJCgmH3qssZhG6IKdD"), "~", "AB"),
      ],
    },
    {
      n: 6, phase: 1, start: "2026-12-07", end: "2026-12-13", title: "Gerund/Infinitive ve Participle",
      a: "Gerund/Infinitive", b: "Participle",
      videos: [
        v("Fiilimsiler (seri 25)", yt("tcsiOXPZ-2o"), "seri", "AB"),
        v("Gerunds & Infinitives, Oğuz Canbaz Ders #15", yt("fOTh5OcSQ-g"), "v", "A"),
        v("Gerunds & Infinitives konu anlatımı ve teknikler", yt("bxod0gfdtoE"), "~", "A"),
      ],
    },
    {
      n: 7, phase: 1, start: "2026-12-14", end: "2026-12-20", title: "Bağlaçlar ve Prepositions",
      a: "Bağlaçlar", b: "Prepositions",
      notes: ["Pazar 20 Aralık: yarım deneme (kelime + gramer, 40 soru, 90 dk)."],
      videos: [
        v("Zıtlık bağlaçları (seri 21)", yt("K7U-10KyrJA"), "seri", "A"),
        v("Sebep-sonuç bağlaçları (seri 22)", yt("6oD58Zd76yA"), "seri", "A"),
        v("YDS'de bu bağlaçları bilmeden girmeyin", yt("AYEXZv9G_Jk"), "~", "A"),
        v("Bağlaçlar konu anlatımı ve çıkmış sorular", yt("qaLDHT7SIRM"), "~", "A"),
        v("Prepositions soru çözümü", yt("B9bJ6sLtjOg"), "~", "B"),
        v("Preposition test", yt("6XXQScDoDGA"), "~", "B"),
      ],
    },
    {
      n: 8, phase: 1, start: "2026-12-21", end: "2026-12-27", title: "Pronouns, sıfat/zarf, karşılaştırma ve gramer tekrarı",
      a: "Pronouns/Determiners/Quantifiers", b: "Adjective/Adverb/Comparison",
      notes: ["Cuma–Cumartesi: H2–H7 hata defterini yeniden çöz."],
      videos: [v("Pronouns (seri 01)", yt("OEQxtVKSDHQ"), "seri", "A")],
    },
    {
      n: 9, phase: 1, start: "2026-12-28", end: "2027-01-03", title: "Çıkmış sorular turu",
      notes: [
        "Gramer ve kelime çıkmış soruları, soru tipine göre (ÖSYM kitapçıkları).",
        "Yılbaşı haftası: 31 Aralık Perşembe, 1 Ocak Cuma. Esnek tut ama kelime ve hata defterini bırakma.",
      ],
      videos: [
        v("YDS karışık soru çözümü", yt("1UNucCGE4qY"), "~"),
        v("YDS gramer sorusu çözümleri 1", yt("17DU1ILWbkw"), "~"),
      ],
    },
    {
      n: 10, phase: 1, start: "2027-01-04", end: "2027-01-10", title: "Cloze ve Sentence Completion",
      a: "Cloze test", b: "Sentence Completion",
      notes: ["Pazar 10 Ocak: yarım deneme (40 soru, 90 dk)."],
      videos: [
        v("Cloze test soru çözümü", yt("q0y5snlV81o"), "~", "A"),
        v("Sentence Completion örnek soru çözümleri", yt("ygLc_NdxdW0"), "~", "B"),
      ],
    },
    {
      n: 11, phase: 1, start: "2027-01-11", end: "2027-01-17", title: "Dialogue, Irrelevant Sentence, paragraf tamamlama",
      a: "Irrelevant Sentence", b: "Dialogue + paragraf tamamlama",
      notes: [
        "Dialogue completion için net link yok. Kanalda \"dialogue completion\" diye ara.",
        "Kelime kitabı 16 Ocak Cumartesi biter.",
        "Pazar 17 Ocak: tam deneme 1.",
      ],
      videos: [
        v("Irrelevant Sentence: 13 altın kural", yt("Gvsl6nqwn6E"), "~", "A"),
        v("Irrelevant Sentence çözme teknikleri", yt("zvKqx81fOYQ"), "~", "A"),
      ],
    },
    {
      n: 12, phase: 2, start: "2027-01-18", end: "2027-01-24", title: "İngilizce→Türkçe çeviri",
      notes: ["Her akşam 10 çeviri sorusu.", "Pazar 24 Ocak: tam deneme 2."],
      videos: [
        v("Çeviri soruları taktiklerle nasıl çözülür", yt("yC9n0nfWER4"), "~"),
        v("Kolay ve hızlı çeviri teknikleri", yt("DRyx8ASYm2A"), "~"),
      ],
    },
    {
      n: 13, phase: 2, start: "2027-01-25", end: "2027-01-31", title: "Türkçe→İngilizce çeviri ve paragraf soru tipleri",
      notes: ["Pazar 31 Ocak: tam deneme 3."],
      videos: [
        v("Paragraf soruları çözme teknikleri", yt("a7WpdbqykiE"), "~"),
        v("Örnek paragraf soru çözümü", yt("n6JgM7UxtII"), "~"),
        v("Reading için tüm kelimeleri bilmek gerekli mi?", yt("sOrjTu7H4Zw"), "~"),
        v("Günlük okuma: Mesut Koyuncu, 212 videoluk oynatma listesi", pl("PLYtBhEwKfXcZ_v2thnPZlewSLsPFhwxEx"), "v"),
      ],
    },
    {
      n: 14, phase: 3, start: "2027-02-01", end: "2027-02-07", title: "Kayıt haftası",
      notes: [
        "3 Şubat Çarşamba akşamı kayıt. Kayıt 3–11 Şubat arasında, geç kayıt 18 Şubat.",
        "Pazar 7 Şubat: tam deneme 4 (kilometre taşı ≥ 60 doğru).",
      ],
      videos: [],
    },
    { n: 15, phase: 3, start: "2027-02-08", end: "2027-02-14", title: "Deneme fazı", notes: denemeFazi, videos: [] },
    { n: 16, phase: 3, start: "2027-02-15", end: "2027-02-21", title: "Deneme fazı", notes: denemeFazi, videos: [] },
    { n: 17, phase: 3, start: "2027-02-22", end: "2027-02-28", title: "Deneme fazı", notes: denemeFazi, videos: [] },
    { n: 18, phase: 3, start: "2027-03-01", end: "2027-03-07", title: "Deneme fazı", notes: denemeFazi, videos: [] },
    { n: 19, phase: 3, start: "2027-03-08", end: "2027-03-14", title: "Deneme fazı", notes: denemeFazi, videos: [] },
    { n: 20, phase: 3, start: "2027-03-15", end: "2027-03-21", title: "Deneme fazı", notes: denemeFazi, videos: [] },
    {
      n: 21, phase: 3, start: "2027-03-22", end: "2027-03-28", title: "Hafifletme",
      notes: [
        "Pzt–Per: günde 60–75 dk. Hata defteri, kelime tekrar listeleri, 1 paragraf seti.",
        "Cuma: hafif tekrar, erken yat.",
        "Cumartesi 27 Mart: çalışma yok. Sınav giriş belgesi ve sınav yerini kontrol et.",
        "Pazar 28 Mart: sınav, 10:15.",
      ],
      videos: [],
    },
  ];

  /* target: planın kilometre taşı. approx: iki taş arasındaki doğrusal ara değer (planda yok). */
  const EXAMS = [
    { id: "tani", name: "Tanı", date: "2026-11-08", q: 80, min: 180 },
    { id: "yarim1", name: "Yarım 1", date: "2026-12-20", q: 40, min: 90 },
    { id: "yarim2", name: "Yarım 2", date: "2027-01-10", q: 40, min: 90 },
    { id: "tam1", name: "Tam 1", date: "2027-01-17", q: 80, min: 180, target: 54 },
    { id: "tam2", name: "Tam 2", date: "2027-01-24", q: 80, min: 180, target: 56, approx: true },
    { id: "tam3", name: "Tam 3", date: "2027-01-31", q: 80, min: 180, target: 58, approx: true },
    { id: "tam4", name: "Tam 4", date: "2027-02-07", q: 80, min: 180, target: 60 },
    { id: "tam5", name: "Tam 5", date: "2027-02-14", q: 80, min: 180, target: 62, approx: true },
    { id: "tam6", name: "Tam 6", date: "2027-02-21", q: 80, min: 180, target: 64, approx: true },
    { id: "tam7", name: "Tam 7", date: "2027-02-28", q: 80, min: 180, target: 66, examHour: true },
    { id: "tam8", name: "Tam 8", date: "2027-03-07", q: 80, min: 180, target: 69, approx: true, examHour: true },
    { id: "tam9", name: "Tam 9", date: "2027-03-14", q: 80, min: 180, target: 72, examHour: true },
    { id: "tam10", name: "Tam 10", date: "2027-03-21", q: 80, min: 180, target: 74, examHour: true },
  ];

  const REAL_EXAM = { date: "2027-03-28", target: 76 };

  const DATES = [
    { date: "2027-01-04", end: "2027-01-07", label: "e-YDS (16 Ocak) kayıt" },
    { date: "2027-01-16", label: "e-YDS (yedek)" },
    { date: "2027-01-20", end: "2027-01-28", label: "e-YDS (6 Şubat) kayıt" },
    { date: "2027-02-03", end: "2027-02-11", label: "2027-YDS/1 kayıt", key: true },
    { date: "2027-02-06", label: "e-YDS (yedek)" },
    { date: "2027-02-18", label: "2027-YDS/1 geç kayıt" },
    { date: "2027-03-28", label: "2027-YDS/1 sınav, 10:15", key: true },
    { date: "2027-04-07", end: "2027-04-14", label: "e-YDS (24 Nisan) kayıt" },
    { date: "2027-04-21", label: "2027-YDS/1 sonuç" },
    { date: "2027-04-24", label: "e-YDS (yedek)" },
    { date: "2027-10-05", end: "2027-10-13", label: "2027-YDS/2 kayıt" },
    { date: "2027-11-21", label: "2027-YDS/2 sınav (yedek)" },
  ];

  const TYPES = ["Kelime", "Edat / phrasal verb", "Gramer", "Cloze", "Cümle tamamlama", "Çeviri", "Paragraf", "Diyalog", "Paragraf tamamlama", "İlgisiz cümle"];
  const CAUSES = ["Kelime bilmedim", "Gramer", "Mantık", "Süre", "Dikkat"];

  const EXTRA = [
    { title: "Tenses / Modals / Passive", items: [
      v("Modals konu anlatımı", yt("1iM_8bmfvuE"), "~"),
      v("Modals & Passives çıkmış sorular", yt("eb3Yi-VYZc8"), "~"),
      v("Active/Passive konu anlatımı", yt("7fniBwFdJpM"), "~"),
    ]},
    { title: "Conditionals", items: [v("\"If\" yapılarının en güzel anlatımı", yt("CGTyTFeOfdM"), "~")] },
    { title: "Noun / Relative clauses", items: [
      v("Noun Clauses çıkmış sorular ve taktikler", yt("3ag4fnkEw14"), "~"),
      v("Relative Clause konu anlatımı", yt("8dp4W6nYtlI"), "~"),
    ]},
    { title: "Gerund / Infinitive", items: [
      v("Gerunds & Infinitives çıkmış sorular", yt("ZxpEpuiR3Ww"), "~"),
      v("Gerunds-Infinitives örnek soru çözümleri", yt("rdKPYfuo37Y"), "~"),
    ]},
    { title: "Bağlaçlar", items: [
      v("Bağlaçlar soru çözümü", yt("VXnZZST92Vs"), "~"),
      v("Conjunctions soru çözümleri (çıkmış sorular)", yt("cK3Ky8D8NgY"), "~"),
    ]},
    { title: "Sentence Completion / Irrelevant Sentence", items: [
      v("Sentence Completion", yt("hIjHXhmlB-Q"), "~"),
      v("Irrelevant Sentence: Part 2", yt("sW0nFbwtVGM"), "~"),
      v("Irrelevant Sentence soru çözümü: test teknikleri", yt("QYfiBGJEx2I"), "~"),
      v("Irrelevant Sentence örnek soru çözümleri", yt("2nQaFsz-IO8"), "~"),
    ]},
    { title: "Çeviri", items: [
      v("Çeviri soruları nasıl çözülür", yt("b4b4VVXgA2Y"), "~"),
      v("Çeviri sorularını çözme taktikleri", yt("QGV-Vz9QXlQ"), "~"),
      v("YDS YÖKDİL YKS YDT İngilizce teknikleri oynatma listesi", pl("PLoYBfj2RjBM6YJStnNbtNu7VvdXexXVET"), "~"),
    ]},
    { title: "Kelime çalışması", items: [
      v("YDS kelime ezberleme taktikleri", yt("kWBvumsy7Gs"), "~"),
      v("YDS kelime çalışması (2022)", yt("szEZ44y0xcg"), "~"),
      v("YDS, YDT, YÖKDİL kelime çalışması: kelime teknikleri", yt("9y37GL0mDEQ"), "~"),
    ]},
    { title: "Soru çözümü", items: [v("YDS açıklamalı soru çözümleri", yt("nx725_EPlTs"), "~")] },
    { title: "Kanallar", items: [
      v("HAKKI HOCA", "https://www.youtube.com/HAKKIHOCA", "v"),
      v("English with Hüseyin Demirtaş (@hdingilizce)", "https://www.youtube.com/channel/UCR2SgFrRdoRrOxCAG-AYuxA", "v"),
      v("MODADİL oynatma listeleri (içeriği okunamadı)", "https://www.youtube.com/c/modadil/playlists"),
      v("Mesut Koyuncu kanalı (doğrulanamadı)", "https://www.youtube.com/channel/UCSWVBMS8jCNEy1MRvHsvnxQ"),
    ]},
  ];

  root.YDS_DATA = { PHASES, WEEKS, EXAMS, REAL_EXAM, DATES, TYPES, CAUSES, EXTRA };
})(typeof globalThis !== "undefined" ? globalThis : this);
