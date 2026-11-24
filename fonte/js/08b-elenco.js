// ================= Elenco e fotos de personagem =================
// São 48 mil linhas de elenco: não cabem no arquivo que o site baixa, então
// ficam no Supabase e o site busca só o pedaço de que precisa, na hora.
// As artes dos personagens vêm do Comic Vine, já guardadas lá.

const ELENCO = { porPers: new Map(), porObra: new Map(), fotos: null };

// A ordem de crédito do TMDB diz quem é o protagonista: quem aparece primeiro.
function papelPelaOrdem(ordem) {
  if (ordem <= 1) return "protagonista";
  if (ordem <= 5) return "coadjuvante";
  return "participacao";
}

async function doSupabase(tabela, params) {
  const u = new URL(SUPABASE_URL + "/rest/v1/" + tabela);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: CABECALHO_SUPABASE });
  if (!r.ok) throw new Error(tabela + " " + r.status);
  return r.json();
}

// ---------- artes dos personagens (uma consulta só, guardada por um dia) ----------
function fotosDosPersonagens() {
  if (ELENCO.fotos) return ELENCO.fotos;
  ELENCO.fotos = (async () => {
    try {
      const g = JSON.parse(localStorage.getItem("heroteca-fotos-v1"));
      if (g && Date.now() - g.t < 86400000 && g.m) return g.m;
    } catch (e) { /* sem cache */ }
    const m = {};
    for (const x of await doSupabase("fotos_personagem", { select: "personagem,url" })) {
      if (typeof x.personagem === "string" && /^https:\/\/[a-z0-9.-]*gamespot\.com\//.test(x.url || "")) m[x.personagem] = x.url;
    }
    try { localStorage.setItem("heroteca-fotos-v1", JSON.stringify({ t: Date.now(), m })); } catch (e) { /* sem cache */ }
    return m;
  })().catch(() => ({}));
  return ELENCO.fotos;
}
const fotoDe = (pid) => (ELENCO.fotosProntas || {})[pid] || "";

// ---------- obras de um personagem ----------
// Guarda duas coisas: as obras que o cadastro à mão ainda não tinha, e a foto
// do ator de cada universo, para a versão daquele universo ter o rosto certo.
function elencoDoPersonagem(pid) {
  if (ELENCO.porPers.has(pid)) return ELENCO.porPers.get(pid);
  const p = (async () => {
    const linhas = await doSupabase("elenco", {
      select: "tipo,obra,ordem,ator,papel,foto,voz",
      personagem: "eq." + pid,
      order: "ordem.asc",
      limit: "600",
    });
    const extras = [];
    const fotos = {};
    for (const l of linhas) {
      const o = C.porTmdb.get(l.tipo + ":" + l.obra);
      if (!o) continue;
      if (l.foto && !fotos[o.universo]) fotos[o.universo] = { ator: l.ator || "", foto: l.foto };
      // Se a obra já tem esse personagem cadastrado à mão, o cadastro manda.
      if ((o.elenco || []).some((e) => e.p === pid)) continue;
      extras.push({
        obra: o.id, p: pid, u: o.universo, papel: papelPelaOrdem(l.ordem),
        ator: l.ator || "", retrato: l.foto || "", voz: !!l.voz,
        dub: "", obs: "", doTmdb: true,
      });
    }
    return { extras, fotos };
  })().catch(() => ({ extras: [], fotos: {} }));
  ELENCO.porPers.set(pid, p);
  return p;
}

// ---------- elenco de uma obra ----------
function elencoDaObra(o) {
  const t = o.tmdb;
  if (!t || !t.i) return Promise.resolve([]);
  const k = (t.t || "movie") + ":" + t.i;
  if (ELENCO.porObra.has(k)) return ELENCO.porObra.get(k);
  const p = doSupabase("elenco", {
    select: "ordem,ator,papel,foto,voz,personagem",
    tipo: "eq." + (t.t || "movie"),
    obra: "eq." + t.i,
    order: "ordem.asc",
    limit: "20",
  }).catch(() => []);
  ELENCO.porObra.set(k, p);
  return p;
}

// ---------- o que a página do personagem usa ----------
ELENCO.prontos = new Map();   // pid -> { extras, fotos }

function aparicoesCompletas(pid) {
  const mao = C.aparicoes.get(pid) || [];
  const pronto = ELENCO.prontos.get(pid);
  return pronto ? [...mao, ...pronto.extras] : mao.slice();
}

// Foto certa para cada versão: arte de quadrinho quando o universo é de HQ,
// rosto do ator quando é de carne e osso.
function fotoDaVersao(v) {
  const u = C.U.get(v.u);
  const pronto = ELENCO.prontos.get(v.p);
  const doAtor = pronto && pronto.fotos[v.u];
  if (u && u.midia !== "HQ" && doAtor) return { url: "https://image.tmdb.org/t/p/w185" + doAtor.foto, tipo: "ator" };
  const arte = fotoDe(v.p);
  return arte ? { url: arte, tipo: "arte" } : null;
}

function pedirElencoDoPersonagem(pid, aoChegar) {
  if (ELENCO.prontos.has(pid)) return false;
  ELENCO.prontos.set(pid, null);
  Promise.all([elencoDoPersonagem(pid), fotosDosPersonagens()]).then(([r, fotos]) => {
    ELENCO.fotosProntas = fotos;
    ELENCO.prontos.set(pid, r);
    aoChegar();
  }).catch(() => { ELENCO.prontos.set(pid, { extras: [], fotos: {} }); aoChegar(); });
  return true;
}
const elencoCarregado = (pid) => !!ELENCO.prontos.get(pid);

// ---------- elenco da obra, desenhado quando chega ----------
function cartaoElencoTmdb(x) {
  const pers = x.personagem && C.P.has(x.personagem) ? C.P.get(x.personagem) : null;
  const nome = pers ? pers.nome : (x.papel || "").replace(/\s*\((voice|Voice)\)\s*/, "").trim();
  const retrato = x.foto
    ? `<span class="erosto"><img src="https://image.tmdb.org/t/p/w185${esc(x.foto)}" alt="" loading="lazy"></span>`
    : `<span class="erosto erosto--vazio" aria-hidden="true">${esc(iniciais(x.ator || nome || "?"))}</span>`;
  return `<div class="ecard ecard--tmdb">${retrato}<span class="ecard-n">`
    + (pers ? `<a href="#personagem-${esc(pers.id)}">${esc(nome)}</a>` : esc(nome || "—"))
    + `</span><span class="ecard-a"><a href="#pessoa-${esc(slug(x.ator))}">${esc(x.ator)}</a>${x.voz ? " (voz)" : ""}</span></div>`;
}

function hidratarElenco(raiz = document) {
  for (const cx of $$("[data-elenco]", raiz)) {
    const o = C.O.get(cx.dataset.elenco);
    if (!o) continue;
    elencoDaObra(o).then((lista) => {
      if (!cx.isConnected) return;
      cx.innerHTML = lista.length
        ? lista.map(cartaoElencoTmdb).join("")
        : `<p class="mudo">Não achei o elenco desta no TMDB.</p>`;
    });
  }
}

// ---------- sinopse das sagas de quadrinho ----------
const SAGAS = new Map();
function resumoDaSaga(id) {
  if (SAGAS.has(id)) return SAGAS.get(id);
  const p = doSupabase("sagas", { select: "resumo,edicao", id: "eq." + id }).then((r) => r[0] || null).catch(() => null);
  SAGAS.set(id, p);
  return p;
}
function hidratarSagas(raiz = document) {
  for (const el of $$("[data-saga]", raiz)) {
    const o = C.O.get(el.dataset.saga);
    if (!o || !o.cv) continue;
    resumoDaSaga(o.cv.i).then((r) => {
      if (!el.isConnected) return;
      const partes = [];
      if (r && r.resumo) partes.push(`<p>${esc(r.resumo)}</p>`);
      if (r && r.edicao) partes.push(`<p class="mudo mini">Começa na edição #${esc(r.edicao)}.</p>`);
      el.innerHTML = partes.join("") || `<p class="mudo">Sem sinopse no Comic Vine.</p>`;
    });
  }
}
