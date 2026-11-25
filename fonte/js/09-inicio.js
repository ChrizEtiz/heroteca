// ================= Rotas =================
const ROTAS = { inicio: pgInicio, explorar: pgExplorar, personagens: pgPersonagens, universos: pgUniversos, ranking: pgRanking, jogo: pgJogo, diario: pgDiario, listas: pgListas, perfil: pgPerfil, sobre: pgSobre };
const PREFIXOS = [["obra-", pgObra], ["personagem-", pgPersonagem], ["universo-", pgUniverso], ["pessoa-", pgPessoa], ["lista-", pgLista], ["usuario-", pgUsuario]];
const ABA_DA_ROTA = { inicio: "inicio", explorar: "explorar", personagens: "explorar", universos: "explorar", ranking: "explorar", jogo: "jogo", diario: "diario", listas: "listas", perfil: "perfil", sobre: "", obra: "explorar", personagem: "explorar", universo: "explorar", pessoa: "explorar", lista: "listas", usuario: "perfil" };
function rotaAtual() {
  const h = location.hash.slice(1) || "inicio";
  if (ROTAS[h]) return { nome: h, fn: ROTAS[h], arg: undefined };
  for (const [pre, fn] of PREFIXOS) if (h.startsWith(pre)) return { nome: pre.slice(0, -1), fn, arg: h.slice(pre.length) };
  return { nome: "inicio", fn: pgInicio, arg: undefined };
}
function chaveFoco(el) {
  if (!el || el === document.body || !el.closest("#conteudo")) return null;
  if (el.id) return "#" + CSS.escape(el.id);
  const ds = ["acao", "obra", "s", "n", "alvo", "t", "e", "i", "p", "u", "k", "v", "lista", "log", "d"].filter((k) => el.dataset && el.dataset[k] != null);
  return ds.length ? ds.map((k) => `[data-${k}="${CSS.escape(el.dataset[k])}"]`).join("") : null;
}
// Páginas que só fazem sentido com o catálogo inteiro na mão.
const ROTAS_CATALOGO = new Set(["explorar", "universos", "ranking"]);
function faltaCatalogo(rota) {
  if (C.extraCarregado) return false;
  if (ROTAS_CATALOGO.has(rota.nome)) return true;
  if (rota.nome === "obra") return !C.O.has(rota.arg);
  if (rota.nome === "universo") return !C.U.has(rota.arg);
  if (rota.nome === "personagem") return true;   // a página lista obras do catálogo todo
  return false;
}
function pedirCatalogo() {
  carregarExtra().then(() => desenhar({ manterScroll: true })).catch(() => {
    $$("#conteudo .carregando-cat").forEach((el) => { el.textContent = "Não consegui carregar o resto do catálogo. Tente recarregar a página."; });
  });
}
function desenhar({ manterScroll = false } = {}) {
  if (!C.obras.length) return;
  const rota = rotaAtual();
  const main = $("#conteudo");
  const y = window.scrollY;
  const foco = manterScroll ? chaveFoco(document.activeElement) : null;
  let html;
  try { html = rota.fn(rota.arg); } catch (e) { console.error(e); html = naoAchei(); }
  main.innerHTML = html;
  const aba = ABA_DA_ROTA[rota.nome] || "";
  $$(".nav a, .abas a").forEach((a) => { if (a.dataset.nav === aba) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  document.title = PAG.titulo ? `${PAG.titulo} · ${NOME_DO_SITE}` : `${NOME_DO_SITE} · diário de heróis`;
  if (rota.nome === "jogo") desenharJogo(false, false);
  if (faltaCatalogo(rota)) {
    main.insertAdjacentHTML("beforeend", `<p class="carregando-cat">Carregando o resto do catálogo...</p>`);
    pedirCatalogo();
  } else if (PRECISA_TEMPORADAS) {
    const o = PRECISA_TEMPORADAS; PRECISA_TEMPORADAS = null;
    pedirTemporadas(o, () => { const r = rotaAtual(); if (r.nome === "obra" && r.arg === o.id) desenhar({ manterScroll: true }); });
  }
  if (rota.nome === "personagem" && C.P.has(rota.arg)) {
    pedirElencoDoPersonagem(rota.arg, () => { if (rotaAtual().arg === rota.arg) desenhar({ manterScroll: true }); });
    prepararGaveta();
  }
  hidratarImagens(main);
  hidratarElenco(main);
  hidratarSagas(main);
  atualizarArmazem();
  atualizarContagem();
  if (manterScroll) {
    window.scrollTo(0, y);
    if (foco) { const el = main.querySelector(foco); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* ignora */ } } }
  } else {
    window.scrollTo(0, 0);
  }
}
// ---------- A gaveta do guia no celular ----------
// No computador o guia é uma coluna grudada. No celular vira uma gaveta que
// sobe de baixo, e que dá para arrastar com o dedo.
let GAVETA_ABERTA = false;
const noCelular = () => window.matchMedia("(max-width: 979px)").matches;

function alternarGaveta(g, abrir) {
  GAVETA_ABERTA = !!abrir;
  g.classList.toggle("aberta", GAVETA_ABERTA);
  g.style.transform = "";
  const pux = g.querySelector(".guia-puxador");
  if (pux) pux.setAttribute("aria-expanded", String(GAVETA_ABERTA));
}

function prepararGaveta() {
  const g = $("#guia");
  if (!g || g.dataset.pronta) return;
  g.dataset.pronta = "1";
  if (GAVETA_ABERTA) g.classList.add("aberta");
  const pux = g.querySelector(".guia-puxador");
  if (!pux) return;

  let y0 = null, alturaMax = 0, andou = 0, arrastou = false;
  const fechadaEm = (alt) => Math.max(0, alt - 92);

  const comecar = (e) => {
    if (!noCelular()) return;
    y0 = (e.touches ? e.touches[0] : e).clientY;
    alturaMax = g.getBoundingClientRect().height;
    andou = 0; arrastou = false;
    g.classList.add("arrastando");
  };
  const mover = (e) => {
    if (y0 === null) return;
    andou = (e.touches ? e.touches[0] : e).clientY - y0;
    if (Math.abs(andou) > 6) arrastou = true;
    const base = g.classList.contains("aberta") ? 0 : fechadaEm(alturaMax);
    g.style.transform = `translateY(${Math.max(0, Math.min(fechadaEm(alturaMax), base + andou))}px)`;
    if (e.cancelable) e.preventDefault();
  };
  const soltar = () => {
    if (y0 === null) return;
    y0 = null;
    g.classList.remove("arrastando");
    alternarGaveta(g, arrastou ? andou < 0 : !g.classList.contains("aberta"));
  };

  pux.addEventListener("touchstart", comecar, { passive: true });
  pux.addEventListener("touchmove", mover, { passive: false });
  pux.addEventListener("touchend", soltar);
  pux.addEventListener("touchcancel", soltar);
  pux.addEventListener("click", (e) => { e.preventDefault(); if (!arrastou) alternarGaveta(g, !g.classList.contains("aberta")); arrastou = false; });
}

function atualizarArmazem() {
  const txt = {
    nuvem: "Seus registros ficam salvos na sua conta Claude e aparecem em qualquer aparelho em que você abrir esta página.",
    conectando: "Conectando à sua conta para salvar seus registros...",
    local: "Seus registros ficam salvos só neste aparelho e neste navegador. Baixe um backup de vez em quando.",
  }[Armazem.estado] || "";
  $$("#armazem").forEach((el) => { el.className = "armazem" + (Armazem.estado === "nuvem" ? " nuvem" : ""); el.innerHTML = `<i aria-hidden="true"></i>${esc(txt)}`; });
  const r = $("#armazem-rodape");
  if (r) r.textContent = txt;
}

// ================= Ações (cliques) =================
function definirUI(caminho, valor) {
  const [a, b] = caminho.split(".");
  if (UI[a] && b in UI[a]) UI[a][b] = valor;
}
function alternarFav(lista, id, max, nome) {
  const l = R.favoritos[lista];
  if (!l.length && V[lista === "personagens" ? "favPEx" : "favOEx"]) toast("Seus favoritos de verdade substituem os de exemplo.");
  const i = l.indexOf(id);
  if (i >= 0) { l.splice(i, 1); toast("Tirado dos favoritos."); }
  else { if (l.length >= max) l.shift(); l.push(id); toast(`${nome} está nos seus ${max} favoritos.`); }
  salvar("perfil");
  desenhar({ manterScroll: true });
}
function partilharPersonagem(pid) {
  const p = C.P.get(pid);
  const g = progressoPersonagem(pid);
  abrirCartao({ pct: g.pct, alvo: p.nome, artigoAlvo: artigoDe(p) === "a" ? "da" : "do", detalhe: `${g.vistas} de ${plural(g.total, "obra", "obras")}`, cor: corValida(COR_FRANQ[p.franquia]), obras: g.obras.length ? g.obras : obrasDoPersonagem(pid).slice(0, 5), arquivo: `heroteca-${pid}.png` });
}
function partilharUniverso(uid) {
  const u = C.U.get(uid);
  const g = progressoUniverso(uid);
  abrirCartao({ pct: g.pct, alvo: u.nome, artigoAlvo: "de", detalhe: `${g.vistas} de ${plural(g.total, "obra", "obras")}`, cor: u.cor, obras: g.obras.length ? g.obras : u.obras.slice(0, 5), arquivo: `heroteca-${uid}.png` });
}
async function copiar(texto, onde) {
  try { await navigator.clipboard.writeText(texto); if (onde) onde.textContent = "Copiado!"; else toast("Copiado!"); return true; }
  catch (e) { toast("Não deu para copiar sozinho. Selecione o texto e copie."); return false; }
}
const ACOES = {
  pular: () => $("#conteudo").focus(),
  mais: (el) => { const k = el.dataset.k; LIMITES[k] = limiteDe(k) + POR_VEZ; desenhar({ manterScroll: true }); },
  lado: () => {
    LADO_GUIA = LADO_GUIA === "esq" ? "dir" : "esq";
    try { localStorage.setItem("heroteca-lado", LADO_GUIA); } catch (e) { /* sem cache */ }
    desenhar({ manterScroll: true });
  },

  recarregar: () => iniciar(),
  registrar: () => abrirBusca("registrar"),
  buscar: () => abrirBusca("ir"),
  "modal-fechar": () => fecharModal(),
  "confirmar-sim": () => { const fn = CONFIRMA; fecharModal(); if (fn) fn(); },
  trilho: (b) => { const t = document.getElementById(b.dataset.alvo); if (t) t.scrollBy({ left: Number(b.dataset.d) * t.clientWidth * 0.8, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); },
  filtro: (b) => { definirUI(b.dataset.k, b.dataset.v); desenhar({ manterScroll: true }); },
  status: (b) => {
    const id = b.dataset.obra, s = b.dataset.s, o = C.O.get(id);
    let novo;
    mudarObra(id, (e) => { e.status = e.status === s ? undefined : s; novo = e.status; });
    toast(novo ? `Marcado: ${nomeStatus(novo, o)}` : "Status tirado.");
    desenhar({ manterScroll: true });
  },
  "nota-obra": (b) => {
    const n = Number(b.dataset.n);
    mudarObra(b.dataset.alvo, (e) => { e.nota = e.nota === n ? undefined : n; if (e.nota && (!e.status || e.status === "quero")) e.status = "terminei"; });
    desenhar({ manterScroll: true });
  },
  curtir: (b) => { mudarObra(b.dataset.obra, (e) => { e.curtiu = e.curtiu ? undefined : true; }); desenhar({ manterScroll: true }); },
  ep: (b) => {
    const id = b.dataset.obra, t = Number(b.dataset.t), n = Number(b.dataset.e);
    UI.temps[`${id}#${t}`] = true;
    let completou = false;
    mudarObra(id, (e) => {
      e.eps = e.eps || {};
      const s = new Set(e.eps[t] || []);
      if (s.has(n)) s.delete(n); else s.add(n);
      e.eps[t] = [...s].sort((a, b2) => a - b2);
      if (!e.status || e.status === "quero") e.status = "vendo";
      completou = conferirCompleta(id, e);
    });
    if (completou) toast("Tudo visto! Marcamos como terminada.");
    desenhar({ manterScroll: true });
  },
  "temp-toda": (b) => {
    const id = b.dataset.obra, t = Number(b.dataset.t), o = C.O.get(id);
    const tt = o.temporadas.find((x) => x.n === t);
    UI.temps[`${id}#${t}`] = true;
    let completou = false;
    mudarObra(id, (e) => {
      e.eps = e.eps || {};
      e.eps[t] = (e.eps[t] || []).length === tt.eps ? [] : faixaNum(1, tt.eps);
      if (!e.status || e.status === "quero") e.status = "vendo";
      completou = conferirCompleta(id, e);
    });
    if (completou) toast("Tudo visto! Marcamos como terminada.");
    desenhar({ manterScroll: true });
  },
  "temp-vista": (b) => {
    const id = b.dataset.obra, t = Number(b.dataset.t);
    let completou = false;
    mudarObra(id, (e) => {
      const s = new Set(e.temps || []);
      if (s.has(t)) s.delete(t); else s.add(t);
      e.temps = [...s].sort((a, b2) => a - b2);
      if (!e.status || e.status === "quero") e.status = "vendo";
      completou = conferirCompleta(id, e);
    });
    if (completou) toast("Tudo visto! Marcamos como terminada.");
    desenhar({ manterScroll: true });
  },
  ed: (b) => {
    const id = b.dataset.obra, i = Number(b.dataset.i);
    let completou = false;
    mudarObra(id, (e) => {
      const s = new Set(e.eds || []);
      if (s.has(i)) s.delete(i); else s.add(i);
      e.eds = [...s].sort((a, b2) => a - b2);
      if (!e.status || e.status === "quero") e.status = "vendo";
      completou = conferirCompleta(id, e);
    });
    if (completou) toast("Leitura completa! Marcamos como terminada.");
    desenhar({ manterScroll: true });
  },
  "eds-todas": (b) => {
    const id = b.dataset.obra, o = C.O.get(id);
    let completou = false;
    mudarObra(id, (e) => {
      e.eds = (e.eds || []).length === o.edicoes.length ? [] : o.edicoes.map((_, k) => k);
      if (!e.status || e.status === "quero") e.status = "vendo";
      completou = conferirCompleta(id, e);
    });
    if (completou) toast("Leitura completa! Marcamos como terminada.");
    desenhar({ manterScroll: true });
  },
  "eps-n": (b) => {
    const id = b.dataset.obra, o = C.O.get(id), d = Number(b.dataset.d);
    mudarObra(id, (e) => {
      e.vistos = Math.max(0, Math.min(o.episodios, (e.vistos || 0) + d));
      if (e.vistos && (!e.status || e.status === "quero")) e.status = "vendo";
      if (e.vistos === o.episodios) e.status = "terminei";
    });
    desenhar({ manterScroll: true });
  },
  "log-abrir": (b) => abrirRegistro(b.dataset.obra, { t: b.dataset.t, e: b.dataset.e, i: b.dataset.i }),
  "log-editar": (b) => { const l = R.logs.find((x) => x.id === b.dataset.log); if (l) abrirRegistro(l.obra, { logId: l.id }); },
  "log-ver": (b) => verExemplo(b.dataset.log),
  "nota-versao": (b) => {
    const k = b.dataset.alvo, n = Number(b.dataset.n);
    const v = C.versoes.get(k);
    if (!v || !podeAvaliarVersao(v)) { toast("Veja ou leia uma obra desta versão para dar nota."); return; }
    if (V.persNotas[k] === n) { if (EX.persNotas[k] && !R.ocultarExemplos) R.persNotas[k] = 0; else delete R.persNotas[k]; }
    else R.persNotas[k] = n;
    salvar("perfil");
    desenhar({ manterScroll: true });
  },
  "versao-mais": (b) => { UI.versoes[b.dataset.alvo] = !UI.versoes[b.dataset.alvo]; desenhar({ manterScroll: true }); },
  "fav-pers": (b) => alternarFav("personagens", b.dataset.p, 4, C.P.get(b.dataset.p).nome),
  "fav-obra": (b) => alternarFav("obras", b.dataset.obra, 4, C.O.get(b.dataset.obra).titulo),
  "lista-add": (b) => abrirAddLista(b.dataset.obra),
  "lista-alternar": (b) => {
    const l = R.listas.find((x) => x.id === b.dataset.lista);
    if (!l) return;
    const id = b.dataset.obra;
    const i = l.itens.indexOf(id);
    if (i >= 0) l.itens.splice(i, 1); else l.itens.push(id);
    l.t = Date.now();
    salvar("listas");
    toast(i >= 0 ? "Tirada da lista." : `Adicionada a “${l.titulo}”.`);
    abrirAddLista(id);
    desenhar({ manterScroll: true });
  },
  "lista-nova": () => abrirNovaLista(),
  "lista-editar": (b) => { const l = R.listas.find((x) => x.id === b.dataset.lista); if (l) abrirNovaLista(l); },
  "lista-apagar": (b) => {
    const l = R.listas.find((x) => x.id === b.dataset.lista);
    if (!l) return;
    confirmar("Apagar lista", `Apagar a lista “${esc(l.titulo)}”? As obras continuam no seu diário.`, "Apagar", () => {
      R.listas = R.listas.filter((x) => x.id !== l.id);
      R.apagados[l.id] = Date.now();
      salvar("listas", "perfil");
      location.hash = "listas";
      toast("Lista apagada.");
    });
  },
  "lista-buscar": (b) => abrirBusca("lista:" + b.dataset.lista),
  "lista-mover": (b) => {
    const l = R.listas.find((x) => x.id === b.dataset.lista);
    const i = Number(b.dataset.i), j = i + Number(b.dataset.d);
    if (!l || j < 0 || j >= l.itens.length) return;
    [l.itens[i], l.itens[j]] = [l.itens[j], l.itens[i]];
    l.t = Date.now();
    salvar("listas");
    desenhar({ manterScroll: true });
  },
  "lista-tirar": (b) => {
    const l = R.listas.find((x) => x.id === b.dataset.lista);
    if (!l) return;
    l.itens = l.itens.filter((x) => x !== b.dataset.obra);
    l.t = Date.now();
    salvar("listas");
    desenhar({ manterScroll: true });
  },
  "qb-obra": (b) => {
    const id = b.dataset.obra;
    if (MODO_BUSCA === "registrar") { abrirRegistro(id); return; }
    if (MODO_BUSCA.startsWith("lista:")) {
      const l = R.listas.find((x) => x.id === MODO_BUSCA.slice(6));
      if (!l) return;
      if (!l.itens.includes(id)) { l.itens.push(id); l.t = Date.now(); salvar("listas"); }
      toast(`Adicionada a “${l.titulo}”.`);
      const q = $("#qb");
      $("#qb-res").innerHTML = resultadosBusca(q ? q.value : "");
      desenhar({ manterScroll: true });
    }
  },
  seguir: (b) => {
    const id = b.dataset.u;
    const i = R.seguindo.indexOf(id);
    if (i >= 0) R.seguindo.splice(i, 1); else R.seguindo.push(id);
    salvar("perfil");
    desenhar({ manterScroll: true });
  },
  spoiler: (b) => b.closest(".spoiler").classList.add("aberto"),
  "curtir-res": (b) => {
    const id = b.dataset.r;
    if (R.curtidas[id]) delete R.curtidas[id]; else R.curtidas[id] = true;
    salvar("perfil");
    desenhar({ manterScroll: true });
  },
  denunciar: (b) => abrirDenuncia(b.dataset.r),
  "denuncia-enviar": () => { fecharModal(); toast("Obrigado! No site de verdade, isso vai para a moderação."); },
  "partilhar-pers": (b) => partilharPersonagem(b.dataset.p),
  "partilhar-uni": (b) => partilharUniverso(b.dataset.u),
  "cartao-salvar": async () => { if (!CARTAO.blob) return; if (!(await baixar(CARTAO.nome, CARTAO.blob))) toast("Não deu para salvar aqui. Segure a imagem para salvar."); },
  "cartao-copiar": () => copiar(CARTAO.texto),
  "copiar-backup": () => copiar($("#backup-txt").value),
  exemplos: () => {
    R.ocultarExemplos = !R.ocultarExemplos;
    salvar("perfil");
    fecharModal();
    toast(R.ocultarExemplos ? "Exemplos apagados. Agora é tudo seu!" : "Exemplos de volta.");
    desenhar({ manterScroll: true });
  },
  exportar: () => exportarBackup(),
  importar: () => { const f = $("#arquivo-importar"); if (f) f.click(); },
  "apagar-tudo": () => confirmar("Apagar tudo", "Isso apaga seus registros, notas, listas e o perfil. Não dá para desfazer. Quer mesmo?", "Apagar tudo", () => {
    const apagados = { ...R.apagados };
    for (const l of [...R.logs, ...R.listas]) apagados[l.id] = Date.now();
    R = novoEstado();
    R.apagados = Object.fromEntries(Object.entries(apagados).slice(-300));
    salvar("perfil", "obras", "diario", "listas");
    toast("Tudo apagado.");
    desenhar();
  }),
  "perfil-editar": () => abrirEditarPerfil(),
  "perfil-tudo": () => { UI.perfilTudo = !UI.perfilTudo; desenhar({ manterScroll: true }); },
  "f-nota": (b) => { const n = Number(b.dataset.n); FORM.nota = FORM.nota === n ? 0 : n; $("#f-aval").innerHTML = avaliador(FORM.nota, "f-nota", "form", "Nota"); const nb = $(`#f-aval [data-n="${n}"]`); if (nb) nb.focus(); },
  "f-curtir": (b) => { FORM.curtiu = !FORM.curtiu; b.setAttribute("aria-pressed", String(FORM.curtiu)); b.innerHTML = ic("coracao", FORM.curtiu ? "ic--cheio" : ""); },
  "f-tag-add": (b) => { if (FORM.tags.length < 12 && !FORM.tags.includes(b.dataset.v)) FORM.tags.push(b.dataset.v); $("#f-tags").innerHTML = tagsForm(); },
  "f-tag-rm": (b) => { FORM.tags = FORM.tags.filter((t) => t !== b.dataset.v); $("#f-tags").innerHTML = tagsForm(); },
  "f-salvar": () => salvarRegistro(),
  "f-apagar": () => { const id = FORM.logId; confirmar("Apagar registro", "Apagar este registro do diário?", "Apagar", () => apagarRegistro(id)); },
  "j-chutar": () => confirmarJogo(),
  "j-escolher": (b) => chutar(C.jogoPorId.get(b.dataset.id)),
  "j-copiar": () => copiar(textoDoResultado(), $("#j-copiado")),
};

// ================= Eventos =================
document.addEventListener("click", (ev) => {
  const combo = $("#j-combo");
  if (combo && !combo.contains(ev.target)) fecharSugJogo();
  const b = ev.target.closest("[data-acao]");
  if (!b || b.disabled) return;
  const f = ACOES[b.dataset.acao];
  if (!f) return;
  ev.preventDefault();
  try { f(b, ev); } catch (e) { console.error(e); toast("Algo deu errado. Tente de novo."); }
});
$("#modal").addEventListener("click", (ev) => { if (ev.target.id === "modal") fecharModal(); });
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && !$("#modal").hidden) { fecharModal(); return; }
  const t = ev.target;
  if (t.id === "j-in") {
    const total = J.sug.length;
    if (ev.key === "ArrowDown" && total) { J.ativo = (J.ativo + 1) % total; marcarSugJogo(); ev.preventDefault(); }
    else if (ev.key === "ArrowUp" && total) { J.ativo = (J.ativo - 1 + total) % total; marcarSugJogo(); ev.preventDefault(); }
    else if (ev.key === "Enter") { ev.preventDefault(); confirmarJogo(); }
    else if (ev.key === "Escape") fecharSugJogo();
  } else if (t.id === "f-tag" && (ev.key === "Enter" || ev.key === ",")) {
    ev.preventDefault();
    const v = slug(t.value).slice(0, 30);
    if (v && FORM && FORM.tags.length < 12 && !FORM.tags.includes(v)) FORM.tags.push(v);
    t.value = "";
    if (FORM) $("#f-tags").innerHTML = tagsForm();
  } else if (t.id === "qb" && ev.key === "Enter") {
    ev.preventDefault();
    const primeiro = $("#qb-res .qr:not([disabled])");
    if (primeiro) primeiro.click();
  }
});
document.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.id === "exp-q") { UI.explorar.q = t.value; const r = $("#exp-res"); r.innerHTML = resultadosExplorar(); hidratarImagens(r); }
  else if (t.id === "pers-q") { UI.personagens.q = t.value; $("#pers-res").innerHTML = resultadosPersonagens(); }
  else if (t.id === "qb") { const r = $("#qb-res"); r.innerHTML = resultadosBusca(t.value); hidratarImagens(r); }
  else if (t.id === "j-in") mostrarSugJogo();
});
document.addEventListener("focusin", (ev) => { if (ev.target.id === "j-in" && ev.target.value.trim()) mostrarSugJogo(); });
document.addEventListener("change", (ev) => {
  const t = ev.target;
  if (t.dataset && t.dataset.filtro) { definirUI(t.dataset.filtro, t.value); desenhar({ manterScroll: true }); }
  else if (t.id === "f-temp" && FORM) { $("#f-ep").innerHTML = opcoesEp(C.O.get(FORM.obra), t.value, null); }
  else if (t.id === "arquivo-importar") { importarBackup(t.files && t.files[0]); t.value = ""; }
});
document.addEventListener("toggle", (ev) => {
  const d = ev.target;
  if (d.matches && d.matches("details[data-temp]")) UI.temps[d.dataset.temp] = d.open;
}, true);
document.addEventListener("submit", (ev) => {
  const f = ev.target;
  ev.preventDefault();
  const tipo = f.dataset.form;
  if (tipo === "lista-rapida") {
    const titulo = $("#nl-titulo").value.trim();
    const obra = FORM_LISTA_OBRA;
    if (!titulo) return;
    const l = criarLista(titulo, "", obra ? [obra] : []);
    if (!l) return;
    toast(`Lista “${l.titulo}” criada.`);
    abrirAddLista(obra);
    desenhar({ manterScroll: true });
  } else if (tipo === "lista-nova") {
    const titulo = $("#lista-titulo").value.trim();
    if (!titulo) return;
    const l = criarLista(titulo, $("#lista-desc").value);
    fecharModal();
    if (l) location.hash = "lista-" + l.id;
  } else if (tipo === "lista-editar") {
    const l = R.listas.find((x) => x.id === f.dataset.lista);
    const titulo = $("#lista-titulo").value.trim();
    if (!l || !titulo) return;
    l.titulo = titulo.slice(0, 80);
    l.descricao = $("#lista-desc").value.trim().slice(0, 400);
    l.t = Date.now();
    salvar("listas");
    fecharModal();
    desenhar({ manterScroll: true });
  } else if (tipo === "perfil") {
    R.perfil = sanear({ perfil: { nome: $("#p-nome").value.trim(), usuario: $("#p-usuario").value.trim(), bio: $("#p-bio").value.trim() } }).perfil;
    salvar("perfil");
    fecharModal();
    toast("Perfil salvo.");
    desenhar({ manterScroll: true });
  }
});
window.addEventListener("hashchange", () => { fecharModal(); fecharSugJogo(); desenhar(); });

// ================= Começo =================
function tique() {
  const h = hojeEmSP();
  if (h !== HOJE) { HOJE = h; desenhar({ manterScroll: true }); return; }
  atualizarContagem();
}
let jaIniciou = false;
async function iniciar() {
  try {
    if (!C.obras.length) { await carregarCatalogo(); prepararJogo(); }
  } catch (e) {
    $("#conteudo").innerHTML = `<div class="q vazio" style="margin-top:20px"><h1 class="h1">O catálogo não carregou</h1><p>Confira a internet e tente de novo.</p><button class="bt bt--forte" data-acao="recarregar">Tentar de novo</button></div>`;
    return;
  }
  R = sanear(lerLocal());
  mesclar();
  desenhar();
  if (jaIniciou) return;
  jaIniciou = true;
  ligarDicas();
  setInterval(tique, 1000);
  conectarNuvem();
  usarDownloads();
}
iniciar();
