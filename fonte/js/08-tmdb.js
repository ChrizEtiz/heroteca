// ================= Pôsteres do TMDB =================
// O site pergunta à ponte "tmdb" no Supabase, que guarda a chave do TMDB em segredo.
// Dentro do Claude (artefato) não dá para carregar nada de fora, então ficam as capas desenhadas.
const TMDB = { ativo: FORA_DO_CLAUDE, cache: null, fila: [], rodando: 0, falhou: false };
const LINGUA_TMDB = "pt-BR";
function tmdbCache() {
  if (!TMDB.cache) { try { TMDB.cache = JSON.parse(localStorage.getItem("heroteca-tmdb-v2")) || {}; } catch (e) { TMDB.cache = {}; } }
  return TMDB.cache;
}
function tmdbGuardar() { try { localStorage.setItem("heroteca-tmdb-v2", JSON.stringify(TMDB.cache)); } catch (e) { /* sem cache */ } }
async function ponte(params) {
  const u = new URL(SUPABASE_URL + "/functions/v1/tmdb");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { Authorization: "Bearer " + SUPABASE_ANON, apikey: SUPABASE_ANON } });
  if (r.status === 503) { TMDB.falhou = true; throw new Error("sem chave"); }
  if (!r.ok) throw new Error("ponte " + r.status);
  return r.json();
}
async function tmdbInfo(o) {
  const c = tmdbCache();
  const k = o.id + "|" + LINGUA_TMDB;
  if (c[k] !== undefined) return c[k];
  const j = await ponte({ acao: "busca", tipo: o.tmdb.t === "tv" ? "tv" : "movie", q: o.tmdb.q, y: String(o.tmdb.y), lang: LINGUA_TMDB });
  const info = j && j.id ? { id: Number(j.id), p: /^\/[\w.-]+$/.test(j.p || "") ? j.p : "", b: /^\/[\w.-]+$/.test(j.b || "") ? j.b : "" } : null;
  c[k] = info;
  tmdbGuardar();
  return info;
}
function agendar(fn) { TMDB.fila.push(fn); bombear(); }
function bombear() {
  while (TMDB.rodando < 4 && TMDB.fila.length && !TMDB.falhou) {
    const fn = TMDB.fila.shift();
    TMDB.rodando++;
    fn().catch(() => { /* sem pôster: fica a capa desenhada */ }).finally(() => { TMDB.rodando--; bombear(); });
  }
}
function mostrarImg(img, url) {
  img.onload = () => { img.classList.add("ok"); };
  img.onerror = () => img.remove();
  img.src = url;
}
function hidratarImagens(raiz = document) {
  if (!TMDB.ativo || !raiz) return;
  if (TMDB.falhou) { $$("[data-provedores]", raiz).forEach((el) => { el.textContent = "Ainda não disponível."; }); return; }
  for (const img of $$("img[data-tmdb]", raiz)) {
    const o = C.O.get(img.dataset.tmdb);
    if (!o || !o.tmdb) continue;
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
