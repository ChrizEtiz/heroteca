// ================= Pôsteres do TMDB (só com a chave, no site de verdade) =================
// Busca pelo título original + ano, em português do Brasil, e guarda o resultado no aparelho.
// Sem chave (como aqui no beta), nada é buscado e ficam as capas desenhadas.
const TMDB = { ativo: !!TMDB_API_KEY, cache: null, fila: [], rodando: 0, falhou: false };
function tmdbCache() {
  if (!TMDB.cache) { try { TMDB.cache = JSON.parse(localStorage.getItem("heroteca-tmdb-v1")) || {}; } catch (e) { TMDB.cache = {}; } }
  return TMDB.cache;
}
function tmdbGuardar() { try { localStorage.setItem("heroteca-tmdb-v1", JSON.stringify(TMDB.cache)); } catch (e) { /* sem cache */ } }
async function tmdbGet(caminho, params = {}) {
  const u = new URL("https://api.themoviedb.org/3" + caminho);
  const v4 = TMDB_API_KEY.length > 40;
  if (!v4) u.searchParams.set("api_key", TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, v4 ? { headers: { Authorization: "Bearer " + TMDB_API_KEY, accept: "application/json" } } : {});
  if (!r.ok) throw new Error("tmdb " + r.status);
  return r.json();
}
async function tmdbInfo(o) {
  const c = tmdbCache();
  if (c[o.id] !== undefined) return c[o.id];
  const tipo = o.tmdb.t === "tv" ? "tv" : "movie";
  const base = { query: o.tmdb.q, language: "pt-BR", include_adult: "false" };
  let j = await tmdbGet(`/search/${tipo}`, { ...base, [tipo === "movie" ? "year" : "first_air_date_year"]: String(o.tmdb.y) });
  if (!j.results || !j.results.length) j = await tmdbGet(`/search/${tipo}`, base);
  const r = j.results && j.results[0];
  const info = r ? { id: Number(r.id), p: /^\/[\w.-]+$/.test(r.poster_path || "") ? r.poster_path : "", b: /^\/[\w.-]+$/.test(r.backdrop_path || "") ? r.backdrop_path : "" } : null;
  c[o.id] = info;
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
function hidratarImagens(raiz = document) {
  if (!TMDB.ativo || !raiz) return;
  for (const img of $$("img[data-tmdb]", raiz)) {
    const o = C.O.get(img.dataset.tmdb);
    if (!o || !o.tmdb) continue;
    agendar(async () => {
      const info = await tmdbInfo(o);
      if (!info || !info.p || !img.isConnected) return;
      img.onload = () => { img.hidden = false; };
      img.onerror = () => img.remove();
      img.src = "https://image.tmdb.org/t/p/w342" + info.p;
    });
  }
  for (const img of $$("img[data-tmdb-fundo]", raiz)) {
    const o = C.O.get(img.dataset.tmdbFundo);
    if (!o || !o.tmdb) continue;
    agendar(async () => {
      const info = await tmdbInfo(o);
      if (!info || !info.b || !img.isConnected) return;
      img.onload = () => { img.hidden = false; };
      img.onerror = () => img.remove();
      img.src = "https://image.tmdb.org/t/p/w1280" + info.b;
    });
  }
  for (const el of $$("[data-provedores]", raiz)) {
    const o = C.O.get(el.dataset.provedores);
    if (!o || !o.tmdb) continue;
    agendar(async () => {
      const info = await tmdbInfo(o);
      if (!info) { el.textContent = "Não achei essa obra no TMDB."; return; }
      const j = await tmdbGet(`/${o.tmdb.t === "tv" ? "tv" : "movie"}/${info.id}/watch/providers`);
      const br = j.results && j.results.BR;
      const grupos = [["flatrate", "Streaming"], ["rent", "Aluguel"], ["buy", "Compra"]];
      const html = br ? grupos.map(([k, n]) => (br[k] && br[k].length ? `<p><strong>${n}:</strong> ${br[k].map((p) => esc(p.provider_name)).join(", ")}</p>` : "")).join("") : "";
      el.innerHTML = html || "Sem streaming no Brasil agora.";
    });
  }
}
