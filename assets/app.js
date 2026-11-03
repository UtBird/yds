/* Arayüz: yönlendirme, kayıt ve sayfalar. */
(function () {
  const D = window.YDS_DATA;
  const P = window.YDS_PLAN;
  const KEY = "yds95.v1";

  /* ---------- Kayıt ---------- */
  const empty = () => ({ checks: {}, exams: {}, errors: [] });

  function normalize(x) {
    if (!x || typeof x !== "object" || Array.isArray(x)) return null;
    const isObj = (o) => o && typeof o === "object" && !Array.isArray(o);
    if (!isObj(x.checks) || !isObj(x.exams) || !Array.isArray(x.errors)) return null;
    return { checks: x.checks, exams: x.exams, errors: x.errors.filter(isObj) };
  }

  let storageOk = true;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      return normalize(JSON.parse(raw)) || empty();
    } catch (e) {
      storageOk = false;
      return empty();
    }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      storageOk = true;
    } catch (e) {
      storageOk = false;
      setStatus("Kaydedilemedi. Tarayıcı depolaması kapalı olabilir.");
    }
  }
  let state = load();

  /* ---------- Yardımcılar ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, val] of Object.entries(attrs || {})) {
      if (val == null || val === false) continue;
      if (k === "class") el.className = val;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), val);
      else if (k === "checked" || k === "open" || k === "selected" || k === "disabled") el[k] = !!val;
      else if (k === "value") el.value = val;
      else el.setAttribute(k, val === true ? "" : val);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : String(kid));
    }
    return el;
  }

  /* append dizileri ve boş değerleri metne çevirir; bu yardımcı çevirmez. */
  function put(el, ...kids) {
    el.append(...kids.flat(Infinity).filter((k) => k != null && k !== false));
  }

  const SVG = "http://www.w3.org/2000/svg";
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(SVG, tag);
    for (const [k, val] of Object.entries(attrs || {})) {
      if (val != null) el.setAttribute(k, val);
    }
    kids.forEach((kid) => el.append(kid));
    return el;
  }

  const utc = (iso) => new Date(iso + "T00:00:00Z");
  const fmt = (iso, opts) => new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", ...opts }).format(utc(iso));
  const fDay = (iso) => fmt(iso, { day: "numeric", month: "long" });
  const fShort = (iso) => fmt(iso, { day: "numeric", month: "short" });
  const fFull = (iso) => fmt(iso, { day: "numeric", month: "long", weekday: "long" });
  const fDow = (iso) => fmt(iso, { weekday: "short" });
  const num = (n) => String(n).replace(".", ",");
  const fRange = (w) => `${fShort(w.start)} – ${fShort(w.end)}`;
  const isChecked = (id) => !!state.checks[id];
  const dayKey = (iso, id) => `${iso}:${id}`;
  const today = () => P.todayIso();

  function setCheck(id, val) {
    if (val) state.checks[id] = true;
    else delete state.checks[id];
    save();
  }

  /* Yeniden çizerken kaydırma konumunu ve odağı korur. */
  function keep(draw) {
    const y = scrollY;
    const id = document.activeElement && document.activeElement.id;
    draw();
    scrollTo(0, y);
    const el = id && document.getElementById(id);
    if (el) el.focus({ preventScroll: true });
  }

  function setStatus(msg) {
    document.getElementById("backup-status").textContent = msg;
  }

  const MARKS = {
    v: ["doğrulandı", "Hoca veya kanal adı doğrulandı"],
    "~": ["kesin değil", "Kanal arama sonucundan çıkarıldı, kesin değil"],
    seri: ["seri", "Sahibi doğrulanamayan numaralı gramer serisi"],
  };

  function videoItem(video, pageRender) {
    const id = "v:" + video.u;
    const domId = "cb-" + video.u.replace(/[^a-zA-Z0-9]/g, "");
    const mark = MARKS[video.m];
    return h("li", { class: "video" },
      h("input", {
        type: "checkbox", class: "bubble small", id: domId, checked: isChecked(id),
        "aria-label": video.t + " izlendi",
        onchange: (e) => { setCheck(id, e.target.checked); pageRender && pageRender(); },
      }),
      h("a", { href: video.u, target: "_blank", rel: "noopener" }, video.t),
      mark && h("span", { class: "tag tag-" + (video.m === "~" ? "maybe" : video.m), title: mark[1] }, mark[0]));
  }

  /* ---------- Deneme hesapları ---------- */
  const examRec = (id) => state.exams[id] || {};
  const correctOf = (ex) => {
    const c = examRec(ex.id).correct;
    return Number.isInteger(c) ? c : null;
  };
  const fullExams = () => D.EXAMS.filter((e) => e.q === 80);
  const latestFull = () => {
    const done = fullExams().filter((e) => correctOf(e) != null);
    return done.length ? done[done.length - 1] : null;
  };

  function weakTopics(iso) {
    const past = D.EXAMS.filter((e) => e.date < iso && Object.keys(examRec(e.id).wrong || {}).length);
    if (!past.length) return [];
    const wrong = examRec(past[past.length - 1].id).wrong;
    return Object.entries(wrong)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => k);
  }

  const dayBlocks = (iso) => P.withTimes(P.blocksFor(iso, weakTopics(iso)), iso);
  function dayProgress(iso) {
    const bs = dayBlocks(iso);
    return { total: bs.length, done: bs.filter((b) => isChecked(dayKey(iso, b.id))).length };
  }

  /* ---------- 80 yuvarlak ---------- */
  function answerSheet() {
    const ex = latestFull();
    const correct = ex ? correctOf(ex) : 0;
    const label = ex
      ? `${ex.name} denemesi: 80 sorudan ${correct} doğru. Taban 60, hedef 76.`
      : "Henüz deneme girilmedi. Taban 60 doğru, hedef 76 doğru.";
    const grid = h("div", { class: "sheet", role: "img", "aria-label": label });
    for (let i = 1; i <= 80; i++) {
      grid.append(h("span", {
        class: "cell" + (i <= correct ? " on" : "") + (i === 60 ? " base" : "") + (i === 76 ? " goal" : ""),
      }));
    }
    return h("div", { class: "sheet-box" },
      h("div", { class: "sheet-head" },
        h("strong", null, ex ? `${ex.name}: ${correct} doğru, ${num(P.score(correct))} puan` : "Henüz deneme sonucu yok"),
      ),
      grid,
      h("p", { class: "sheet-key" },
        h("span", null, h("i", { class: "key base" }), "60. soru = 75 puan"),
        h("span", null, h("i", { class: "key goal" }), "76. soru = 95 puan")));
  }

  /* ---------- Bugün ---------- */
  function renderToday(root, param) {
    const real = today();
    let iso = param && P.isValidIso(param) ? param : real;
    let notice = null;
    const explicit = param && P.isValidIso(param);
    if (!explicit && iso < P.PLAN_START) {
      notice = `Plan ${fDay(P.PLAN_START)} akşamı başlıyor. İlk günü aşağıda görebilirsin.`;
      iso = P.PLAN_START;
    }
    if (!explicit && iso > P.EXAM_DATE) {
      notice = "Sınav tarihi geçti. Son günü gösteriyorum. Sonuç 21 Nisan 2027'de açıklanır.";
      iso = P.EXAM_DATE;
    }
    if (iso < P.PLAN_START) iso = P.PLAN_START;
    if (iso > P.EXAM_DATE) iso = P.EXAM_DATE;

    const w = P.weekOf(iso);
    const left = P.diffDays(P.EXAM_DATE, real);
    const blocks = dayBlocks(iso);
    const prog = dayProgress(iso);
    const ex = P.examOn(iso);

    const redraw = () => keep(() => renderToday(clear(root), param));

    const prev = iso > P.PLAN_START ? P.addDays(iso, -1) : null;
    const next = iso < P.EXAM_DATE ? P.addDays(iso, 1) : null;

    const dayNav = h("div", { class: "day-nav" },
      prev ? h("a", { class: "btn", href: "#bugun/" + prev, "aria-label": "Önceki gün" }, "‹") : h("span", { class: "btn off", "aria-hidden": "true" }, "‹"),
      iso !== real && real >= P.PLAN_START && real <= P.EXAM_DATE && h("a", { class: "btn", href: "#bugun" }, "Bugüne dön"),
      next ? h("a", { class: "btn", href: "#bugun/" + next, "aria-label": "Sonraki gün" }, "›") : h("span", { class: "btn off", "aria-hidden": "true" }, "›"));

    const list = blocks.length
      ? h("ol", { class: "tasks" }, blocks.map((b) => {
          const id = dayKey(iso, b.id);
          const domId = "cb-" + b.id;
          return h("li", { class: "task" + (isChecked(id) ? " done" : "") },
            h("input", {
              type: "checkbox", class: "bubble", id: domId, checked: isChecked(id),
              onchange: (e) => { setCheck(id, e.target.checked); redraw(); },
            }),
            h("div", { class: "task-body" },
              h("label", { for: domId },
                b.time && h("span", { class: "time" }, b.time),
                h("span", { class: "task-title" }, b.title)),
              h("p", { class: "task-detail" }, b.detail),
              b.videos && b.videos.length ? h("ul", { class: "videos" }, b.videos.map((x) => videoItem(x, redraw))) : null));
        }))
      : h("div", { class: "rest" }, h("h2", null, "Dinlenme günü"), h("p", null, "Bu Pazar planlı çalışma yok."));

    const nextExam = D.EXAMS.find((e) => e.date > iso);
    const upcoming = [
      ...(nextExam ? [{ date: nextExam.date, label: nextExam.name + " denemesi" + (nextExam.target ? ` · hedef ${nextExam.approx ? "≈" : "≥"} ${nextExam.target}` : "") }] : []),
      ...D.DATES.filter((d) => (d.end || d.date) >= iso),
    ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).slice(0, 5);
    const due = state.errors.filter((e) => e.review && e.review <= iso && !e.result);

    const aside = h("aside", { class: "side" },
      answerSheet(),
      h("div", { class: "card" },
        h("h2", null, "Sıradaki"),
        h("ul", { class: "plain" },
          upcoming.map((d) => h("li", { class: d.key ? "key-date" : null },
            h("span", { class: "when" }, d.end ? `${fShort(d.date)} – ${fShort(d.end)}` : fDay(d.date)),
            h("span", null, d.label))))),
      due.length ? h("a", { class: "card due", href: "#hatalar" }, h("strong", null, `${due.length} hatanın tekrarı geldi`), h("span", null, "Hata defterini aç")) : null);

    put(root, 
      notice && h("p", { class: "callout" }, notice),
      !storageOk && h("p", { class: "callout warn" }, "Tarayıcı depolamasına erişilemiyor. İşaretlerin kaydedilmeyecek."),
      h("div", { class: "today-head" },
        h("div", null,
          h("p", { class: "eyebrow" }, `H${w.n} · ${w.title}`),
          h("h1", { tabindex: "-1" }, fFull(iso))),
        h("p", { class: "count" }, left > 0 ? h("b", null, left) : null, left > 0 ? " gün kaldı" : left === 0 ? "Sınav bugün" : "Sınav geçti")),
      h("div", { class: "today-bar" },
        dayNav,
        blocks.length ? h("p", { class: "muted" }, `${prog.done}/${prog.total} blok`) : null),
      h("div", { class: "today-grid" },
        h("div", null,
          ex && ex.target && h("p", { class: "callout" }, `Bugünün denemesinde hedef ${ex.approx ? "yaklaşık " : ""}${ex.target} doğru. Bitince `, h("a", { href: "#denemeler" }, "sonucu gir"), "."),
          ex && !ex.target && h("p", { class: "callout" }, "Bitince ", h("a", { href: "#denemeler" }, "sonucu gir"), "."),
          list),
        aside));
  }

  /* ---------- Takvim ---------- */
  const openWeeks = new Set();
  let openWeeksInit = false;

  function renderCalendar(root) {
    const real = today();
    const cur = P.weekOf(real) || (real < P.PLAN_START ? D.WEEKS[0] : null);
    if (!openWeeksInit) {
      if (cur) openWeeks.add(cur.n);
      openWeeksInit = true;
    }

    put(root, 
      h("p", { class: "eyebrow" }, "Takvim"),
      h("h1", { tabindex: "-1" }, "21 hafta"),
      h("p", { class: "lede" }, "4 Kasım 2026'dan 28 Mart 2027'ye. Her satırdaki yuvarlaklar günleri gösterir, tıklayınca o güne gidersin."),
      h("p", { class: "legend" },
        h("span", { class: "tag tag-v" }, "doğrulandı"), " hoca veya kanal adı doğrulandı ",
        h("span", { class: "tag tag-maybe" }, "kesin değil"), " kanal arama sonucundan çıkarıldı ",
        h("span", { class: "tag tag-seri" }, "seri"), " sahibi doğrulanamadı"));

    D.PHASES.forEach((ph) => {
      put(root, h("h2", { class: "phase" }, h("span", { class: "mono" }, ph.range), " ", ph.title));
      D.WEEKS.filter((w) => w.phase === ph.id).forEach((w) => {
        const isCur = cur && cur.n === w.n;
        const range = P.vocabRange(w);
        const days = P.daysOfWeek(w);
        const details = h("details", {
          class: "week" + (isCur ? " current" : ""), open: openWeeks.has(w.n),
          ontoggle: (e) => {
            if (!e.target.isConnected) return;
            if (e.target.open) openWeeks.add(w.n); else openWeeks.delete(w.n);
          },
        },
          h("summary", null,
            h("span", { class: "wk-n mono" }, "H" + w.n),
            h("span", { class: "wk-main" },
              h("span", { class: "wk-title" }, w.title),
              h("span", { class: "wk-meta" }, fRange(w), range ? ` · kelime günleri ${range[0]}–${range[1]}` : "", isCur ? " · bu hafta" : "")),
            h("span", { class: "strip" }, days.map((d) => {
              const pr = dayProgress(d);
              const st = pr.total && pr.done === pr.total ? " full" : pr.done ? " part" : "";
              return h("a", {
                class: "strip-day" + st + (d === real ? " is-today" : "") + (P.examOn(d) || d === P.EXAM_DATE ? " is-exam" : ""),
                href: "#bugun/" + d,
                title: `${fFull(d)}: ${pr.done}/${pr.total} blok`,
                "aria-label": `${fFull(d)}, ${pr.done}/${pr.total} blok`,
                onclick: (e) => e.stopPropagation(),
              }, h("span", { "aria-hidden": "true" }, fDow(d).charAt(0)));
            }))),
          h("div", { class: "wk-body" },
            (w.a || w.b) && h("dl", { class: "ab" },
              h("div", null, h("dt", null, "A"), h("dd", null, w.a, " · Pzt video, Sal soru")),
              h("div", null, h("dt", null, "B"), h("dd", null, w.b, " · Per video, Cuma soru"))),
            w.notes && w.notes.length ? h("ul", { class: "notes" }, w.notes.map((n) => h("li", null, n))) : null,
            w.videos.length ? h("ul", { class: "videos" }, w.videos.map((x) => videoItem(x))) : null));
        put(root, details);
      });
    });
  }

  /* ---------- Denemeler ---------- */
  function chart() {
    const avail = document.getElementById("main").clientWidth - 66;
    const W = Math.max(280, Math.min(1000, avail)), H = W < 500 ? 240 : 300, L = 30, R = 52, T = 16, B = 34;
    const pts = fullExams();
    const all = [...pts.map((e) => e.date), D.REAL_EXAM.date];
    const span = P.diffDays(all[all.length - 1], all[0]);
    const x = (iso) => L + (P.diffDays(iso, all[0]) / span) * (W - L - R);
    const y = (v) => T + (1 - v / 80) * (H - T - B);

    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": "Tam deneme doğru sayıları ile hedef çizgisi. Aynı veriler aşağıdaki tabloda." });

    [0, 20, 40, 60, 80].forEach((v) => {
      svg.append(s("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: v === 60 ? "grid base-line" : "grid" }));
      const t = s("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end", class: "tick" });
      t.textContent = v;
      svg.append(t);
    });

    const ticks = [["2026-11-08", "Kas"], ["2027-01-17", "Oca"], ["2027-02-07", "Şub"], ["2027-03-07", "Mar"]];
    ticks.forEach(([d, label]) => {
      const t = s("text", { x: x(d), y: H - 10, "text-anchor": "middle", class: "tick" });
      t.textContent = label;
      svg.append(t);
    });

    const targets = [...pts.filter((e) => e.target).map((e) => [e.date, e.target]), [D.REAL_EXAM.date, D.REAL_EXAM.target]];
    svg.append(s("polyline", { points: targets.map(([d, v]) => `${x(d)},${y(v)}`).join(" "), class: "line-target" }));
    const tl = s("text", { x: W - R + 8, y: y(D.REAL_EXAM.target) + 4, class: "direct" });
    tl.textContent = "Hedef";
    svg.append(tl);

    const done = pts.filter((e) => correctOf(e) != null);
    if (done.length > 1) {
      svg.append(s("polyline", { points: done.map((e) => `${x(e.date)},${y(correctOf(e))}`).join(" "), class: "line-actual" }));
    }
    done.forEach((e) => svg.append(s("circle", { cx: x(e.date), cy: y(correctOf(e)), r: 5, class: "dot-actual" })));
    if (done.length) {
      const last = done[done.length - 1];
      const al = s("text", { x: x(last.date) + 10, y: y(correctOf(last)) + 16, class: "direct" });
      al.textContent = "Sonuç";
      svg.append(al);
    }

    /* Üzerine gelince en yakın deneme */
    const box = h("div", { class: "chart-box" }, svg);
    const tip = h("div", { class: "tip", hidden: true });
    const cross = s("line", { y1: T, y2: H - B, class: "cross", visibility: "hidden" });
    svg.append(cross);
    box.append(tip);

    const showAt = (clientX) => {
      const r = svg.getBoundingClientRect();
      const vx = ((clientX - r.left) / r.width) * W;
      let best = pts[0];
      pts.forEach((e) => { if (Math.abs(x(e.date) - vx) < Math.abs(x(best.date) - vx)) best = e; });
      const c = correctOf(best);
      const px = x(best.date);
      cross.setAttribute("x1", px);
      cross.setAttribute("x2", px);
      cross.setAttribute("visibility", "visible");
      tip.replaceChildren(
        h("strong", null, best.name), h("span", null, fDay(best.date)),
        h("span", null, c != null ? `${c} doğru · ${num(P.score(c))} puan` : "Sonuç yok"),
        best.target ? h("span", null, `Hedef ${best.approx ? "≈" : "≥"} ${best.target}`) : null);
      tip.hidden = false;
      const left = (px / W) * r.width;
      tip.style.left = Math.min(Math.max(left, 70), r.width - 70) + "px";
    };
    const hide = () => { tip.hidden = true; cross.setAttribute("visibility", "hidden"); };
    svg.addEventListener("pointermove", (e) => showAt(e.clientX));
    svg.addEventListener("pointerdown", (e) => showAt(e.clientX));
    svg.addEventListener("pointerleave", hide);

    return h("figure", { class: "chart-fig" },
      h("figcaption", null, h("strong", null, "Tam denemelerde doğru sayısı"),
        h("span", { class: "chart-legend" },
          h("span", null, h("i", { class: "lg actual" }), "Sonuç"),
          h("span", null, h("i", { class: "lg target" }), "Hedef"))),
      box);
  }

  function decisions() {
    const out = [];
    const t4 = D.EXAMS.find((e) => e.id === "tam4");
    const c4 = correctOf(t4);
    if (c4 != null && c4 < 60) {
      out.push(h("p", { class: "callout warn" }, h("strong", null, `Tam 4: ${c4} doğru. 75 tabanı risk altında. `), "Yeni konu açma, kelime ve paragraf saatlerini artır, en zayıf soru tipine odaklan."));
    }
    const march = D.EXAMS.filter((e) => e.date >= "2027-03-01" && correctOf(e) != null).pop();
    if (march && march.target - correctOf(march) >= 4) {
      out.push(h("p", { class: "callout warn" }, h("strong", null, `${march.name}: hedefin ${march.target - correctOf(march)} doğru gerisinde. `), "Plan değişmez. Zayıf soru tipine hafta içi ek 30 dk ver."));
    }
    return out;
  }

  function renderExams(root) {
    const redraw = () => keep(() => renderExams(clear(root)));
    const real = today();
    const rows = D.EXAMS.map((e) => {
      const c = correctOf(e);
      const diff = c != null && e.target ? c - e.target : null;
      const rec = examRec(e.id);
      const inputId = "exam-" + e.id;
      const wrongTotal = Object.values(rec.wrong || {}).reduce((a, b) => a + b, 0);
      return h("details", {
        class: "exam" + (e.date === real ? " current" : ""), open: openExams.has(e.id),
        ontoggle: (ev) => { if (!ev.target.isConnected) return; if (ev.target.open) openExams.add(e.id); else openExams.delete(e.id); },
      },
        h("summary", null,
          h("span", { class: "ex-name" }, e.name, h("small", null, fDay(e.date))),
          h("span", { class: "ex-target" }, h("small", null, "Hedef"), e.target ? `${e.approx ? "≈" : "≥"} ${e.target}` : "—"),
          h("span", { class: "ex-result" }, h("small", null, "Doğru"), c != null ? `${c}/${e.q}` : "—"),
          h("span", { class: "ex-score" }, h("small", null, "Puan"), c != null && e.q === 80 ? num(P.score(c)) : "—"),
          h("span", { class: "ex-diff" + (diff != null && diff < 0 ? " behind" : "") }, h("small", null, "Fark"), diff != null ? (diff >= 0 ? "+" : "−") + Math.abs(diff) : "—")),
        h("div", { class: "ex-body" },
          h("div", { class: "field" },
            h("label", { for: inputId }, `Doğru sayısı (0–${e.q})`),
            h("input", {
              id: inputId, type: "number", inputmode: "numeric", min: 0, max: e.q, step: 1, value: c != null ? c : "",
              onchange: (ev) => {
                const raw = ev.target.value.trim();
                const rc = state.exams[e.id] || (state.exams[e.id] = {});
                if (raw === "") delete rc.correct;
                else {
                  const n = Math.round(Number(raw));
                  if (!Number.isFinite(n)) return;
                  rc.correct = Math.min(Math.max(n, 0), e.q);
                }
                save(); redraw();
              },
            })),
          h("fieldset", null,
            h("legend", null, "Soru tipine göre yanlış", wrongTotal ? ` (toplam ${wrongTotal})` : ""),
            h("div", { class: "wrong-grid" }, D.TYPES.map((t, i) => {
              const fid = `wrong-${e.id}-${i}`;
              const val = (rec.wrong || {})[t];
              return h("div", { class: "field small" },
                h("label", { for: fid }, t),
                h("input", {
                  id: fid, type: "number", inputmode: "numeric", min: 0, max: e.q, step: 1, value: val != null ? val : "",
                  onchange: (ev) => {
                    const rc = state.exams[e.id] || (state.exams[e.id] = {});
                    rc.wrong = rc.wrong || {};
                    const raw = ev.target.value.trim();
                    const n = Math.round(Number(raw));
                    if (raw === "" || !Number.isFinite(n) || n <= 0) delete rc.wrong[t];
                    else rc.wrong[t] = Math.min(n, e.q);
                    save(); redraw();
                  },
                }));
            })),
            h("p", { class: "muted small-note" }, "Şansla doğru yaptıklarını da yanlış say. En çok yanlışlı 2 tip, deneme fazında Salı ve Perşembe'nin zayıf konusu olur."))));
    });

    put(root, 
      h("p", { class: "eyebrow" }, "Denemeler"),
      h("h1", { tabindex: "-1" }, "1 tanı, 2 yarım, 10 tam"),
      h("p", { class: "lede" }, "Sonucu girmek için satıra dokun. Kilometre taşları tahmindir, tanı sonucuna göre kaydır. ≈ işaretli hedefler iki taş arasındaki ara değerdir."),
      decisions(),
      chart(),
      h("div", { class: "exam-list" }, rows));
  }
  const openExams = new Set();

  /* ---------- Hata defteri ---------- */
  const errFilter = { type: "", onlyDue: false };

  function renderErrors(root) {
    const redraw = () => keep(() => renderErrors(clear(root)));
    const real = today();
    const refDate = real < P.PLAN_START ? P.PLAN_START : real;

    const select = (id, name, opts) => h("select", { id, name, required: true },
      h("option", { value: "" }, "Seç"), opts.map((o) => h("option", { value: o }, o)));

    const form = h("form", {
      class: "err-form",
      onsubmit: (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        const date = String(f.get("date"));
        if (!P.isValidIso(date)) return;
        state.errors.unshift({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          date,
          source: String(f.get("source")).trim(),
          type: String(f.get("type")),
          cause: String(f.get("cause")),
          note: String(f.get("note")).trim(),
          review: P.addDays(date, 14),
          result: "",
        });
        save(); redraw();
        const first = document.getElementById("err-source");
        if (first) first.focus();
      },
    },
      h("div", { class: "field" }, h("label", { for: "err-date" }, "Tarih"), h("input", { id: "err-date", name: "date", type: "date", required: true, value: refDate })),
      h("div", { class: "field" }, h("label", { for: "err-source" }, "Kaynak"), h("input", { id: "err-source", name: "source", type: "text", required: true, maxlength: 80, placeholder: "Tam 1, soru 14" })),
      h("div", { class: "field" }, h("label", { for: "err-type" }, "Soru tipi"), select("err-type", "type", D.TYPES)),
      h("div", { class: "field" }, h("label", { for: "err-cause" }, "Hata nedeni"), select("err-cause", "cause", D.CAUSES)),
      h("div", { class: "field wide" }, h("label", { for: "err-note" }, "Doğrusu ve neden"), h("input", { id: "err-note", name: "note", type: "text", maxlength: 300 })),
      h("button", { class: "btn primary", type: "submit" }, "Ekle"));

    const open = state.errors.filter((e) => e.result !== "Doğru");
    const groups = {};
    open.forEach((e) => {
      const k = `${e.type} · ${e.cause}`;
      groups[k] = (groups[k] || 0) + 1;
    });
    const repeat = Object.entries(groups).filter(([, n]) => n >= 3);
    const dueCount = state.errors.filter((e) => e.review <= real && !e.result).length;

    const shown = state.errors.filter((e) => (!errFilter.type || e.type === errFilter.type) && (!errFilter.onlyDue || (e.review <= real && !e.result)));

    const table = state.errors.length
      ? h("div", { class: "table-wrap" }, h("table", { class: "err-table" },
          h("thead", null, h("tr", null, ["Tarih", "Kaynak", "Tip", "Neden", "Doğrusu ve neden", "Tekrar", "Sonuç", ""].map((t) => h("th", { scope: "col" }, t)))),
          h("tbody", null, shown.map((e) => h("tr", { class: e.review <= real && !e.result ? "due-row" : null },
            h("td", { class: "nowrap" }, P.isValidIso(e.date) ? fShort(e.date) : ""),
            h("td", null, e.source),
            h("td", null, e.type),
            h("td", null, e.cause),
            h("td", null, e.note),
            h("td", { class: "nowrap" }, P.isValidIso(e.review) ? fShort(e.review) : ""),
            h("td", null, h("select", {
              id: "res-" + e.id, "aria-label": "Tekrar sonucu",
              onchange: (ev) => { e.result = ev.target.value; save(); redraw(); },
            }, ["", "Doğru", "Yanlış"].map((o) => h("option", { value: o, selected: e.result === o }, o || "Bekliyor")))),
            h("td", null, h("button", {
              type: "button", class: "btn link", "aria-label": "Satırı sil: " + e.source,
              onclick: () => {
                if (!confirm("Bu satır silinsin mi?")) return;
                state.errors = state.errors.filter((x) => x !== e);
                save(); redraw();
              },
            }, "Sil")))))))
      : h("p", { class: "empty" }, "Henüz hata yok. Yanlış veya şansla doğru yaptığın her soruyu buraya yaz.");

    put(root, 
      h("p", { class: "eyebrow" }, "Hata defteri"),
      h("h1", { tabindex: "-1" }, state.errors.length ? `${state.errors.length} kayıt` : "Boş defter"),
      h("p", { class: "lede" }, "Tekrar tarihi 14 gün sonraya otomatik atanır. Cumartesi günleri son 2 haftanın hatalarını yeniden çöz."),
      repeat.map(([k, n]) => h("p", { class: "callout warn" }, h("strong", null, `${k}: ${n} açık hata. `), "Bu konuya ek bir akşam ayır.")),
      form,
      state.errors.length ? h("div", { class: "err-tools" },
        h("div", { class: "field inline" }, h("label", { for: "filter-type" }, "Soru tipi"),
          h("select", { id: "filter-type", onchange: (ev) => { errFilter.type = ev.target.value; redraw(); } },
            h("option", { value: "", selected: !errFilter.type }, "Hepsi"),
            D.TYPES.map((t) => h("option", { value: t, selected: errFilter.type === t }, t)))),
        h("label", { class: "check-inline" },
          h("input", { type: "checkbox", id: "filter-due", checked: errFilter.onlyDue, onchange: (ev) => { errFilter.onlyDue = ev.target.checked; redraw(); } }),
          ` Tekrarı gelenler (${dueCount})`)) : null,
      table);
  }

  /* ---------- Rehber ---------- */
  let extraDone = false;
  function fillExtras() {
    if (extraDone) return;
    extraDone = true;
    document.getElementById("extra-videos").append(...D.EXTRA.map((g) =>
      h("div", { class: "extra" }, h("h3", null, g.title), h("ul", { class: "videos" }, g.items.map((x) => videoItem(x))))));
  }

  /* ---------- Yedek ---------- */
  document.getElementById("export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = h("a", { href: URL.createObjectURL(blob), download: `yds95-yedek-${today()}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setStatus("Yedek indirildi.");
  });

  document.getElementById("import-input").addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    try {
      const data = normalize(JSON.parse(await file.text()));
      if (!data) throw new Error("bad");
      if (!confirm("Bu yedek mevcut verilerin yerine geçecek. Devam edilsin mi?")) return;
      state = data;
      save();
      setStatus("Yedek yüklendi.");
      route();
    } catch (e) {
      setStatus("Bu dosya geçerli bir yedek değil.");
    }
  });

  /* ---------- Yönlendirme ---------- */
  const view = document.getElementById("view");
  const guide = document.getElementById("rehber-view");

  function clear(el) {
    el.replaceChildren();
    return el;
  }

  function route() {
    const [page, param] = location.hash.replace(/^#/, "").split("/");
    const name = ["bugun", "takvim", "denemeler", "hatalar", "rehber"].includes(page) ? page : "bugun";
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    const isGuide = name === "rehber";
    guide.hidden = !isGuide;
    view.hidden = isGuide;
    clear(view);

    if (name === "bugun") renderToday(view, param);
    if (name === "takvim") renderCalendar(view);
    if (name === "denemeler") renderExams(view);
    if (name === "hatalar") renderErrors(view);
    if (isGuide) fillExtras();

    const anchor = isGuide && param && document.getElementById(param);
    if (anchor && anchor.classList.contains("doc")) {
      anchor.scrollIntoView();
    } else {
      scrollTo(0, 0);
      const h1 = (isGuide ? guide : view).querySelector("h1");
      if (h1 && document.activeElement !== document.body) h1.focus({ preventScroll: true });
    }
    document.title = ({ bugun: "Bugün", takvim: "Takvim", denemeler: "Denemeler", hatalar: "Hata defteri", rehber: "Rehber" })[name] + " · YDS 95+";
  }

  window.addEventListener("hashchange", route);

  let lastWidth = innerWidth;
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (innerWidth === lastWidth) return;
      lastWidth = innerWidth;
      if (location.hash.startsWith("#denemeler")) keep(() => renderExams(clear(view)));
    }, 150);
  });

  route();
})();
