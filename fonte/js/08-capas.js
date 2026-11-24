// ================= Capas =================
// Filmes, séries e desenhos: pôster do TMDB, pela ponte "tmdb" no Supabase (a chave fica lá, em segredo).
// HQs: capa do Comic Vine, guardada na tabela "capas_hq" do Supabase; o site só lê de lá.
// Dentro do Claude (artefato) não dá para carregar nada de fora, então ficam as capas desenhadas.
const CAPAS_ONLINE = FORA_DO_CLAUDE;
const TMDB = { ativo: CAPAS_ONLINE, cache: null, fila: [], rodando: 0, falhou: false };
const LINGUA_TMDB = "pt-BR";
const CABECALHO_SUPABASE = { Authorization: "Bearer " + SUPABASE_ANON, apikey: SUPABASE_ANON };

function tmdbCache() {
  if (!TMDB.cache) { try { TMDB.cache = JSON.parse(localStorage.getItem("heroteca-tmdb-v2")) || {}; } catch (e) { TMDB.cache = {}; } }
  return TMDB.cache;
}
function tmdbGuardar() { try { localStorage.setItem("heroteca-tmdb-v2", JSON.stringify(TMDB.cache)); } catch (e) { /* sem cache */ } }
async function ponte(params) {
  const u = new URL(SUPABASE_URL + "/functions/v1/tmdb");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: CABECALHO_SUPABASE });
  if (r.status === 503) { TMDB.falhou = true; throw new Error("sem chave"); }
  if (!r.ok) throw new Error("ponte " + r.status);
  return r.json();
}
async function tmdbInfo(o) {
  // A maioria das obras já vem do catálogo com o id e o caminho do pôster.
  if (o.tmdb && o.tmdb.i && o.tmdb.p) return { id: Number(o.tmdb.i), p: o.tmdb.p, b: "" };
  const c = tmdbCache();
  const k = o.id + "|" + LINGUA_TMDB;
  if (c[k] !== undefined) return c[k];
  if (!o.tmdb || !o.tmdb.q) return null;
  const j = await ponte({ acao: "busca", tipo: o.tmdb.t === "tv" ? "tv" : "movie", q: o.tmdb.q, y: String(o.tmdb.y), lang: LINGUA_TMDB });
  const info = j && j.id ? { id: Number(j.id), p: caminhoCartaz(j.p), b: caminhoCartaz(j.b) } : null;
  c[k] = info;
  tmdbGuardar();
  return info;
}
const caminhoCartaz = (s) => (/^\/[\w.-]+$/.test(s || "") ? s : "");

// ---------- Capas de HQ: uma consulta só, guardada por um dia ----------
let capasHQ = null;
function capasHQAgora() {
  if (capasHQ) return capasHQ;
  capasHQ = (async () => {
    try {
      const guardado = JSON.parse(localStorage.getItem("heroteca-hq-v1"));
      if (guardado && Date.now() - guardado.t < 86400000 && guardado.m) return guardado.m;
    } catch (e) { /* sem cache */ }
    const u = new URL(SUPABASE_URL + "/rest/v1/capas_hq");
    u.searchParams.set("select", "obra,url");
    const r = await fetch(u, { headers: CABECALHO_SUPABASE });
    if (!r.ok) throw new Error("capas " + r.status);
    const m = {};
    for (const x of await r.json()) {
      if (typeof x.obra === "string" && /^https:\/\/[a-z0-9.-]*gamespot\.com\//.test(x.url || "")) m[x.obra] = x.url;
    }
    try { localStorage.setItem("heroteca-hq-v1", JSON.stringify({ t: Date.now(), m })); } catch (e) { /* sem cache */ }
    return m;
  })().catch(() => ({}));
  return capasHQ;
}

function agendar(fn) { TMDB.fila.push(fn); bombear(); }
function bombear() {
  while (TMDB.rodando < 4 && TMDB.fila.length) {
    const fn = TMDB.fila.shift();
    TMDB.rodando++;
    fn().catch(() => { /* sem capa: fica a desenhada */ }).finally(() => { TMDB.rodando--; bombear(); });
  }
}
function mostrarImg(img, url) {
  img.onload = () => { img.classList.add("ok"); };
  img.onerror = () => img.remove();
  img.src = url;
}
function hidratarImagens(raiz = document) {
  if (!CAPAS_ONLINE || !raiz) return;
  const hqs = $$("img[data-hq]", raiz);
  if (hqs.length) {
    capasHQAgora().then((m) => {
      for (const img of hqs) { const u = m[img.dataset.hq]; if (u && img.isConnected) mostrarImg(img, u); }
    });
  }
  if (TMDB.falhou) { $$("[data-provedores]", raiz).forEach((el) => { el.textContent = "Ainda não disponível."; }); return; }
  for (const img of $$("img[data-tmdb]", raiz)) {
    const o = C.O.get(img.dataset.tmdb);
    if (!o || !o.tmdb) continue;
    if (o.tmdb.p) { mostrarImg(img, "https://image.tmdb.org/t/p/w342" + o.tmdb.p); continue; }
    const c = tmdbCache()[o.id + "|" + LINGUA_TMDB];
    if (c !== undefined) { if (c && c.p) mostrarImg(img, "https://image.tmdb.org/t/p/w342" + c.p); continue; }
    agendar(async () => { const info = await tmdbInfo(o); if (info && info.p && img.isConnected) mostrarImg(img, "https://image.tmdb.org/t/p/w342" + info.p); });
  }
  for (const img of $$("img[data-tmdb-fundo]", raiz)) {
    const o = C.O.get(img.dataset.tmdbFundo);
    if (!o || !o.tmdb) continue;
    agendar(async () => { const info = await tmdbInfo(o); if (info && info.b && img.isConnected) mostrarImg(img, "https://image.tmdb.org/t/p/w1280" + info.b); });
  }
  for (const el of $$("[data-provedores]", raiz)) {
    const o = C.O.get(el.dataset.provedores);
    if (!o || !o.tmdb) continue;
    agendar(async () => {
      const info = await tmdbInfo(o);
      if (!info) { el.textContent = "Não achei essa obra no TMDB."; return; }
      const j = await ponte({ acao: "onde", tipo: o.tmdb.t === "tv" ? "tv" : "movie", id: String(info.id), pais: "BR" });
      const grupos = [["streaming", "Streaming"], ["aluguel", "Aluguel"], ["compra", "Compra"]];
      const html = grupos.map(([k, n]) => (j && Array.isArray(j[k]) && j[k].length ? `<p><strong>${n}:</strong> ${j[k].map(esc).join(", ")}</p>` : "")).join("");
      el.innerHTML = html || "Sem streaming no Brasil agora.";
    });
  }
}
