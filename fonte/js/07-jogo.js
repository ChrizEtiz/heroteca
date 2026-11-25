// ================= O jogo diário, dentro do site =================
const J = { chave: "", numero: 1, alvo: null, chutes: [], venceu: false, sug: [], ativo: 0 };
let BASE_JOGO = [];
function prepararJogo() {
  BASE_JOGO = C.jogo.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function embaralhar(lista, semente) {
  const r = mulberry32(semente);
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const numeroDoDia = (chave) => Math.round((diaUTC(chave) - diaUTC(DATA_DE_LANCAMENTO)) / 86400000) + 1;
const chaveDoNumero = (n) => new Date(diaUTC(DATA_DE_LANCAMENTO) + (n - 1) * 86400000).toISOString().slice(0, 10);
function personagemDoDia(n) {
  const especial = DIAS_ESPECIAIS[chaveDoNumero(n)];
  if (especial && C.jogoPorId.get(slug(especial))) return C.jogoPorId.get(slug(especial));
  const total = BASE_JOGO.length;
  const ciclo = Math.floor((n - 1) / total);
  return embaralhar(BASE_JOGO, SEMENTE + ciclo)[(((n - 1) % total) + total) % total];
}
function comparar(chute, alvo) {
  const simples = (a, b) => (a === b ? "hit" : "miss");
  const lista = (a, b) => {
    const A = new Set(a), B = new Set(b);
    if (A.size === B.size && [...A].every((x) => B.has(x))) return "hit";
    return [...A].some((x) => B.has(x)) ? "near" : "miss";
  };
  let ano = "hit", seta = "";
  if (chute.estreia !== alvo.estreia) { ano = "miss"; seta = alvo.estreia > chute.estreia ? "up" : "down"; }
  return [
    { k: "Editora", v: chute.editora, r: simples(chute.editora, alvo.editora) },
    { k: "Gênero", v: chute.genero, r: simples(chute.genero, alvo.genero) },
    { k: "Lado", v: chute.lado, r: simples(chute.lado, alvo.lado) },
    { k: "Poder", v: chute.poder.join(", "), r: lista(chute.poder, alvo.poder) },
    { k: "Equipe", v: chute.equipe.length ? chute.equipe.join(", ") : "Nenhuma", r: lista(chute.equipe, alvo.equipe) },
    { k: "Estreia", v: String(chute.estreia), r: ano, seta },
  ];
}
function buscarJogo(texto, usados) {
  const q = normalizar(texto);
  if (!q) return [];
  const achados = [];
  for (const p of C.jogo) {
    if (usados.has(p.id)) continue;
    let melhor = 9;
    p.busca.forEach((b, i) => {
      let nota = 9;
      if (b.startsWith(q)) nota = i === 0 ? 0 : 1;
      else if ((" " + b).includes(" " + q)) nota = 2;
      else if (b.includes(q)) nota = 3;
      if (nota < melhor) melhor = nota;
    });
    if (melhor < 9) achados.push([melhor, p]);
  }
  achados.sort((a, b) => a[0] - b[0] || a[1].nome.localeCompare(b[1].nome, "pt-BR"));
  return achados.slice(0, 8).map((x) => x[1]);
}
const EMOJI = { hit: "🟩", near: "🟨", miss: "🟥", up: "⬆️", down: "⬇️" };
function textoDoResultado() {
  const n = J.chutes.length;
  const linhas = J.chutes.map((p) => comparar(p, J.alvo).map((c) => (c.seta ? EMOJI[c.seta] : EMOJI[c.r])).join(""));
  let t = `${NOME_DO_JOGO} #${J.numero} · ${n} ${n === 1 ? "tentativa" : "tentativas"}\n${linhas.join("\n")}`;
  if (ENDERECO_DO_SITE) t += `\n${ENDERECO_DO_SITE}`;
  return t;
}
function iniciarJogo() {
  const n = Math.max(1, numeroDoDia(HOJE));
  J.numero = n;
  J.chave = chaveDoNumero(n);
  J.alvo = personagemDoDia(n);
  const d = R.jogo.dias && R.jogo.dias[J.chave];
  J.chutes = ((d && d.chutes) || []).map((id) => C.jogoPorId.get(id)).filter(Boolean);
  J.venceu = J.chutes.some((p) => p.id === J.alvo.id);
}
function sequenciaJogo() {
  const ontem = chaveDoNumero(J.numero - 1);
  const viva = R.jogo.ultimaVitoria === J.chave || R.jogo.ultimaVitoria === ontem;
  return { seq: viva ? R.jogo.sequencia || 0 : 0, rec: R.jogo.recorde || 0 };
}
function persistirJogo(acertou) {
  const d = R.jogo;
  d.dias = d.dias || {};
  d.dias[J.chave] = { chutes: J.chutes.map((c) => c.id), venceu: J.venceu };
  const ks = Object.keys(d.dias).sort();
  while (ks.length > 40) delete d.dias[ks.shift()];
  if (acertou && d.ultimaVitoria !== J.chave) {
    const ontem = chaveDoNumero(J.numero - 1);
    d.sequencia = d.ultimaVitoria === ontem ? (d.sequencia || 0) + 1 : 1;
    d.recorde = Math.max(d.recorde || 0, d.sequencia);
    d.ultimaVitoria = J.chave;
  }
  salvar("perfil");
}
const simbolo = (c) => (c.r === "hit" ? "✓" : c.r === "near" ? "≈" : c.seta === "up" ? "↑" : c.seta === "down" ? "↓" : "✕");
const descricaoCel = (c) => (c.r === "hit" ? "igual" : c.r === "near" ? "em parte" : c.seta === "up" ? "o do dia estreou depois" : c.seta === "down" ? "o do dia estreou antes" : "diferente");
const artigoJ = (p) => (p.genero === "Feminino" ? "a" : "o");
const empJ = (p) => emblema({ nome: p.nome, franquia: p.franquia }, "", COR_FRANQ[p.editora] || COR_FRANQ[p.franquia]);
function celulas(res) {
  return `<div class="cells">${res.map((c, i) => `<div class="cell ${c.r}${c.k === "Estreia" ? " ano" : ""}" style="--i:${i}"><span class="k">${esc(c.k)}</span><span class="v">${esc(c.v)}</span><span class="s" aria-hidden="true">${simbolo(c)}</span><span class="sr">, ${descricaoCel(c)}</span></div>`).join("")}</div>`;
}
function cartaoChute(p, num, animar, alvo) {
  return `<li class="q guess${animar ? " novo" : ""}"><div class="guess-h">${empJ(p)}<span class="guess-nome">${esc(p.nome)}</span>${num != null ? `<span class="guess-n">#${num}</span>` : ""}</div>${celulas(comparar(p, alvo))}</li>`;
}
function cartaoExemploJogo() {
  let alvo = C.jogoPorId.get("wolverine"), chute = C.jogoPorId.get("feiticeira-escarlate");
  if (J.alvo.id === alvo.id || J.alvo.id === chute.id) { alvo = C.jogoPorId.get("batman"); chute = C.jogoPorId.get("ciborgue"); }
  return `<li class="q guess"><span class="selo">Exemplo</span><p class="mudo">Se o personagem do dia fosse ${artigoJ(alvo)} ${esc(alvo.nome)} e você chutasse ${artigoJ(chute)} ${esc(chute.nome)}, ficaria assim:</p>`
    + `<div class="guess-h">${empJ(chute)}<span class="guess-nome">${esc(chute.nome)}</span></div>${celulas(comparar(chute, alvo))}</li>`;
}
function pgJogo() {
  iniciarJogo();
  PAG.titulo = NOME_DO_JOGO;
  return `<div class="jogo"><header style="display:grid;gap:10px;justify-items:start">
      <div class="card-jogo"><div class="topline"><span class="edicao">Nº ${J.numero}</span><span class="mudo">${esc(new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(diaUTC(J.chave) + 43200000)))}</span></div></div>
      <h1 class="logo-jogo">${NOME_DO_JOGO}</h1><p class="jogo-cap">Adivinhe o personagem de quadrinhos do dia</p><p class="mudo" id="j-stats"></p></header>
    <section class="q jogar"><h2 class="h2">Quem é o personagem de hoje?</h2>
      <p class="mudo">Chute um personagem. Cada chute mostra o que ele tem em comum com o personagem do dia. Todo mundo recebe o mesmo personagem, que muda à meia-noite de Brasília.</p>
      <div class="combo" id="j-combo"><div class="combo-l"><input class="entrada" id="j-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="j-sug" aria-label="Nome do personagem" autocomplete="off" spellcheck="false" enterkeyhint="go" placeholder="Digite um herói ou vilão">
        <button class="bt bt--forte" id="j-bt" data-acao="j-chutar">Chutar</button></div><ul class="sugestoes" id="j-sug" role="listbox" hidden></ul></div>
      <ul class="legenda-j"><li><span class="sw hit"></span>Igual</li><li><span class="sw near"></span>Em parte</li><li><span class="sw miss"></span>Diferente</li><li>↑ ↓ estreou depois ou antes</li></ul>
      <p class="dica" id="j-dica" hidden></p></section>
    <section class="q vitoria" id="j-vit" hidden></section>
    <ol class="palpites" id="j-lista"></ol>
    <p class="mudo" id="j-ontem"></p><div class="sr" aria-live="polite" id="j-anuncio"></div></div>`;
}
function desenharJogo(animarUltimo, acabou) {
  if (!$("#j-lista")) return;
  const { seq, rec } = sequenciaJogo();
  $("#j-stats").innerHTML = `Sequência: <strong>${seq}</strong> ${seq === 1 ? "dia" : "dias"} · Recorde: <strong>${rec}</strong>`;
  const n = J.chutes.length;
  $("#j-lista").innerHTML = (n ? "" : cartaoExemploJogo()) + J.chutes.slice().reverse().map((p, i) => cartaoChute(p, n - i, animarUltimo && i === 0, J.alvo)).join("");
  const dica = $("#j-dica");
  if (!J.venceu && n >= 6) { dica.hidden = false; dica.textContent = `Dica: o nome começa com “${J.alvo.nome[0]}”.`; } else dica.hidden = true;
  const inp = $("#j-in");
  inp.disabled = J.venceu;
  $("#j-bt").disabled = J.venceu;
  inp.placeholder = J.venceu ? "Volte amanhã para o próximo personagem" : "Digite um herói ou vilão";
  const vit = $("#j-vit");
  if (J.venceu) {
    const site = C.P.get(J.alvo.site);
    const g = progressoPersonagem(J.alvo.site);
    vit.hidden = false;
    vit.classList.toggle("agora", !!acabou);
    vit.innerHTML = `<div class="burst"><span>Acertou!</span></div>
      <p style="font-size:19px;font-weight:600;text-wrap:balance">Era ${artigoJ(J.alvo)} <strong>${esc(J.alvo.nome)}</strong>. Você acertou em ${plural(n, "tentativa", "tentativas")}.</p>
      <a class="bt bt--amarelo" href="#personagem-${esc(J.alvo.site)}">${ic("perfil")}Conheça ${J.alvo.genero === "Feminino" ? "a" : "o"} ${esc(site.nome)}: ${plural(versoesDe(site.id).length, "versão", "versões")}, ${plural(g.total, "obra", "obras")}</a>
      <label class="campo"><span>Compartilhe seu resultado</span><textarea class="share-txt" id="j-share" rows="${Math.min(12, n + 1)}" readonly>${esc(textoDoResultado())}</textarea></label>
      <div class="acoes"><button class="bt bt--forte" data-acao="j-copiar">${ic("copiar")}Copiar resultado</button><span class="mudo" id="j-copiado" aria-live="polite"></span></div>
      <p class="mudo">Próximo personagem em <strong class="num" data-contagem>--:--:--</strong></p>`;
    atualizarContagem();
  } else { vit.hidden = true; vit.innerHTML = ""; }
  $("#j-ontem").innerHTML = J.numero > 1 ? `Ontem era: <strong>${esc(personagemDoDia(J.numero - 1).nome)}</strong>` : "Hoje é o primeiro dia do jogo.";
}
function chutar(p) {
  if (!p || J.venceu || J.chutes.some((c) => c.id === p.id)) return;
  J.chutes.push(p);
  const acertou = p.id === J.alvo.id;
  if (acertou) J.venceu = true;
  persistirJogo(acertou);
  const inp = $("#j-in");
  inp.value = "";
  fecharSugJogo();
  desenharJogo(true, acertou);
  $("#j-anuncio").textContent = acertou ? `${p.nome}: acertou!` : `${p.nome}: ${comparar(p, J.alvo).map((c) => `${c.k} ${descricaoCel(c)}`).join(", ")}.`;
  if (acertou) pow("Acertou!");
  else inp.focus();
}
function fecharSugJogo() {
  J.sug = [];
  const s = $("#j-sug"), inp = $("#j-in");
  if (!s) return;
  s.hidden = true;
  s.innerHTML = "";
  inp.setAttribute("aria-expanded", "false");
  inp.removeAttribute("aria-activedescendant");
}
function marcarSugJogo() {
  $$("#j-sug li[role=option]").forEach((li, i) => li.setAttribute("aria-selected", i === J.ativo ? "true" : "false"));
  const atual = J.sug[J.ativo];
  if (atual) {
    $("#j-in").setAttribute("aria-activedescendant", "sug-" + atual.id);
    const li = document.getElementById("sug-" + atual.id);
    if (li) li.scrollIntoView({ block: "nearest" });
  }
}
function mostrarSugJogo() {
  const inp = $("#j-in"), s = $("#j-sug");
  if (!inp.value.trim()) { fecharSugJogo(); return; }
  J.sug = buscarJogo(inp.value, new Set(J.chutes.map((c) => c.id)));
  J.ativo = 0;
  s.innerHTML = J.sug.length
    ? J.sug.map((p) => `<li id="sug-${esc(p.id)}" role="option" data-acao="j-escolher" data-id="${esc(p.id)}">${empJ(p)}<span class="sug-n">${esc(p.nome)}</span><span class="sug-e">${esc(p.editora)}</span></li>`).join("")
    : `<li class="nada">Nenhum personagem com esse nome no jogo ainda.</li>`;
  s.hidden = false;
  inp.setAttribute("aria-expanded", "true");
  marcarSugJogo();
}
function confirmarJogo() {
  const inp = $("#j-in");
  if (!inp.value.trim()) { inp.focus(); return; }
  const escolhido = (!$("#j-sug").hidden && J.sug[J.ativo]) || buscarJogo(inp.value, new Set(J.chutes.map((c) => c.id)))[0];
  if (escolhido) chutar(escolhido); else mostrarSugJogo();
}
function atualizarContagem() {
  const s = segundosAteMeiaNoite();
  const t = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((x) => String(x).padStart(2, "0")).join(":");
  $$("[data-contagem]").forEach((el) => { el.textContent = t; });
}
