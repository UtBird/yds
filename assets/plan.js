/* Tarih hesapları ve "o gün ne yapılacak" mantığı. DOM'a dokunmaz, Node'da da çalışır. */
(function (root) {
  const { WEEKS, EXAMS } = root.YDS_DATA;

  const PLAN_START = "2026-11-04";
  const EXAM_DATE = "2027-03-28";
  const VOCAB_START = "2026-11-09";
  const DAY = 86400000;

  const toMs = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const fromMs = (ms) => new Date(ms).toISOString().slice(0, 10);
  const addDays = (iso, n) => fromMs(toMs(iso) + n * DAY);
  const diffDays = (a, b) => Math.round((toMs(a) - toMs(b)) / DAY);
  const dow = (iso) => new Date(toMs(iso)).getUTCDay();
  const isValidIso = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && fromMs(toMs(s)) === s;

  function todayIso(now = new Date()) {
    const p = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
  }

  const weekOf = (iso) => WEEKS.find((w) => iso >= w.start && iso <= w.end) || null;
  const examOn = (iso) => EXAMS.find((e) => e.date === iso) || null;
  const daysOfWeek = (w) => {
    const out = [];
    for (let d = w.start; d <= w.end; d = addDays(d, 1)) out.push(d);
    return out;
  };

  /* Pazartesi–Cumartesi sayacı. 9 Kasım = 1, 16 Ocak = 60. Pazar için null. */
  function studyDay(iso) {
    if (iso < VOCAB_START || dow(iso) === 0) return null;
    const days = diffDays(iso, VOCAB_START);
    return days - Math.floor(days / 7) + 1;
  }

  const dayLabel = (n) => (n <= 60 ? "Gün " + n : "Liste " + n);

  /* 1-3-7 tekrarı çalışma günü üzerinden sayılır; Pazarlar sayılmaz. */
  function vocabFor(iso) {
    const n = studyDay(iso);
    const w = weekOf(iso);
    if (!n || !w) return null;
    const reviews = [n - 1, n - 3, n - 7].filter((x) => x >= 1);
    let kind;
    if (n <= 54) kind = "new20";
    else if (n <= 60) kind = "special";
    else if (w.n === 21) kind = "reviewOnly";
    else kind = "new10";
    return { n, kind, reviews, reviewLabels: reviews.map(dayLabel) };
  }

  function vocabRange(w) {
    const nums = daysOfWeek(w).map(studyDay).filter((n) => n && n <= 60);
    return nums.length ? [nums[0], nums[nums.length - 1]] : null;
  }

  function vocabDetail(iso) {
    const vc = vocabFor(iso);
    if (!vc) return "";
    const rev = vc.reviews.length ? "Tekrar: " + vc.reviewLabels.join(", ") + "." : "İlk gün, tekrar listesi yok.";
    if (vc.kind === "new20") return `${dayLabel(vc.n)}: 20 yeni kelime ve eş anlamları. ${rev}`;
    if (vc.kind === "special") return `${dayLabel(vc.n)}: phrasal verb, edat, tekrar veya kelime testi (baskındaki içindekilerden doğrula). ${rev}`;
    if (vc.kind === "new10") return `${dayLabel(vc.n)}: okumadan ve deneme hatalarından 10 yeni kelime. ${rev}`;
    return `Yeni kelime yok. ${rev}`;
  }

  const hasPrep = (iso) => [2, 4].includes(dow(iso)) && iso >= VOCAB_START;

  function kelime(iso) {
    const prep = hasPrep(iso);
    return {
      id: "kelime",
      min: prep ? 40 : 30,
      title: "Kelime",
      detail: vocabDetail(iso) + (prep ? " Ek 10 dk: edat ve phrasal verb." : ""),
    };
  }
  const okuma = (min, detail) => ({
    id: "okuma", min, title: "Okuma",
    detail: detail || "Farklı alandan makale veya paragraf. Bilinmeyen kelimeler deftere.",
  });
  const hata = () => ({ id: "hata", min: 15, title: "Hata defteri", detail: "O günün hatalarını yaz." });
  const block = (id, min, title, detail, videos) => ({ id, min, title, detail, videos });

  const videosFor = (w, s) => (w.videos || []).filter((x) => !s || !x.s || x.s.includes(s));

  function konuVideo(w, s, name) {
    const vids = videosFor(w, s);
    const empty = vids.length ? "" : " Planda bu konu için video yok, kanalda konu adıyla ara.";
    return block("konu", 40, name + ": video + kitap", "Video (20–25 dk) ve kitaptaki ilgili bölüm." + empty, vids);
  }
  const konuSoru = (name) => block("soru", 35, name + ": sorular", "Süre tutarak çöz.");
  const paragrafGunu = () => block("paragraf", 75, "Süreli paragraf seti", "Süre tutarak çöz, ardından analiz.");

  function saturday(iso, w) {
    const range = vocabRange(w);
    const testTitle = range && range[1] - range[0] === 5 && range[1] <= 54 ? "120 kelimelik haftalık test" : "Kelime ve edat testi";
    const testDetail = range ? `Gün ${range[0]}–${range[1]} kelimeleri.` : "Bu haftanın kelimeleri ve edatlar.";
    const round2 = examOn(addDays(iso, -13));
    const repeatDetail = (w.n === 8 ? "H2–H7 hata defterini yeniden çöz." : "Son 2 haftanın hatalarını yeniden çöz.")
      + (round2 ? ` ${round2.name} denemesinin ikinci turu da bu hafta: yanlış ve şüpheli soruları yeniden çöz.` : "");
    if (w.n >= 14) {
      return [kelime(iso), block("test", 45, testTitle, testDetail), block("tekrar", 60, "Hata defteri tekrarı", repeatDetail), okuma(15)];
    }
    return [kelime(iso), block("test", 30, testTitle, testDetail), block("tekrar", 45, "Hata defteri tekrarı", repeatDetail), block("ceviri", 45, "10 çeviri sorusu", "Süre tutarak çöz.")];
  }

  function sunday(iso) {
    const ex = examOn(iso);
    if (iso === EXAM_DATE) {
      return [
        block("sinav", null, "2027-YDS/1, 10:15", "Bütün soruları işaretle, yanlış doğruyu götürmez. Takıldığın soruyu işaretle, geç, sonra dön."),
      ];
    }
    if (!ex) return [];
    const when = ex.q === 80
      ? (ex.examHour ? "Gerçek sınav saatinde: 10:15. Mümkün değilse 20:00–23:00." : "Müsaitsen 10:15'te, değilse 20:00–23:00.")
      : "Müsaitsen gündüz, değilse 20:00'den sonra.";
    const list = [block("deneme", ex.min, ex.name + " denemesi", `${ex.q} soru, ${ex.min} dk, kesintisiz, telefon kapalı. ${when} Tüm soruları işaretle.`)];
    if (ex.id === "tani" || ex.q === 40) {
      list.push(block("analiz", 60, "Deneme analizi", "En geç ertesi akşam. Soru tipine göre say, her yanlışın nedenini yaz, şansla doğruları yanlış say."));
    }
    return list;
  }

  /* weak: önceki denemede en çok yanlış yapılan soru tipleri (varsa). */
  function blocksFor(iso, weak = []) {
    const w = weekOf(iso);
    if (!w) return [];
    const d = dow(iso);
    if (d === 0) return sunday(iso);

    if (w.n === 1) {
      if (d === 6) {
        return [
          block("video", 40, "Kalan videoları bitir", "H1 videolarından izlemediklerin.", w.videos),
          block("hazirlik", 30, "Tanı denemesini hazırla", "Eski bir ÖSYM kitapçığı indir. Yarın 180 dk ayır."),
          okuma(30), hata(),
        ];
      }
      return [
        block("kitap", 40, "Kitapları incele", "İçindekiler sayfalarına bak. Stratejiler 1–2'de hangi konuların olduğunu not et."),
        block("video", 40, "Başlangıç videoları", "İzlediklerini işaretle.", w.videos),
        okuma(30), hata(),
      ];
    }

    if (w.n === 21) {
      if (d === 6) return [block("kontrol", null, "Çalışma yok", "Sınav giriş belgesini ve sınav yerini kontrol et. Hazırlıkları bitir.")];
      if (d === 5) return [block("hafif", 30, "Hafif tekrar", "Yeni soru çözme. Erken yat.")];
      const title = d === 1 ? "Tam 10 analizi + hata defteri" : "Hata defteri";
      return [
        block("hata", 25, title, "Tekrarı gelen soruları yeniden çöz."),
        block("kelime", 20, "Kelime tekrar listeleri", vocabDetail(iso)),
        block("paragraf", 25, "1 paragraf seti", "Süre tutarak çöz."),
      ];
    }

    if (d === 6) return saturday(iso, w);

    if (w.n >= 14) {
      const k = kelime(iso);
      const kayit = iso === "2027-02-03" ? [block("kayit", 15, "YDS/1 kaydını yap", "Son güne bırakma. Harç ve bilgileri osym.gov.tr üzerinden kontrol et.")] : [];
      if (d === 1) return [k, block("analiz", 90, "Önceki denemenin analizi", "Her yanlışı etiketle, hata defterine yaz."), okuma(15), hata()];
      if (d === 2 || d === 4) {
        const idx = d === 2 ? 0 : 1;
        const name = weak[idx] ? `Zayıf konu ${idx + 1}: ${weak[idx]}` : `Zayıf konu ${idx + 1}`;
        const det = weak[idx] ? "Video + 30 soru." : "Video + 30 soru. Denemeler sayfasına yanlışları girince konu burada görünür.";
        return [k, block("zayif", 75, name, det), okuma(20), hata()];
      }
      if (d === 3) return [...kayit, k, block("paragraf", 75, "Süreli paragraf seti (6 paragraf)", "Ardından analiz."), okuma(kayit.length ? 15 : 30), hata()];
      return [k, block("karisik", 75, "Çeviri + cloze karışık", "Süre tutarak çöz."), okuma(30), hata()];
    }

    if (w.n === 12 || w.n === 13) {
      const k = kelime(iso);
      const first = w.n === 12 || d <= 2;
      const topic = w.n === 12 ? "İngilizce→Türkçe çeviri" : first ? "Türkçe→İngilizce çeviri" : "Paragraf soru tipleri";
      const vids = w.n === 13 && first ? [] : w.videos;
      const detail = first ? "10 çeviri sorusu, süre tutarak." : "Soru tiplerini ayırarak çöz.";
      const read = w.n === 13 ? "Mesut Koyuncu oynatma listesinden devam edebilirsin. Bilinmeyen kelimeler deftere." : undefined;
      if (d === 1) {
        return [k, block("analiz", 60, "Önceki denemenin analizi", "Her yanlışı etiketle, hata defterine yaz."), block("konu", 30, topic, detail, vids), okuma(15, read), hata()];
      }
      if (d === 3) {
        return [k, paragrafGunu(), block("ceviri", 30, "10 çeviri sorusu", "Süre tutarak çöz."), hata()];
      }
      return [k, block("konu", d === 5 ? 75 : 65, topic, detail, vids), okuma(30, read), hata()];
    }

    if (w.n === 9) {
      const k = kelime(iso);
      if (d === 3) return [k, paragrafGunu(), okuma(30), hata()];
      const tur = d === 1 || d === 4 ? "Çıkmış gramer soruları" : "Çıkmış kelime soruları";
      const flex = iso === "2026-12-31" || iso === "2027-01-01" ? " Yılbaşı: bu blok esnek, kelime ve hata defterini bırakma." : "";
      return [k, block("cikmis", 75, tur, "ÖSYM kitapçıklarından, soru tipine göre." + flex, d === 1 ? w.videos : []), okuma(d === 2 || d === 4 ? 20 : 30), hata()];
    }

    /* Standart konu haftası: H2–H8, H10, H11 */
    const k = kelime(iso);
    if (d === 1) return [k, konuVideo(w, "A", w.a), konuSoru(w.a), okuma(30), hata()];
    if (d === 2) return [k, block("soru", 75, w.a + ": sorular", "30–40 soru, süre tutarak."), okuma(20), hata()];
    if (d === 3) return [k, paragrafGunu(), okuma(30), hata()];
    if (d === 4) return [k, konuVideo(w, "B", w.b), konuSoru(w.b), okuma(20), hata()];
    if (w.n === 8) return [k, block("tekrar", 75, "Gramer tekrarı", "H2–H7 hata defterini yeniden çöz."), okuma(30), hata()];
    return [k, block("soru", 75, w.b + " sorular + 2 paragraf", "30–40 soru, ardından 2 paragraf."), okuma(30), hata()];
  }

  /* Blokları 20:00'den başlayarak saatlere yerleştirir. */
  function withTimes(blocks, iso) {
    if (dow(iso) === 0) return blocks.map((b) => ({ ...b, time: null }));
    let t = 20 * 60;
    const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    return blocks.map((b) => {
      if (!b.min) return { ...b, time: null };
      const time = `${fmt(t)}–${fmt(t + b.min)}`;
      t += b.min;
      return { ...b, time };
    });
  }

  const score = (correct) => correct * 1.25;

  root.YDS_PLAN = {
    PLAN_START, EXAM_DATE, VOCAB_START,
    addDays, diffDays, dow, isValidIso, todayIso, weekOf, examOn, daysOfWeek,
    studyDay, vocabFor, vocabRange, blocksFor, withTimes, score, dayLabel,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
