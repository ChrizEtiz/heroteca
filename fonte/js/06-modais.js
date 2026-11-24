// ================= Janelas (modais), avisos e cartão de compartilhar =================
let voltarFoco = null;
let CONFIRMA = null;
function abrirModal(titulo, corpo, pe = "") {
  const m = $("#modal");
  if (m.hidden) voltarFoco = document.activeElement;
  m.innerHTML = `<div class="modal-cx" role="dialog" aria-modal="true" aria-labelledby="modal-t"><div class="modal-cab"><h2 class="h2" id="modal-t">${esc(titulo)}</h2>`
    + `<button class="icbt" data-acao="modal-fechar" aria-label="Fechar">${ic("x")}</button></div><div class="modal-corpo">${corpo}</div>${pe ? `<div class="modal-pe">${pe}</div>` : ""}</div>`;
  m.hidden = false;
  document.body.style.overflow = "hidden";
  hidratarImagens(m);
  const alvo = m.querySelector("[data-foco]") || m.querySelector("input:not([type=hidden]):not([type=file]), textarea, select") || m.querySelector(".modal-corpo button, .modal-corpo a");
  setTimeout(() => { try { alvo && alvo.focus({ preventScroll: true }); } catch (e) { /* ignora */ } }, 40);
}
function fecharModal() {
  const m = $("#modal");
  if (m.hidden) return;
  m.hidden = true;
  m.innerHTML = "";
  document.body.style.overflow = "";
  FORM = null;
  CONFIRMA = null;
  if (CARTAO.url) { URL.revokeObjectURL(CARTAO.url); CARTAO.url = ""; }
  if (voltarFoco && document.contains(voltarFoco)) { try { voltarFoco.focus({ preventScroll: true }); } catch (e) { /* ignora */ } }
  voltarFoco = null;
}
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { t.hidden = true; }, 3400);
}
function pow(texto) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { toast(texto); return; }
  const el = $("#pow");
  el.innerHTML = `<span>${esc(texto)}</span>`;
  el.hidden = false;
  clearTimeout(pow.t);
  pow.t = setTimeout(() => { el.hidden = true; el.innerHTML = ""; }, 950);
}
function confirmar(titulo, texto, rotulo, fn, perigo = true) {
  CONFIRMA = fn;
  abrirModal(titulo, `<p style="font-size:17px">${texto}</p>`, `<button class="bt" data-acao="modal-fechar">Cancelar</button><button class="bt ${perigo ? "bt--perigo" : "bt--forte"}" data-acao="confirmar-sim" data-foco>${esc(rotulo)}</button>`);
}

// ---------- Busca rápida (buscar, registrar, adicionar à lista) ----------
let MODO_BUSCA = "ir";
function abrirBusca(modo) {
  MODO_BUSCA = modo;
  const titulo = modo === "registrar" ? "O que você viu ou leu?" : modo.startsWith("lista:") ? "Adicionar à lista" : "Buscar";
  abrirModal(titulo, `<div class="busca-g">${ic("busca")}<input class="entrada" id="qb" type="search" autocomplete="off" placeholder="${modo === "ir" ? "Obra, personagem, universo ou pessoa" : "Filme, série, desenho ou HQ"}" aria-label="Buscar" data-foco></div><div class="qres" id="qb-res">${resultadosBusca("")}</div>`);
}
function itemBuscaObra(o) {
  const u = C.U.get(o.universo);
  const dentro = MODO_BUSCA.startsWith("lista:") && (R.listas.find((l) => l.id === MODO_BUSCA.slice(6))?.itens || []).includes(o.id);
  const meta = `${o.ano} · ${esc(FORMATO[o.formato].nome)} · ${esc(u.nome)}${dentro ? " · já está na lista" : ""}`;
  if (MODO_BUSCA === "ir") return `<a class="qr" href="#obra-${esc(o.id)}">${capa(o, { status: false })}<span><span class="qr-t" style="display:block">${esc(o.titulo)}</span><span class="qr-m">${meta}</span></span></a>`;
  return `<button class="qr" data-acao="qb-obra" data-obra="${esc(o.id)}"${dentro ? " disabled" : ""}>${capa(o, { status: false })}<span><span class="qr-t" style="display:block">${esc(o.titulo)}</span><span class="qr-m">${meta}</span></span></button>`;
}
function resultadosBusca(texto) {
  const q = normalizar(texto);
  const soObras = MODO_BUSCA !== "ir";
  if (!q) {
    const vendo = Object.entries(V.obras).filter(([id, e]) => e.status === "vendo" && C.O.has(id)).map(([id]) => C.O.get(id));
    const quero = Object.entries(V.obras).filter(([id, e]) => e.status === "quero" && C.O.has(id)).map(([id]) => C.O.get(id)).filter((o) => !emBreve(o));
    const pop = C.obras.map((o) => ({ o, ...mediaObra(o.id) })).filter((x) => x.n >= 2).sort((a, b) => b.n - a.n || b.m - a.m).map((x) => x.o);
    const sug = [...new Set([...vendo, ...quero, ...pop])].filter((o) => !soObras || !emBreve(o)).slice(0, 8);
    return `<p class="qgrupo">${vendo.length || quero.length ? "Sugestões para você" : "Populares"}</p>${sug.map(itemBuscaObra).join("")}`;
  }
  const obras = C.obras.filter((o) => o.busca.includes(q) && (!soObras || !emBreve(o))).sort(relevancia(q)).slice(0, soObras ? 24 : 8);
  let h = obras.length ? `<p class="qgrupo">Obras</p>${obras.map(itemBuscaObra).join("")}` : "";
  if (!soObras) {
    const pers = C.personagens.filter((p) => p.busca.some((b) => b.includes(q))).slice(0, 6);
    const unis = C.universos.filter((u) => u.busca.includes(q)).slice(0, 4);
    const pess = [...C.pessoas.values()].filter((p) => normalizar(p.nome).includes(q)).slice(0, 5);
    if (pers.length) h = `<p class="qgrupo">Personagens</p>${pers.map((p) => `<a class="qr" href="#personagem-${esc(p.id)}">${emblema(p)}<span><span class="qr-t" style="display:block">${esc(p.nome)}</span><span class="qr-m">${esc(p.identidade || p.franquia)}</span></span></a>`).join("")}` + h;
    if (unis.length) h += `<p class="qgrupo">Universos</p>${unis.map((u) => `<a class="qr" href="#universo-${esc(u.id)}"><span class="emb" style="--av:${u.cor}" aria-hidden="true">${ic("globo")}</span><span><span class="qr-t" style="display:block">${esc(u.nome)}</span><span class="qr-m">${esc(u.midia)} · ${esc(u.anos)}</span></span></a>`).join("")}`;
    if (pess.length) h += `<p class="qgrupo">Pessoas</p>${pess.map((p) => `<a class="qr" href="#pessoa-${esc(p.id)}">${emblema({ nome: p.nome }, "", "#6b6475")}<span><span class="qr-t" style="display:block">${esc(p.nome)}</span><span class="qr-m">${plural(p.creditos.length, "crédito", "créditos")}</span></span></a>`).join("")}`;
  }
  return h || `<p class="mudo">Nada com “${esc(texto)}” ainda. O catálogo do beta é pequeno: tente outro nome ou em inglês.</p>`;
}

// ---------- Registrar no diário ----------
let FORM = null;
const SUGESTOES_TAG = ["cinema", "streaming", "dublado", "legendado", "maratona", "com-amigos", "hq-fisica", "digital"];
function abrirRegistro(obraId, { t, e, i, logId } = {}) {
  const o = C.O.get(obraId);
  if (!o) return;
  const l = logId ? R.logs.find((x) => x.id === logId) : null;
  const escopo = l ? l.escopo : t ? { t: Number(t), e: e ? Number(e) : undefined } : i != null && i !== "" ? { i: Number(i) } : null;
  const est = estObra(o.id) || {};
  FORM = { obra: o.id, logId: l ? l.id : null, nota: l ? l.nota || 0 : !escopo ? est.nota || 0 : 0, curtiu: l ? !!l.curtiu : !escopo && !!est.curtiu, tags: l ? [...(l.tags || [])] : [] };
  let seletor = "";
  if (o.temporadas) {
    const tSel = escopo && escopo.t ? escopo.t : "";
    seletor = `<div class="linha2"><label class="campo"><span>O que você está registrando?</span><select class="entrada" id="f-temp"><option value="">A série inteira</option>${o.temporadas.map((x) => `<option value="${x.n}"${tSel === x.n ? " selected" : ""}>Temporada ${x.n}</option>`).join("")}</select></label>
      <label class="campo"><span>Episódio</span><select class="entrada" id="f-ep">${opcoesEp(o, tSel, escopo && escopo.e)}</select></label></div>`;
  } else if (o.edicoes) {
    const iSel = escopo && escopo.i != null ? escopo.i : -1;
    seletor = `<label class="campo"><span>O que você está registrando?</span><select class="entrada" id="f-ed"><option value="">A história inteira</option>${o.edicoes.map((x, k) => `<option value="${k}"${iSel === k ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></label>`;
  }
  const corpo = `<div class="reg-obra">${capa(o, { status: false })}<div><strong style="font-size:18px">${esc(o.titulo)}</strong><br><span class="mudo">${o.ano} · ${esc(FORMATO[o.formato].nome)}</span></div></div>
    ${seletor}
    <div class="linha2"><label class="campo"><span>${o.formato === "hq" ? "Quando leu" : "Quando viu"}</span><input class="entrada" type="date" id="f-data" value="${esc(l ? l.data : HOJE)}" max="${HOJE}"></label>
      <label class="check" style="align-self:end"><input type="checkbox" id="f-rever"${(l ? l.rever : vista(o.id)) ? " checked" : ""}> ${o.formato === "hq" ? "Já tinha lido antes" : "Já tinha visto antes"}</label></div>
    <div class="nota-linha"><div><span class="h3">Nota</span><div id="f-aval">${avaliador(FORM.nota, "f-nota", "form", "Nota")}</div></div>
      <button class="coracao" type="button" data-acao="f-curtir" aria-pressed="${FORM.curtiu}" aria-label="Curti">${ic("coracao", FORM.curtiu ? "ic--cheio" : "")}</button></div>
    <label class="campo"><span>Resenha (opcional)</span><textarea class="entrada" id="f-review" maxlength="6000" placeholder="O que achou? Quem roubou a cena?">${esc(l ? l.review || "" : "")}</textarea></label>
    <label class="check"><input type="checkbox" id="f-spoiler"${l && l.spoiler ? " checked" : ""}> Tem spoiler (fica borrado até a pessoa tocar)</label>
    <div class="campo"><span>Tags</span><div class="chips" id="f-tags">${tagsForm()}</div>
      <input class="entrada" id="f-tag" maxlength="30" placeholder="Escreva uma tag e aperte Enter" autocomplete="off" enterkeyhint="done"></div>`;
  const pe = `${l ? `<button class="bt bt--perigo" data-acao="f-apagar">${ic("lixo")}Apagar</button>` : ""}<button class="bt" data-acao="modal-fechar">Cancelar</button><button class="bt bt--forte" data-acao="f-salvar">${ic("check")}Salvar</button>`;
  abrirModal(l ? "Editar registro" : "Registrar", corpo, pe);
}
function opcoesEp(o, tSel, eSel) {
  const t = o.temporadas.find((x) => x.n === Number(tSel));
  if (!t) return `<option value="">Todos</option>`;
  if (!t.eps) return `<option value="">Temporada inteira</option>`;
  return `<option value="">Temporada inteira</option>${faixaNum(1, t.eps).map((n) => `<option value="${n}"${Number(eSel) === n ? " selected" : ""}>Episódio ${n}</option>`).join("")}`;
}
function tagsForm() {
  const sel = FORM.tags.map((t) => `<button type="button" class="chip" data-acao="f-tag-rm" data-v="${esc(t)}" aria-pressed="true">#${esc(t)} ${ic("x")}</button>`).join("");
  const sug = SUGESTOES_TAG.filter((t) => !FORM.tags.includes(t)).map((t) => `<button type="button" class="chip" data-acao="f-tag-add" data-v="${esc(t)}" aria-pressed="false">#${esc(t)}</button>`).join("");
  return sel + sug;
}
function lerEscopo(o) {
  if (o.temporadas) {
    const t = Number($("#f-temp")?.value || 0);
    if (!t) return null;
    const e = Number($("#f-ep")?.value || 0);
    return e ? { t, e } : { t };
  }
  if (o.edicoes) {
    const v = $("#f-ed")?.value;
    return v === "" || v == null ? null : { i: Number(v) };
  }
  return null;
}
function salvarRegistro() {
  if (!FORM) return;
  const o = C.O.get(FORM.obra);
  const data = $("#f-data").value;
  if (!dataValida(data)) { toast("Escolha uma data válida."); return; }
  if (data > HOJE) { toast("A data não pode ser depois de hoje."); return; }
  const escopo = lerEscopo(o);
  const bruto = {
    obra: o.id, data, nota: FORM.nota, curtiu: FORM.curtiu, rever: $("#f-rever").checked, spoiler: $("#f-spoiler").checked,
    review: $("#f-review").value, tags: FORM.tags, escopo,
  };
  if (FORM.logId) {
    const i = R.logs.findIndex((x) => x.id === FORM.logId);
    if (i >= 0) R.logs[i] = sanearLog({ ...bruto, id: FORM.logId, criado: R.logs[i].criado, t: Date.now() });
  } else {
    R.logs.push(sanearLog({ ...bruto, id: idNovo("l"), criado: Date.now(), t: Date.now() }));
  }
  mudarObra(o.id, (e) => {
    if (!escopo) {
      e.status = "terminei";
      if (FORM.nota) e.nota = FORM.nota;
      if (FORM.curtiu) e.curtiu = true;
      if (o.temporadas) { e.eps = {}; e.temps = []; for (const t of o.temporadas) { if (t.eps) e.eps[t.n] = faixaNum(1, t.eps); else e.temps.push(t.n); } }
      if (o.edicoes) e.eds = o.edicoes.map((_, k) => k);
      if (o.episodios) e.vistos = o.episodios;
      return;
    }
    if (escopo.i != null) e.eds = [...new Set([...(e.eds || []), escopo.i])].sort((a, b) => a - b);
    else {
      const t = o.temporadas.find((x) => x.n === escopo.t);
      if (!t.eps) e.temps = [...new Set([...(e.temps || []), t.n])];
      else { e.eps = e.eps || {}; e.eps[t.n] = [...new Set([...(e.eps[t.n] || []), ...(escopo.e ? [escopo.e] : faixaNum(1, t.eps))])].sort((a, b) => a - b); }
    }
    if (!e.status || e.status === "quero") e.status = "vendo";
    if (conferirCompleta(o.id, e)) setTimeout(() => toast(`${o.formato === "hq" ? "Leitura completa" : "Tudo visto"}! Marcamos como terminada.`), 1000);
  });
  salvar("diario", "obras");
  const novo = !FORM.logId;
  fecharModal();
  pow(novo ? "Registrado!" : "Salvo!");
  desenhar({ manterScroll: true });
  if (novo && !escopo && o.elenco.length) setTimeout(() => toast("Agora dá para dar nota aos personagens desta obra."), 1100);
}
function apagarRegistro(id) {
  R.logs = R.logs.filter((l) => l.id !== id);
  R.apagados[id] = Date.now();
  salvar("diario", "perfil");
  toast("Registro apagado.");
  desenhar({ manterScroll: true });
}
function verExemplo(id) {
  const l = EX.logs.find((x) => x.id === id);
  if (!l) return;
  const o = C.O.get(l.obra);
  abrirModal("Registro de exemplo", `<div class="reg-obra">${capa(o, { status: false })}<div><strong style="font-size:18px">${esc(o.titulo)}</strong><br><span class="mudo">${dataLonga(l.data)}${l.escopo ? " · " + esc(escopoTxt(l)) : ""}</span></div></div>
    <p>${estrelas(l.nota)} ${l.curtiu ? "· curtiu" : ""} ${l.rever ? "· revendo" : ""}</p>${l.review ? textoResenha(l) : ""}
    <p class="aviso">Este é um registro de exemplo e não dá para editar. Para tirar os exemplos, use o botão abaixo.</p>`,
  `<button class="bt" data-acao="modal-fechar">Fechar</button><button class="bt bt--forte" data-acao="exemplos">Apagar exemplos</button>`);
}

// ---------- Listas ----------
let FORM_LISTA_OBRA = "";
function abrirAddLista(obraId) {
  FORM_LISTA_OBRA = obraId;
  const o = C.O.get(obraId);
  const minhas = R.listas;
  const corpo = `<p>Em qual lista entra <strong>${esc(o.titulo)}</strong>?</p>
    ${minhas.length ? `<div class="qres">${minhas.map((l) => { const tem = l.itens.includes(obraId); return `<button class="qr" data-acao="lista-alternar" data-lista="${esc(l.id)}" data-obra="${esc(obraId)}" aria-pressed="${tem}"><span class="emb" style="--av:${tem ? "#23804a" : "#6b6475"}" aria-hidden="true">${ic(tem ? "check" : "mais")}</span><span><span class="qr-t" style="display:block">${esc(l.titulo)}</span><span class="qr-m">${plural(l.itens.length, "obra", "obras")}${tem ? " · já está aqui (toque para tirar)" : ""}</span></span></button>`; }).join("")}</div>` : `<p class="mudo">Você ainda não tem listas.</p>`}
    <form class="campo" data-form="lista-rapida"><span>Ou crie uma nova</span><div class="combo-l"><input class="entrada" id="nl-titulo" maxlength="80" placeholder="Ex.: Pra ver com a galera" required><button class="bt bt--forte" type="submit">Criar</button></div></form>`;
  abrirModal("Pôr numa lista", corpo, `<button class="bt" data-acao="modal-fechar">Pronto</button>`);
}
function criarLista(titulo, descricao = "", itens = []) {
  const l = sanearLista({ id: "u-" + idNovo("").toLowerCase(), titulo, descricao, itens, criada: Date.now(), t: Date.now() });
  if (!l) return null;
  R.listas.push(l);
  salvar("listas");
  return l;
}
function abrirNovaLista(lista) {
  const ed = !!lista;
  abrirModal(ed ? "Editar lista" : "Nova lista", `<form class="campo" data-form="${ed ? "lista-editar" : "lista-nova"}" id="form-lista" style="gap:14px"${ed ? ` data-lista="${esc(lista.id)}"` : ""}>
      <label class="campo"><span>Nome</span><input class="entrada" id="lista-titulo" maxlength="80" required value="${esc(ed ? lista.titulo : "")}" placeholder="Ex.: Melhores vilões do cinema"></label>
      <label class="campo"><span>Descrição (opcional)</span><textarea class="entrada" id="lista-desc" maxlength="400" placeholder="Do que se trata essa lista?">${esc(ed ? lista.descricao : "")}</textarea></label></form>`,
  `<button class="bt" data-acao="modal-fechar">Cancelar</button><button class="bt bt--forte" type="submit" form="form-lista">${ed ? "Salvar" : "Criar lista"}</button>`);
}

// ---------- Perfil ----------
function abrirEditarPerfil() {
  abrirModal("Seu perfil", `<form class="campo" data-form="perfil" id="form-perfil" style="gap:14px">
      <label class="campo"><span>Nome</span><input class="entrada" id="p-nome" maxlength="40" value="${esc(R.perfil.nome)}" placeholder="Como quer ser chamado?"></label>
      <label class="campo"><span>Usuário</span><input class="entrada" id="p-usuario" maxlength="30" value="${esc(R.perfil.usuario)}" placeholder="ex.: fa.do.multiverso" autocapitalize="off" spellcheck="false"></label>
      <label class="campo"><span>Bio</span><textarea class="entrada" id="p-bio" maxlength="160" placeholder="Seu herói favorito, sua HQ de cabeceira...">${esc(R.perfil.bio)}</textarea></label>
      <p class="mudo mini">No beta, seu perfil só aparece para você. Com login de verdade, outras pessoas vão poder te seguir.</p></form>`,
  `<button class="bt" data-acao="modal-fechar">Cancelar</button><button class="bt bt--forte" type="submit" form="form-perfil">Salvar</button>`);
}
function abrirDenuncia(id) {
  abrirModal("Denunciar resenha", `<p>O que tem de errado?</p><div class="campo" role="radiogroup">${["Spoiler sem aviso", "Ofensiva ou com ódio", "Spam ou propaganda", "Outra coisa"].map((m, i) => `<label class="check"><input type="radio" name="motivo" value="${i}"${i === 0 ? " checked" : ""}> ${m}</label>`).join("")}</div>
    <p class="mudo mini">No beta, a denúncia não vai para ninguém. No site de verdade, ela entra na fila de moderação.</p>`,
  `<button class="bt" data-acao="modal-fechar">Cancelar</button><button class="bt bt--forte" data-acao="denuncia-enviar">Enviar denúncia</button>`);
}

// ---------- Downloads e backup ----------
let DOWNLOADS = null;
// Fora do Claude (no site de verdade), o próprio navegador baixa o arquivo.
const FORA_DO_CLAUDE = !(window.claude && typeof window.claude.use === "function");
function baixarNoNavegador(nome, dados) {
  try {
    const blob = dados instanceof Blob ? dados : new Blob([dados], { type: nome.endsWith(".json") ? "application/json" : "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = nome; a.hidden = true;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (e) { return false; }
}
async function usarDownloads() {
  try { DOWNLOADS = window.claude && typeof window.claude.use === "function" ? await window.claude.use("downloads") : null; } catch (e) { DOWNLOADS = null; }
}
async function baixar(nome, dados) {
  if (!DOWNLOADS) return FORA_DO_CLAUDE ? baixarNoNavegador(nome, dados) : false;
  try { await DOWNLOADS.save({ filename: nome, data: dados }); return true; }
  catch (e) {
    const c = e && e.code;
    if (c === "declined") return true;
    if (c === "rate_limited") { toast("Já tem um download esperando. Tente de novo em instantes."); return true; }
    if (c === "host_unavailable") { toast("Este app não salva arquivos. Abra a página no navegador para baixar."); return true; }
    return false;
  }
}
async function exportarBackup() {
  const json = JSON.stringify({ ...R, app: NOME_DO_SITE, exportado: new Date().toISOString() }, null, 2);
  if (await baixar(`heroteca-backup-${HOJE}.json`, json)) return;
  abrirModal("Backup", `<p>Não deu para baixar o arquivo aqui. Copie o texto abaixo e guarde num lugar seguro:</p><textarea class="entrada" id="backup-txt" rows="10" readonly>${esc(json)}</textarea>`,
    `<button class="bt" data-acao="modal-fechar">Fechar</button><button class="bt bt--forte" data-acao="copiar-backup">${ic("copiar")}Copiar</button>`);
}
function importarBackup(arquivo) {
  if (!arquivo) return;
  if (arquivo.size > 3 * 1024 * 1024) { toast("Esse arquivo é grande demais para ser um backup da Heroteca."); return; }
  const leitor = new FileReader();
  leitor.onload = () => {
    let dados;
    try { dados = JSON.parse(String(leitor.result)); } catch (e) { toast("Esse arquivo não é um backup válido."); return; }
    const imp = sanear(dados);
    const n = imp.logs.length + Object.keys(imp.obras).length + imp.listas.length;
    if (!n) { toast("Não achei registros nesse arquivo."); return; }
    confirmar("Importar backup", `Encontrei ${plural(imp.logs.length, "registro", "registros")}, ${plural(Object.keys(imp.obras).length, "obra marcada", "obras marcadas")} e ${plural(imp.listas.length, "lista", "listas")}. Isso junta o backup com o que já está aqui.`, "Importar", () => {
      R = mesclarEstados(R, imp);
      salvar("perfil", "obras", "diario", "listas");
      toast("Backup importado!");
      desenhar({ manterScroll: true });
    }, false);
  };
  leitor.readAsText(arquivo);
}

// ---------- Cartão para compartilhar ----------
const CARTAO = { blob: null, url: "", nome: "", texto: "" };
function quebrarTexto(g, texto, largura) {
  const palavras = String(texto).split(/\s+/);
  const linhas = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? atual + " " + p : p;
    if (g.measureText(teste).width > largura && atual) { linhas.push(atual); atual = p; } else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}
function caber(g, texto, fonte, max, largura) {
  let t = max;
  for (; t > 24; t -= 4) { g.font = fonte(t); if (g.measureText(texto).width <= largura) break; }
  return t;
}
function textoContorno(g, texto, x, y, cor, contorno) {
  g.lineJoin = "round";
  g.lineWidth = contorno;
  g.strokeStyle = "#17151c";
  g.strokeText(texto, x, y);
  g.fillStyle = cor;
  g.fillText(texto, x, y);
}
async function gerarCartao({ pct, alvo, detalhe, cor, obras }) {
  const W = 1080, H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d");
  try { await Promise.race([Promise.all([document.fonts.load('120px "Bangers"'), document.fonts.load('800 40px "Barlow Semi Condensed"')]), new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* segue com a fonte reserva */ }
  const DISP = (t) => `${t}px "Bangers", Impact, "Arial Black", sans-serif`;
  const CORPO = (t) => `800 ${t}px "Barlow Semi Condensed", "Arial Narrow", sans-serif`;
  g.fillStyle = cor; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 640);
  for (let i = 0; i < 40; i++) { g.rotate((Math.PI * 2) / 40); if (i % 2) continue; g.fillStyle = "rgba(255,255,255,0.11)"; g.beginPath(); g.moveTo(0, 0); g.lineTo(1500, -75); g.lineTo(1500, 75); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle = "rgba(0,0,0,0.17)";
  for (let y = 0; y < H; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < W; x += 16) { g.beginPath(); g.arc(x, y, 2.4, 0, Math.PI * 2); g.fill(); }
  // selo do site
  g.save(); g.translate(86, 86); g.rotate(-0.045);
  g.font = DISP(74); const larg = g.measureText(NOME_DO_SITE.toUpperCase()).width + 48;
  g.fillStyle = "#c2166b"; g.fillRect(12, 12, larg, 100);
  g.fillStyle = "#ffd21f"; g.fillRect(0, 0, larg, 100); g.lineWidth = 7; g.strokeStyle = "#17151c"; g.strokeRect(0, 0, larg, 100);
  g.fillStyle = "#17151c"; g.textBaseline = "middle"; g.fillText(NOME_DO_SITE.toUpperCase(), 24, 56); g.restore();
  g.textAlign = "center"; g.textBaseline = "middle";
  // EU JÁ VI
  g.font = DISP(96); textoContorno(g, "EU JÁ VI", W / 2, 300, "#ffffff", 16);
  // estrela com a porcentagem
  const cx = W / 2, cy = 560, r1 = 250, r2 = 196;
  const estrela = () => { g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i * 15 - 90) * (Math.PI / 180); const r = i % 2 ? r2 : r1; g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } g.closePath(); };
  g.save(); g.translate(16, 16); estrela(); g.fillStyle = "#17151c"; g.fill(); g.restore();
  estrela(); g.fillStyle = "#ffd21f"; g.fill(); g.lineWidth = 10; g.strokeStyle = "#17151c"; g.stroke();
  const tp = caber(g, pct + "%", DISP, 230, 330);
  g.font = DISP(tp); g.fillStyle = "#17151c"; g.fillText(pct + "%", cx, cy + 8);
  // alvo
  const ta = caber(g, alvo.toUpperCase(), DISP, 120, 900);
  g.font = DISP(ta); textoContorno(g, alvo.toUpperCase(), W / 2, 880, "#ffffff", Math.max(10, ta / 8));
  g.font = CORPO(44); g.fillStyle = "#ffffff"; g.lineWidth = 8; g.strokeStyle = "#17151c"; g.strokeText(detalhe, W / 2, 970); g.fillText(detalhe, W / 2, 970);
  // mini capas
  const lista = obras.slice(0, 5);
  const cw = 150, ch = 225, gap = 26;
  let x0 = (W - (lista.length * cw + (lista.length - 1) * gap)) / 2;
  g.textAlign = "left";
  for (const o of lista) {
    const u = C.U.get(o.universo);
    g.save(); g.translate(x0, 1040);
    g.fillStyle = "#17151c"; g.fillRect(8, 8, cw, ch);
    g.fillStyle = u.cor; g.fillRect(0, 0, cw, ch);
    g.fillStyle = "rgba(0,0,0,0.22)"; for (let y = 4; y < ch; y += 9) for (let x = 4; x < cw; x += 9) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 5; g.strokeStyle = "#17151c"; g.strokeRect(0, 0, cw, ch);
    g.font = DISP(25); g.textBaseline = "alphabetic";
    const linhas = quebrarTexto(g, partesTitulo(o.titulo)[0].toUpperCase(), cw - 20).slice(0, 4);
    linhas.forEach((ln, i) => { g.lineWidth = 5; g.strokeStyle = "#17151c"; g.strokeText(ln, 10, ch - 14 - (linhas.length - 1 - i) * 26); g.fillStyle = "#ffd21f"; g.fillText(ln, 10, ch - 14 - (linhas.length - 1 - i) * 26); });
    g.restore();
    x0 += cw + gap;
  }
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = CORPO(34); g.fillStyle = "#ffffff";
  g.fillText(ENDERECO_DO_SITE ? ENDERECO_DO_SITE.replace(/^https?:\/\//, "") : `${NOME_DO_SITE.toLowerCase()} · beta`, W / 2, 1306);
  g.lineWidth = 16; g.strokeStyle = "#17151c"; g.strokeRect(8, 8, W - 16, H - 16);
  return cv;
}
async function abrirCartao({ pct, alvo, artigoAlvo, detalhe, cor, obras, arquivo }) {
  abrirModal("Compartilhar progresso", `<p class="mudo">Montando a imagem...</p>`);
  let cv;
  try { cv = await gerarCartao({ pct, alvo, detalhe, cor, obras }); } catch (e) { abrirModal("Compartilhar progresso", `<p>Não deu para montar a imagem neste aparelho.</p>`); return; }
  const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
  if (!blob) { abrirModal("Compartilhar progresso", `<p>Não deu para montar a imagem neste aparelho.</p>`); return; }
  CARTAO.blob = blob;
  if (CARTAO.url) URL.revokeObjectURL(CARTAO.url);
  CARTAO.url = URL.createObjectURL(blob);
  CARTAO.nome = arquivo;
  CARTAO.texto = `Já vi ${pct}% ${artigoAlvo} ${alvo} na ${NOME_DO_SITE}! ${detalhe}.${ENDERECO_DO_SITE ? "\n" + ENDERECO_DO_SITE : ""}`;
  const podeSalvar = DOWNLOADS || FORA_DO_CLAUDE;
  const pe = `${podeSalvar ? `<button class="bt bt--forte" data-acao="cartao-salvar">${ic("baixar")}Salvar imagem</button>` : ""}<button class="bt" data-acao="cartao-copiar">${ic("copiar")}Copiar texto</button>`;
  abrirModal("Compartilhar progresso", `<img class="cartao-img" src="${CARTAO.url}" alt="Cartão: já vi ${pct}% ${esc(artigoAlvo)} ${esc(alvo)}">
    <p class="mudo mini">${podeSalvar ? "Salve a imagem e poste no story." : "Se o botão de salvar não aparecer, segure a imagem para salvar."}</p>`, pe);
}
