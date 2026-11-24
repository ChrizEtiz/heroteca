// ================= Peças de tela =================
function partesTitulo(t) {
  const m = String(t).match(/^(.+?)(?::\s+|!\s+|\s+(?=Vol\.\s))(.+)$/);
  if (!m) return [t, ""];
  const principal = t.includes("!") && !t.includes(":") ? m[1] + "!" : m[1];
  return [principal, m[2]];
}
function capa(o, { status = true } = {}) {
  const u = C.U.get(o.universo);
  const h = hash(o.id);
  const v = h % 4;
  const [principal, sub] = partesTitulo(o.titulo);
  const len = principal.length;
  const tam = len > 22 ? "capa--xl" : len > 12 ? "capa--l" : "";
  const longo = len + sub.length > 34 ? "capa--tit-longo" : "";
  const e = status ? estObra(o.id) : null;
  const st = e && e.status ? `<span class="capa-st st-${e.status}">${ic(ICONE_STATUS[e.status])}</span>` : "";
  const img = TMDB.ativo && o.tmdb ? `<img class="capa-img" data-tmdb="${esc(o.id)}" alt="" loading="lazy">` : "";
  return `<span class="capa capa--v${v} ${tam} ${longo}" style="--c1:${u.cor};--b:${BURSTS[(h >>> 4) % BURSTS.length]}">`
    + `<span class="capa-fundo"></span>`
    + `<span class="capa-topo"><span class="capa-selo">${esc(FRANQ_CURTA[o.franquia] || o.franquia)}</span><span class="capa-ano">${esc(o.ano)}</span></span>`
    + `<span class="capa-tipo">${esc(FORMATO[o.formato].curto)}</span>`
    + `<span class="capa-titulo">${esc(principal)}${sub ? `<span class="capa-sub">${esc(sub)}</span>` : ""}</span>`
    + img + st + `</span>`;
}
function cardObra(o, extra = "") {
  const e = estObra(o.id);
  const meta = emBreve(o) ? (o.data ? `Estreia ${dataCurta(o.data)}` : `Previsto para ${o.ano}`) : `${o.ano} · ${FORMATO[o.formato].nome}`;
  return `<a class="ocard" href="#obra-${esc(o.id)}">${capa(o)}<span class="ocard-t">${esc(o.titulo)}</span>`
    + `<span class="ocard-m">${esc(meta)}${e && e.nota ? " · " + estrelas(e.nota) : ""}</span>${extra}</a>`;
}
function emblema(p, cls = "", cor) {
  return `<span class="emb ${cls}" style="--av:${corValida(cor || COR_FRANQ[p.franquia])}" aria-hidden="true">${esc(iniciais(p.nome))}</span>`;
}
function barra(pct, cls = "") {
  return `<span class="barra ${cls}" role="img" aria-label="${pct}%"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></span>`;
}
function uchip(u, tag = "a") {
  const atr = tag === "a" ? ` href="#universo-${esc(u.id)}"` : "";
  return `<${tag} class="uchip"${atr} style="--c:${u.cor};--ct:${corTexto(u.cor)}">${ic("globo")}${esc(u.nome)}</${tag}>`;
}
const papelChip = (p) => `<span class="papel papel--${esc(p)}">${esc(PAPEL[p] || p)}</span>`;
function cardPersonagem(p) {
  const vs = versoesDe(p.id);
  const g = progressoPersonagem(p.id);
  return `<a class="pcard" href="#personagem-${esc(p.id)}">${emblema(p, "emb--g")}<span class="pcard-n">${esc(p.nome)}</span>`
    + `<span class="pcard-m">${plural(vs.length, "versão", "versões")} · ${plural(g.total, "obra", "obras")}</span>`
    + `${barra(g.pct, "barra--fina")}</a>`;
}
function avaliador(valor, acao, alvo, rotulo, { mini = false, desligado = false } = {}) {
  let h = `<div class="aval ${mini ? "aval--mini" : ""}" role="group" aria-label="${esc(rotulo)}"${desligado ? ' aria-disabled="true"' : ""}>`;
  for (let i = 1; i <= 5; i++) {
    const cls = valor >= i * 2 ? "cheia" : valor === i * 2 - 1 ? "meia" : "";
    h += `<span class="aval-e ${cls}">${SVG_ESTRELA}`;
    for (const n of [i * 2 - 1, i * 2]) {
      h += `<button type="button" class="aval-b aval-b${n % 2 ? 1 : 2}" data-acao="${acao}" data-alvo="${esc(alvo)}" data-n="${n}"`
        + ` aria-label="${notaTxt(n)} de 5" aria-pressed="${valor === n}"${desligado ? " disabled" : ""}></button>`;
    }
    h += `</span>`;
  }
  return h + `</div>`;
}
function trilho(itens, { largo = false, id = "" } = {}) {
  return `<div class="trilho ${largo ? "trilho--largo" : ""}" ${id ? `id="${esc(id)}"` : ""} tabindex="0">${itens.join("")}</div>`;
}
function secao(titulo, corpo, { ver = "", verTxt = "Ver tudo", nota = "", id = "", botoes = "" } = {}) {
  return `<section class="sec"${id ? ` id="${esc(id)}"` : ""}><div class="sec-h"><h2 class="leg">${esc(titulo)}</h2>`
    + `<span class="acoes">${botoes}${ver ? `<a class="ver" href="${esc(ver)}">${esc(verTxt)}</a>` : ""}</span></div>`
    + (nota ? `<p class="sec-nota">${nota}</p>` : "") + corpo + `</section>`;
}
const botoesTrilho = (alvo) => `<span class="trilho-bts"><button class="icbt" data-acao="trilho" data-alvo="${esc(alvo)}" data-d="-1" aria-label="Anteriores">${ic("esq")}</button>`
  + `<button class="icbt" data-acao="trilho" data-alvo="${esc(alvo)}" data-d="1" aria-label="Próximos">${ic("dir")}</button></span>`;
function escopoTxt(l) {
  const o = C.O.get(l.obra);
  if (!l.escopo) return "";
  if (l.escopo.i != null) return o.edicoes[l.escopo.i];
  if (l.escopo.e) return `T${l.escopo.t} · E${l.escopo.e}`;
  return `Temporada ${l.escopo.t}`;
}
function textoResenha(l) {
  const corpo = esc(l.review).replace(/\n/g, "<br>");
  if (!l.spoiler) return `<div class="balao">${corpo}</div>`;
  return `<div class="balao spoiler"><div class="sp-txt">${corpo}</div><button type="button" class="sp-bt" data-acao="spoiler"><span>Tem spoiler · mostrar</span></button></div>`;
}
function autorDe(l) {
  if (l.autor && l.autor !== "eu") { const a = AMIGO.get(l.autor); return { nome: a.nome, cor: a.cor, link: `#usuario-${a.id}`, ex: true }; }
  const nome = R.perfil.nome || "Você";
  return { nome, cor: "#c2166b", link: "#perfil", ex: !!l.exemplo, eu: true };
}
function resenha(l, { comObra = false } = {}) {
  const a = autorDe(l);
  const o = C.O.get(l.obra);
  const curtidas = (l.base || 0) + (R.curtidas[l.id] ? 1 : 0);
  const ehMinha = a.eu && !l.exemplo;
  return `<article class="res">${emblema({ nome: a.nome, franquia: "" }, "", a.cor)}<div>`
    + `<div class="res-cab"><a href="${a.link}">${esc(a.nome)}</a>${a.ex ? '<span class="selo-ex">exemplo</span>' : ""}${estrelas(l.nota)}`
    + `${l.curtiu ? `<span class="mudo" title="Curtiu">${ic("coracao", "ic--cheio")}</span>` : ""}`
    + `<span class="mudo mini">${esc(haQuanto(l.data))}${l.rever ? " · revendo" : ""}${l.escopo ? " · " + esc(escopoTxt(l)) : ""}</span></div>`
    + (comObra ? `<a class="mini" href="#obra-${esc(o.id)}"><strong>${esc(o.titulo)}</strong> (${o.ano})</a>` : "")
    + textoResenha(l)
    + `<div class="res-acoes"><button class="mini-bt" data-acao="curtir-res" data-r="${esc(l.id)}" aria-pressed="${!!R.curtidas[l.id]}">${ic("coracao", R.curtidas[l.id] ? "ic--cheio" : "")}<span class="num">${curtidas}</span><span class="sr">curtidas</span></button>`
    + (ehMinha ? `<button class="mini-bt" data-acao="log-editar" data-log="${esc(l.id)}">${ic("lapis")}Editar</button>`
      : `<button class="mini-bt" data-acao="denunciar" data-r="${esc(l.id)}">${ic("bandeira")}Denunciar</button>`)
    + (l.tags ? l.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join("") : "")
    + `</div></div></article>`;
}
function itemFeed(l) {
  const a = AMIGO.get(l.autor);
  const o = C.O.get(l.obra);
  const verbo = o.formato === "hq" ? "leu" : l.rever ? "reviu" : "viu";
  return `<article class="q q--plano fi"><div><div class="fi-cab">${emblema({ nome: a.nome }, "", a.cor)}<span><a href="#usuario-${a.id}"><strong>${esc(a.nome)}</strong></a> ${verbo} `
    + `<a href="#obra-${esc(o.id)}"><strong>${esc(o.titulo)}</strong></a>${l.escopo ? ` <span class="mudo">(${esc(escopoTxt(l))})</span>` : ""}</span></div>`
    + `<div class="res-cab" style="margin-top:4px">${estrelas(l.nota)}<span class="mudo mini">${esc(haQuanto(l.data))}</span></div>`
    + (l.review ? textoResenha(l) : "") + `</div><a href="#obra-${esc(o.id)}" aria-label="${esc(o.titulo)}">${capa(o, { status: false })}</a></article>`;
}
function cardLista(l, autor) {
  const itens = l.itens.map((id) => C.O.get(id)).filter(Boolean);
  const vistas = itens.filter((o) => vista(o.id)).length;
  return `<a class="lcard" href="#lista-${esc(l.id)}"><span class="lcard-capas">${itens.slice(0, 5).map((o) => capa(o, { status: false })).join("")}</span>`
    + `<span class="lcard-t">${l.oficial ? '<span class="oficial">Oficial</span> ' : ""}${esc(l.titulo)}</span>`
    + `<span class="lcard-m">${plural(itens.length, "obra", "obras")} · você viu ${vistas}${autor ? " · por " + esc(autor) : ""}${l.exemplo ? ' · <span class="selo-ex">exemplo</span>' : ""}</span></a>`;
}
function progressoTxt(o, e) {
  if (!e) return "";
  if (o.temporadas && o.temporadas.some((t) => t.eps)) {
    const tot = totalEps(o), vis = vistosEps(o, e);
    let ult = 0;
    for (const t of o.temporadas) if ((e.eps?.[t.n] || []).length) ult = t.n;
    const t = o.temporadas.find((x) => x.n === (ult || 1));
    return `${ult ? `T${ult} · ${(e.eps?.[ult] || []).length}/${t.eps}` : "Começando"} · ${Math.round((vis / tot) * 100)}%`;
  }
  if (o.edicoes) return `${(e.eds || []).length}/${o.edicoes.length} edições`;
  if (o.episodios) return `${e.vistos || 0}/${o.episodios} episódios`;
  return nomeStatus(e.status, o);
}
function pctObra(o, e) {
  if (!e) return 0;
  if (o.temporadas && totalEps(o)) return Math.round((vistosEps(o, e) / totalEps(o)) * 100);
  if (o.edicoes) return Math.round(((e.eds || []).length / o.edicoes.length) * 100);
  if (o.episodios) return Math.round(((e.vistos || 0) / o.episodios) * 100);
  return e.status === "terminei" ? 100 : 0;
}
