// ================= Estado do usuário =================
// R = o que é seu (salvo). V = R + exemplos, que é o que a tela mostra.
const novoEstado = () => ({
  v: 1, perfilT: 0,
  perfil: { nome: "", usuario: "", bio: "" },
  favoritos: { personagens: [], obras: [] },
  seguindo: ["lari", "pedro", "bia", "gui"],
  persNotas: {}, jogo: {}, curtidas: {}, ocultarExemplos: false, apagados: {},
  obras: {}, logs: [], listas: [],
});
let R = novoEstado();
let V = null;

const ehObj = (x) => x && typeof x === "object" && !Array.isArray(x);
const txt = (s, max) => String(s ?? "").slice(0, max);
const nInt = (n, min, max) => { n = Math.round(Number(n)); return Number.isFinite(n) && n >= min && n <= max ? n : 0; };

// Confere tudo o que vem de fora (aparelho, nuvem ou arquivo de backup)
function sanear(x) {
  const r = novoEstado();
  if (!ehObj(x)) return r;
  r.perfilT = Number(x.perfilT) || 0;
  if (ehObj(x.perfil)) r.perfil = { nome: txt(x.perfil.nome, 40), usuario: txt(x.perfil.usuario, 30).replace(/[^a-z0-9._]/gi, "").toLowerCase(), bio: txt(x.perfil.bio, 160) };
  if (ehObj(x.favoritos)) {
    r.favoritos.personagens = (Array.isArray(x.favoritos.personagens) ? x.favoritos.personagens : []).filter((id) => C.P.has(id)).slice(0, 4);
    r.favoritos.obras = (Array.isArray(x.favoritos.obras) ? x.favoritos.obras : []).filter((id) => C.O.has(id)).slice(0, 4);
  }
  if (Array.isArray(x.seguindo)) r.seguindo = x.seguindo.filter((id) => AMIGO.has(id));
  if (ehObj(x.persNotas)) for (const [k, n] of Object.entries(x.persNotas)) if (C.versoes.has(k) && (nInt(n, 1, 10) || n === 0)) r.persNotas[k] = nInt(n, 1, 10);
  if (ehObj(x.jogo)) r.jogo = sanearJogo(x.jogo);
  if (ehObj(x.curtidas)) for (const k of Object.keys(x.curtidas).slice(0, 2000)) if (x.curtidas[k]) r.curtidas[txt(k, 60)] = true;
  r.ocultarExemplos = !!x.ocultarExemplos;
  if (ehObj(x.apagados)) for (const [k, t] of Object.entries(x.apagados).slice(-300)) r.apagados[txt(k, 60)] = Number(t) || 1;
  if (ehObj(x.obras)) for (const [id, o] of Object.entries(x.obras)) { const s = sanearObra(id, o); if (s) r.obras[id] = s; }
  if (Array.isArray(x.logs)) r.logs = x.logs.map(sanearLog).filter(Boolean).slice(-3000);
  if (Array.isArray(x.listas)) r.listas = x.listas.map(sanearLista).filter(Boolean).slice(0, 200);
  return r;
}
function sanearObra(id, o) {
  const ob = C.O.get(id);
  if (!ob || !ehObj(o)) return null;
  const s = { t: Number(o.t) || 0 };
  if (STATUS.includes(o.status)) s.status = o.status;
  if (nInt(o.nota, 1, 10)) s.nota = nInt(o.nota, 1, 10);
  if (o.curtiu) s.curtiu = true;
  if (ehObj(o.eps) && ob.temporadas) {
    s.eps = {};
    for (const t of ob.temporadas) {
      const l = Array.isArray(o.eps[t.n]) ? o.eps[t.n] : [];
      const ok = [...new Set(l.map((e) => nInt(e, 1, t.eps || 0)).filter(Boolean))].sort((a, b) => a - b);
      if (ok.length) s.eps[t.n] = ok;
    }
  }
  if (Array.isArray(o.temps) && ob.temporadas) s.temps = o.temps.map((n) => nInt(n, 1, 99)).filter((n) => ob.temporadas.some((t) => t.n === n));
  if (Array.isArray(o.eds) && ob.edicoes) s.eds = [...new Set(o.eds.map((i) => Math.round(Number(i))).filter((i) => i >= 0 && i < ob.edicoes.length))].sort((a, b) => a - b);
  if (ob.episodios) s.vistos = nInt(o.vistos, 0, ob.episodios);
  return s;
}
function sanearLog(l) {
  if (!ehObj(l) || !C.O.has(l.obra) || !dataValida(l.data)) return null;
  const o = C.O.get(l.obra);
  const s = { id: txt(l.id, 60) || idNovo("l"), obra: l.obra, data: l.data, criado: Number(l.criado) || 0, t: Number(l.t) || 0 };
  if (nInt(l.nota, 1, 10)) s.nota = nInt(l.nota, 1, 10);
  if (l.curtiu) s.curtiu = true;
  if (l.rever) s.rever = true;
  if (l.spoiler) s.spoiler = true;
  const rev = txt(l.review, 6000).trim();
  if (rev) s.review = rev;
  if (Array.isArray(l.tags)) { const tg = [...new Set(l.tags.map((t) => slug(t).slice(0, 30)).filter(Boolean))].slice(0, 12); if (tg.length) s.tags = tg; }
  if (ehObj(l.escopo)) {
    if (o.temporadas && nInt(l.escopo.t, 1, 99) && o.temporadas.some((t) => t.n === l.escopo.t)) {
      s.escopo = { t: l.escopo.t };
      const tt = o.temporadas.find((t) => t.n === l.escopo.t);
      if (tt.eps && nInt(l.escopo.e, 1, tt.eps)) s.escopo.e = l.escopo.e;
    } else if (o.edicoes && Number.isInteger(l.escopo.i) && l.escopo.i >= 0 && l.escopo.i < o.edicoes.length) {
      s.escopo = { i: l.escopo.i };
    }
  }
  return s;
}
function sanearLista(l) {
  if (!ehObj(l)) return null;
  const titulo = txt(l.titulo, 80).trim();
  if (!titulo) return null;
  return {
    id: /^u-[a-z0-9]+$/.test(String(l.id)) ? l.id : "u-" + idNovo("").toLowerCase(),
    titulo, descricao: txt(l.descricao, 400).trim(), t: Number(l.t) || 0, criada: Number(l.criada) || Date.now(),
    itens: [...new Set((Array.isArray(l.itens) ? l.itens : []).filter((id) => C.O.has(id)))].slice(0, 300),
  };
}
function sanearJogo(j) {
  const s = { sequencia: nInt(j.sequencia, 0, 99999), recorde: nInt(j.recorde, 0, 99999), dias: {} };
  if (dataValida(j.ultimaVitoria)) s.ultimaVitoria = j.ultimaVitoria;
  if (ehObj(j.dias)) {
    for (const k of Object.keys(j.dias).filter(dataValida).sort().slice(-40)) {
      const d = j.dias[k];
      if (!ehObj(d) || !Array.isArray(d.chutes)) continue;
      s.dias[k] = { chutes: d.chutes.filter((id) => typeof id === "string").slice(0, 80), venceu: !!d.venceu };
    }
  }
  return s;
}

// Visão mesclada com os exemplos
const porDataDesc = (a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : (b.criado || 0) - (a.criado || 0));
function mesclar() {
  const ex = R.ocultarExemplos ? null : EX;
  const favP = R.favoritos.personagens.length || !ex ? R.favoritos.personagens : ex.favoritos.personagens;
  const favO = R.favoritos.obras.length || !ex ? R.favoritos.obras : ex.favoritos.obras;
  V = {
    obras: ex ? { ...ex.obras, ...R.obras } : R.obras,
    logs: (ex ? R.logs.concat(ex.logs) : R.logs.slice()).sort(porDataDesc),
    persNotas: ex ? { ...ex.persNotas, ...R.persNotas } : R.persNotas,
    favP, favO,
    favPEx: favP !== R.favoritos.personagens, favOEx: favO !== R.favoritos.obras,
    listas: ex ? R.listas.concat(ex.listas) : R.listas,
  };
}

// ================= Armazenamento: nuvem (db do Claude) com cópia no aparelho =================
const Armazem = { modo: "local", estado: "local", refs: null, sujo: new Set(), timer: 0, filas: {}, ultimo: {}, tentativas: {} };
const DOCS = {
  perfil: (r) => ({ v: r.v, perfilT: r.perfilT, perfil: r.perfil, favoritos: r.favoritos, seguindo: r.seguindo, persNotas: r.persNotas, jogo: r.jogo, curtidas: r.curtidas, ocultarExemplos: r.ocultarExemplos, apagados: r.apagados }),
  obras: (r) => ({ obras: r.obras }),
  diario: (r) => ({ logs: r.logs }),
  listas: (r) => ({ listas: r.listas }),
};
function lerLocal() {
  try { const t = localStorage.getItem(CHAVE_LOCAL); return t ? JSON.parse(t) : null; } catch (e) { return null; }
}
function gravarLocal() {
  try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(R)); } catch (e) { /* sem armazenamento local: segue só na memória */ }
}
function salvar(...docs) {
  if (docs.includes("perfil")) R.perfilT = Date.now();
  mesclar();
  gravarLocal();
  if (Armazem.modo !== "nuvem") return;
  docs.forEach((d) => Armazem.sujo.add(d));
  clearTimeout(Armazem.timer);
  Armazem.timer = setTimeout(descarregar, 700);
}
function descarregar() {
  const lista = [...Armazem.sujo];
  Armazem.sujo.clear();
  lista.forEach(gravarDoc);
}
function gravarDoc(nome) {
  const anterior = Armazem.filas[nome] || Promise.resolve();
  const proxima = anterior.then(async () => {
    if (Armazem.modo !== "nuvem") return;
    const corpo = DOCS[nome](R);
    const json = JSON.stringify(corpo);
    if (json === Armazem.ultimo[nome]) return;
    if (json.length > 240000) { toast("Seu diário ficou grande demais para um arquivo só. Exporte um backup no Perfil."); return; }
    try {
      await Armazem.refs[nome].set(JSON.parse(json));
      Armazem.ultimo[nome] = json;
      Armazem.tentativas[nome] = 0;
    } catch (e) { erroNuvem(e, nome); }
  });
  Armazem.filas[nome] = proxima.catch(() => {});
}
function erroNuvem(e, nome) {
  const code = e && e.code;
  const n = (Armazem.tentativas[nome] = (Armazem.tentativas[nome] || 0) + 1);
  if ((code === "unavailable" || code === "resource_exhausted" || !code) && n <= 2) {
    setTimeout(() => gravarDoc(nome), (code === "resource_exhausted" ? 5000 : 1200) + Math.random() * 1500);
    return;
  }
  if (code === "quota_exceeded") { toast("O espaço deste site na nuvem encheu. Exporte um backup no Perfil."); return; }
  Armazem.modo = "local";
  Armazem.estado = "local";
  toast("Não deu para salvar na sua conta. Por enquanto, tudo fica salvo neste aparelho.");
  atualizarArmazem();
}
function mesclarEstados(a, b) {
  const out = novoEstado();
  const novo = (x, y) => (!x ? y : !y ? x : (Number(y.t) || 0) > (Number(x.t) || 0) ? y : x);
  const base = (b.perfilT || 0) > (a.perfilT || 0) ? b : a;
  for (const k of ["perfilT", "perfil", "favoritos", "seguindo", "persNotas", "jogo", "curtidas", "ocultarExemplos"]) out[k] = clone(base[k]);
  out.apagados = { ...a.apagados, ...b.apagados };
  for (const id of new Set([...Object.keys(a.obras), ...Object.keys(b.obras)])) out.obras[id] = clone(novo(a.obras[id], b.obras[id]));
  const unir = (xa, xb) => {
    const m = new Map();
    for (const x of [...xa, ...xb]) { if (out.apagados[x.id]) continue; m.set(x.id, novo(m.get(x.id), x)); }
    return [...m.values()].map(clone);
  };
  out.logs = unir(a.logs, b.logs);
  out.listas = unir(a.listas, b.listas);
  return out;
}
async function conectarNuvem() {
  const cl = window.claude;
  if (!cl || typeof cl.use !== "function") return;
  Armazem.estado = "conectando";
  atualizarArmazem();
  let db = null, user = null;
  try { [db, user] = await Promise.all([cl.use("db"), cl.use("user")]); } catch (e) { db = null; }
  let uid = null;
  if (db && user) { try { uid = await user.id(); } catch (e) { uid = null; } }
  if (!uid) { Armazem.estado = "local"; atualizarArmazem(); return; }
  let refs;
  try {
    const base = "data/users/" + uid;
    refs = { perfil: db.doc(base + "/perfil"), obras: db.doc(base + "/obras"), diario: db.doc(base + "/diario"), listas: db.doc(base + "/listas") };
  } catch (e) { Armazem.estado = "local"; atualizarArmazem(); return; }
  const nomes = Object.keys(refs);
  let snaps;
  try {
    snaps = await Promise.race([
      Promise.all(nomes.map((n) => refs[n].get())),
      new Promise((_, rej) => setTimeout(() => rej({ code: "tempo" }), 10000)),
    ]);
  } catch (e) {
    Armazem.estado = "local";
    atualizarArmazem();
    toast(e && e.code === "tempo" ? "A nuvem não respondeu. Por enquanto, tudo fica salvo neste aparelho." : "Não deu para abrir sua conta agora. Tudo fica salvo neste aparelho.");
    return;
  }
  const nuvem = {};
  snaps.forEach((s, i) => { if (s && s.exists) Object.assign(nuvem, clone(s.data())); Armazem.ultimo[nomes[i]] = s && s.exists ? JSON.stringify(s.data()) : ""; });
  Armazem.refs = refs;
  Armazem.modo = "nuvem";
  Armazem.estado = "nuvem";
  const antes = JSON.stringify(R);
  R = mesclarEstados(sanear(nuvem), R);
  mesclar();
  gravarLocal();
  nomes.forEach((n) => { if (JSON.stringify(DOCS[n](R)) !== Armazem.ultimo[n]) Armazem.sujo.add(n); });
  if (Armazem.sujo.size) descarregar();
  if (JSON.stringify(R) !== antes) desenhar({ manterScroll: true });
  atualizarArmazem();
}

// ================= Mudanças =================
const estObra = (id) => V.obras[id] || null;
function mudarObra(id, fn) {
  const atual = clone(R.obras[id] || V.obras[id] || {});
  fn(atual);
  atual.t = Date.now();
  R.obras[id] = atual;
  salvar("obras");
}
function totalEps(o) { return (o.temporadas || []).reduce((s, t) => s + (t.eps || 0), 0); }
function vistosEps(o, e) {
  if (!e) return 0;
  if (o.episodios) return e.vistos || 0;
  return Object.values(e.eps || {}).reduce((s, l) => s + l.length, 0);
}
function conferirCompleta(id, est) {
  const o = C.O.get(id);
  if (o.temporadas && o.temporadas.every((t) => (t.eps ? (est.eps?.[t.n] || []).length >= t.eps : (est.temps || []).includes(t.n)))) {
    if (est.status !== "terminei") { est.status = "terminei"; return true; }
  }
  if (o.edicoes && (est.eds || []).length >= o.edicoes.length && est.status !== "terminei") { est.status = "terminei"; return true; }
  return false;
}
const temLog = (id) => V.logs.some((l) => l.obra === id);
const vista = (id) => { const e = V.obras[id]; return !!(e && e.status === "terminei") || V.logs.some((l) => l.obra === id && !l.escopo); };
const comecou = (id) => { const e = V.obras[id]; return !!(e && (e.status === "terminei" || e.status === "vendo" || e.status === "abandonei")) || temLog(id); };

// ================= Contas da comunidade (exemplos + você) =================
function mediaObra(id) {
  const ns = AMIGOS.map((a) => a.notas[id]).filter(Boolean);
  const minha = V.obras[id]?.nota;
  if (minha) ns.push(minha);
  return ns.length ? { m: ns.reduce((s, n) => s + n, 0) / ns.length, n: ns.length } : { m: 0, n: 0 };
}
function mediaVersao(chave) {
  const ns = AMIGOS.map((a) => a.pers[chave]).filter(Boolean);
  const minha = V.persNotas[chave];
  if (minha) ns.push(minha);
  return ns.length ? { m: ns.reduce((s, n) => s + n, 0) / ns.length, n: ns.length } : { m: 0, n: 0 };
}
const podeAvaliarVersao = (v) => v.aps.some((a) => comecou(a.obra));
function progressoPersonagem(pid) {
  const obras = obrasDoPersonagem(pid).filter((o) => !emBreve(o));
  const vistas = obras.filter((o) => vista(o.id));
  return { total: obras.length, vistas: vistas.length, pct: obras.length ? Math.round((vistas.length / obras.length) * 100) : 0, obras: vistas };
}
function progressoUniverso(uid) {
  const obras = (C.U.get(uid)?.obras || []).filter((o) => !emBreve(o));
  const vistas = obras.filter((o) => vista(o.id));
  return { total: obras.length, vistas: vistas.length, pct: obras.length ? Math.round((vistas.length / obras.length) * 100) : 0, obras: vistas };
}
function todasResenhas(id) {
  const minhas = V.logs.filter((l) => l.obra === id && l.review).map((l) => ({ ...l, autor: "eu" }));
  const deles = AMIGOS.flatMap((a) => a.logs.filter((l) => l.obra === id && l.review));
  return minhas.concat(deles).sort(porDataDesc);
}
function estatisticas() {
  const obras = Object.entries(V.obras);
  const terminadas = obras.filter(([, e]) => e.status === "terminei").map(([id]) => C.O.get(id)).filter(Boolean);
  const porFormato = {};
  for (const o of terminadas) porFormato[o.formato] = (porFormato[o.formato] || 0) + 1;
  const eps = obras.reduce((s, [id, e]) => s + vistosEps(C.O.get(id), e), 0);
  const eds = obras.reduce((s, [, e]) => s + (e.eds || []).length, 0);
  const universos = new Set(terminadas.map((o) => o.universo)).size;
  const hist = Array(10).fill(0);
  for (const [, e] of obras) if (e.nota) hist[e.nota - 1]++;
  const ano = HOJE.slice(0, 4);
  const completos = C.personagens.filter((p) => { const g = progressoPersonagem(p.id); return g.total && g.vistas === g.total; }).length;
  return {
    terminadas: terminadas.length, porFormato, eps, eds, universos, hist,
    logs: V.logs.length, esteAno: V.logs.filter((l) => l.data.startsWith(ano)).length,
    resenhas: V.logs.filter((l) => l.review).length, hqs: porFormato.hq || 0,
    persNotas: Object.values(V.persNotas).filter(Boolean).length, recorde: R.jogo.recorde || 0, completos,
  };
}
const CONQUISTAS = [
  { nome: "Primeiro registro", desc: "Registrou uma obra no diário", ok: (s) => s.logs >= 1, t: "1" },
  { nome: "Maratonista", desc: "10 registros no diário", ok: (s) => s.logs >= 10, t: "10" },
  { nome: "Leitor de gibi", desc: "Terminou 3 HQs", ok: (s) => s.hqs >= 3, t: "HQ" },
  { nome: "Viajante do multiverso", desc: "Terminou obras de 5 universos", ok: (s) => s.universos >= 5, t: "5U" },
  { nome: "Crítico de plantão", desc: "Escreveu 5 resenhas", ok: (s) => s.resenhas >= 5, t: "5" },
  { nome: "Juiz de versões", desc: "Deu nota para 5 versões de personagens", ok: (s) => s.persNotas >= 5, t: "★" },
  { nome: "Detetive", desc: "Sequência de 3 dias no jogo", ok: (s) => s.recorde >= 3, t: "3" },
  { nome: "Fã completo", desc: "Viu tudo de um personagem", ok: (s) => s.completos >= 1, t: "100" },
];
