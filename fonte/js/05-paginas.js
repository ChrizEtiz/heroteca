// ================= Páginas =================
const UI = {
  explorar: { q: "", formato: "todos", franquia: "todas", ordem: "recentes", status: "todos" },
  personagens: { q: "", franquia: "todas", ordem: "az" },
  diario: { ano: "todos", formato: "todos", tag: "" },
  perfilTudo: false, versoes: {}, temps: {},
};
const PAG = { titulo: "" };
const NOTA_EXEMPLOS = "Perfis de exemplo, só para testar o beta. No site de verdade, aqui aparecem pessoas reais.";

function naoAchei() {
  PAG.titulo = "Não achei";
  return `<div class="q vazio" style="margin-top:20px"><h1 class="h1">Essa página sumiu no multiverso</h1><p>O link pode estar errado ou a obra ainda não foi cadastrada.</p><a class="bt bt--forte" href="#inicio">Voltar ao início</a></div>`;
}
function abasExplorar(atual) {
  const it = [["explorar", "Obras"], ["personagens", "Personagens"], ["universos", "Universos"], ["ranking", "Ranking"]];
  return `<nav class="abas-pg" aria-label="Explorar">${it.map(([h, t]) => `<a class="chip" href="#${h}"${h === atual ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>`;
}
function bannerExemplos(onde) {
  if (R.ocultarExemplos) return "";
  return `<div class="banner"><span>${ic("info")} ${onde} mostra registros de exemplo para você ver como fica. Eles somem quando quiser.</span><button class="bt bt--mini" data-acao="exemplos">Apagar exemplos</button></div>`;
}
const artigoDe = (p) => (p && p.jogo && p.jogo.genero === "Feminino" ? "a" : "o");

// ---------- Início ----------
const DESTAQUE_CAPA = ["x-men-97", "homem-aranha-no-aranhaverso-2018", "cavaleiro-das-trevas-2008", "invencivel-serie", "vingadores-ultimato-2019"];
const DESTAQUE_PERS = ["batman", "homem-aranha", "coringa", "wolverine", "superman", "miles-morales", "arlequina", "invencivel", "deadpool", "mulher-maravilha", "doutor-destino", "venom"];
function pgInicio() {
  PAG.titulo = "";
  const capas = DESTAQUE_CAPA.map((id) => C.O.get(id)).filter(Boolean);
  const leque = capas.map((o, i) => { const d = i - 2; return `<a href="#obra-${esc(o.id)}" style="--i:${d};--d:${Math.abs(d)}" aria-label="${esc(o.titulo)}">${capa(o)}</a>`; }).join("");
  const nome = R.perfil.nome ? `, ${esc(R.perfil.nome)}` : "";
  return `<section class="splash"><div class="splash-in">
      <h1 class="h1">Seu diário de filmes, séries, desenhos e HQs de heróis</h1>
      <p class="splash-sub">Marvel, DC, Invencível, Tartarugas Ninja, Ben 10 e mais, tudo num lugar só. Dê nota para cada obra e para cada versão de cada personagem${nome}.</p>
      <div class="leque">${leque}<a class="balao-splash" href="#lista-todos-os-batmans">Qual Batman é o seu?</a></div>
      <div class="acoes"><button class="bt bt--amarelo" data-acao="registrar">${ic("mais")}Registrar o que vi</button><a class="bt" href="#jogo">${ic("jogo")}${NOME_DO_JOGO} de hoje</a><a class="bt" href="#explorar">${ic("busca")}Explorar</a></div>
    </div></section>
    <div class="dupla">${cardJogoHoje()}${cardEmBreve()}</div>
    ${secaoContinuar()}
    ${secaoAmigos()}
    ${secao("Listas oficiais", trilho(C.L.map((l) => cardLista(l)), { largo: true, id: "tr-listas" }), { ver: "#listas", botoes: botoesTrilho("tr-listas") })}
    ${secao("Personagens", trilho(DESTAQUE_PERS.map((id) => C.P.get(id)).filter(Boolean).map(cardPersonagem), { largo: true, id: "tr-pers" }), { ver: "#personagens", botoes: botoesTrilho("tr-pers") })}
    ${secaoPopulares()}`;
}
function cardJogoHoje() {
  iniciarJogo();
  const { seq } = sequenciaJogo();
  const n = J.chutes.length;
  let corpo;
  if (J.venceu) {
    corpo = `<p style="font-size:18px">Você acertou em ${plural(n, "tentativa", "tentativas")}! Era ${artigoDe(C.P.get(J.alvo.site))} <strong>${esc(J.alvo.nome)}</strong>.</p>
      <p class="mudo">Próximo personagem em <strong class="num" data-contagem>--:--:--</strong></p>
      <div class="acoes"><a class="bt bt--amarelo" href="#personagem-${esc(J.alvo.site)}">Ver as versões</a><a class="bt" href="#jogo">Ver meu resultado</a></div>`;
  } else {
    corpo = `<p style="font-size:18px">${n ? `Você já chutou ${plural(n, "vez", "vezes")}. Falta pouco!` : "Quem é o personagem de hoje? Cada chute dá pistas de editora, lado, poder, equipe e estreia."}</p>
      <div class="acoes"><a class="bt bt--forte" href="#jogo">${ic("jogo")}${n ? "Continuar" : "Jogar agora"}</a></div>`;
  }
  return `<section class="q card-jogo" aria-label="${NOME_DO_JOGO}"><div class="topline"><span class="edicao">Nº ${J.numero}</span><span class="mudo">${seq ? `${ic("fogo")} sequência de ${plural(seq, "dia", "dias")}` : "Jogo diário"}</span></div>
    <h2 class="logo-jogo">${NOME_DO_JOGO}</h2>${corpo}</section>`;
}
function cardEmBreve() {
  const o = C.obras.filter((x) => emBreve(x) && x.data).sort((a, b) => (a.data < b.data ? -1 : 1))[0];
  if (!o) return "";
  const dias = diasEntre(HOJE, o.data);
  const e = estObra(o.id);
  const lista = C.L.find((l) => l.itens.includes(o.id));
  return `<section class="q card-breve"><a href="#obra-${esc(o.id)}" aria-label="${esc(o.titulo)}">${capa(o)}</a><div class="card-breve-txt">
    <span class="burst-n">${dias === 1 ? "Falta" : "Faltam"}<b class="num">${dias}</b>${dias === 1 ? "dia" : "dias"}</span>
    <h2 class="h3" style="font-size:20px">${esc(o.titulo)}</h2><p class="mudo">Estreia nos cinemas do Brasil em ${dataLonga(o.data)}.</p>
    <div class="acoes"><button class="bt bt--mini ${e && e.status === "quero" ? "bt--amarelo" : ""}" data-acao="status" data-obra="${esc(o.id)}" data-s="quero" aria-pressed="${!!(e && e.status === "quero")}">${ic("marcador")}${e && e.status === "quero" ? "Na sua lista" : "Quero ver"}</button>
    ${lista ? `<a class="bt bt--mini" href="#lista-${esc(lista.id)}">O que ver antes</a>` : ""}</div></div></section>`;
}
function secaoContinuar() {
  const vendo = Object.entries(V.obras).filter(([id, e]) => e.status === "vendo" && C.O.has(id)).map(([id, e]) => [C.O.get(id), e]);
  if (!vendo.length) return "";
  const itens = vendo.map(([o, e]) => `<a class="cont" href="#obra-${esc(o.id)}">${capa(o, { status: false })}<span><span class="cont-t">${esc(o.titulo)}</span><span class="cont-m" style="display:block">${esc(progressoTxt(o, e))}</span>${barra(pctObra(o, e), "barra--fina")}</span></a>`);
  return secao("Continue de onde parou", `<div class="continuar">${itens.join("")}</div>`);
}
function secaoAmigos() {
  const logs = AMIGOS.filter((a) => R.seguindo.includes(a.id)).flatMap((a) => a.logs).sort(porDataDesc).slice(0, 6);
  const corpo = logs.length ? `<div class="feed">${logs.map(itemFeed).join("")}</div>`
    : `<div class="q vazio"><p>Você não segue ninguém ainda.</p><a class="bt" href="#perfil">Encontrar pessoas</a></div>`;
  return secao("Seus amigos", corpo, { nota: NOTA_EXEMPLOS, ver: "#perfil", verTxt: "Quem eu sigo" });
}
function secaoPopulares() {
  const top = C.obras.map((o) => ({ o, ...mediaObra(o.id) })).filter((x) => x.n >= 2).sort((a, b) => b.m - a.m || b.n - a.n).slice(0, 14);
  return secao("Mais bem avaliadas", trilho(top.map((x) => cardObra(x.o)), { id: "tr-pop" }), { ver: "#ranking", botoes: botoesTrilho("tr-pop") });
}

// ---------- Explorar ----------
const FILTRO_FORMATO = [["todos", "Tudo"], ["filme", "Filmes"], ["serie", "Séries"], ["desenho", "Desenhos"], ["animacao", "Filmes animados"], ["hq", "HQs"]];
function chipsFiltro(chave, opcoes, atual) {
  return `<div class="filtros-l" role="group">${opcoes.map(([v, t]) => `<button class="chip" data-acao="filtro" data-k="${chave}" data-v="${esc(v)}" aria-pressed="${atual === v}">${esc(t)}</button>`).join("")}</div>`;
}
function pgExplorar() {
  PAG.titulo = "Explorar";
  const f = UI.explorar;
  const franqs = [["todas", "Todas as franquias"], ...[...new Set(C.obras.map((o) => o.franquia))].map((x) => [x, x])];
  return `<h1 class="h1">Explorar</h1>${abasExplorar("explorar")}
    <div class="busca-g">${ic("busca")}<input class="entrada" id="exp-q" type="search" placeholder="Filme, série, HQ, personagem, ator, dublador..." value="${esc(f.q)}" autocomplete="off" aria-label="Buscar"></div>
    <div class="filtros">${chipsFiltro("explorar.formato", FILTRO_FORMATO, f.formato)}${chipsFiltro("explorar.franquia", franqs, f.franquia)}
      <div class="acoes"><label class="mini">Ordem <select class="sel" data-filtro="explorar.ordem">${[["recentes", "Mais recentes"], ["antigos", "Mais antigas"], ["az", "A–Z"], ["nota", "Melhor nota"]].map(([v, t]) => `<option value="${v}"${f.ordem === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>
      <label class="mini">Status <select class="sel" data-filtro="explorar.status">${[["todos", "Todas"], ["nao", "Ainda não vi"], ["quero", "Quero ver"], ["vendo", "Vendo"], ["terminei", "Terminei"]].map(([v, t]) => `<option value="${v}"${f.status === v ? " selected" : ""}>${t}</option>`).join("")}</select></label></div></div>
    <div id="exp-res">${resultadosExplorar()}</div>`;
}
function relevancia(q) { return (a, b) => Number(!a.busca.startsWith(q)) - Number(!b.busca.startsWith(q)) || b.ano - a.ano; }
function resultadosExplorar() {
  const f = UI.explorar;
  const q = normalizar(f.q);
  let obras = C.obras.filter((o) => (f.formato === "todos" || o.formato === f.formato) && (f.franquia === "todas" || o.franquia === f.franquia));
  if (f.status !== "todos") obras = obras.filter((o) => { const s = estObra(o.id)?.status; return f.status === "nao" ? !s : s === f.status; });
  if (q) {
    obras = obras.filter((o) => o.busca.includes(q)).sort(relevancia(q));
    const pers = C.personagens.filter((p) => p.busca.some((b) => b.includes(q))).slice(0, 12);
    const unis = C.universos.filter((u) => u.busca.includes(q)).slice(0, 8);
    const pess = [...C.pessoas.values()].filter((p) => normalizar(p.nome).includes(q)).slice(0, 12);
    if (!obras.length && !pers.length && !unis.length && !pess.length) return `<div class="q vazio"><p>Nada com “${esc(f.q)}” por aqui ainda.</p><p class="mudo">O catálogo do beta ainda é pequeno. Tente outro nome ou em inglês.</p></div>`;
    return (pers.length ? `<h2 class="qgrupo">Personagens</h2><div class="pgrade" style="margin:10px 0 22px">${pers.map(cardPersonagem).join("")}</div>` : "")
      + (obras.length ? `<h2 class="qgrupo">Obras</h2><div class="grade" style="margin:10px 0 22px">${obras.map((o) => cardObra(o)).join("")}</div>` : "")
      + (unis.length ? `<h2 class="qgrupo">Universos</h2><div class="chips" style="margin:10px 0 22px">${unis.map((u) => uchip(u)).join("")}</div>` : "")
      + (pess.length ? `<h2 class="qgrupo">Pessoas</h2><div class="chips" style="margin:10px 0 22px">${pess.map((p) => `<a class="chip" href="#pessoa-${esc(p.id)}">${esc(p.nome)}</a>`).join("")}</div>` : "");
  }
  const ord = {
    recentes: (a, b) => b.ano - a.ano || a.titulo.localeCompare(b.titulo, "pt-BR"),
    antigos: (a, b) => a.ano - b.ano || a.titulo.localeCompare(b.titulo, "pt-BR"),
    az: (a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"),
    nota: (a, b) => mediaObra(b.id).m - mediaObra(a.id).m || b.ano - a.ano,
  }[f.ordem] || ((a, b) => b.ano - a.ano);
  obras.sort(ord);
  if (!obras.length) return `<div class="q vazio"><p>Nenhuma obra com esses filtros.</p></div>`;
  return `<p class="resultado-n">${plural(obras.length, "obra", "obras")}</p><div class="grade">${obras.map((o) => cardObra(o)).join("")}</div>`;
}

// ---------- Personagens, universos e ranking ----------
function pgPersonagens() {
  PAG.titulo = "Personagens";
  const f = UI.personagens;
  const franqs = [["todas", "Todas"], ...[...new Set(C.personagens.map((p) => p.franquia))].map((x) => [x, x])];
  return `<h1 class="h1">Personagens</h1>${abasExplorar("personagens")}
    <div class="busca-g">${ic("busca")}<input class="entrada" id="pers-q" type="search" placeholder="Nome, identidade secreta ou nome em inglês" value="${esc(f.q)}" autocomplete="off" aria-label="Buscar personagem"></div>
    <div class="filtros">${chipsFiltro("personagens.franquia", franqs, f.franquia)}
      <div class="acoes"><label class="mini">Ordem <select class="sel" data-filtro="personagens.ordem">${[["az", "A–Z"], ["obras", "Mais obras"], ["versoes", "Mais versões"], ["progresso", "Seu progresso"]].map(([v, t]) => `<option value="${v}"${f.ordem === v ? " selected" : ""}>${t}</option>`).join("")}</select></label></div></div>
    <div id="pers-res">${resultadosPersonagens()}</div>`;
}
function resultadosPersonagens() {
  const f = UI.personagens;
  const q = normalizar(f.q);
  let ps = C.personagens.filter((p) => (f.franquia === "todas" || p.franquia === f.franquia) && (!q || p.busca.some((b) => b.includes(q))));
  const ordem = {
    az: null,
    obras: (a, b) => obrasDoPersonagem(b.id).length - obrasDoPersonagem(a.id).length,
    versoes: (a, b) => versoesDe(b.id).length - versoesDe(a.id).length,
    progresso: (a, b) => progressoPersonagem(b.id).pct - progressoPersonagem(a.id).pct,
  }[f.ordem];
  if (ordem) ps = ps.slice().sort(ordem);
  if (!ps.length) return `<div class="q vazio"><p>Nenhum personagem encontrado.</p></div>`;
  return `<p class="resultado-n">${plural(ps.length, "personagem", "personagens")}</p><div class="pgrade">${ps.map(cardPersonagem).join("")}</div>`;
}
function pgUniversos() {
  PAG.titulo = "Universos";
  const franqs = [...new Set(C.universos.map((u) => u.franquia))];
  return `<h1 class="h1">Universos</h1>${abasExplorar("universos")}
    <p class="prosa mudo">Cada obra pertence a um universo. É assim que a Heroteca separa o Batman do Nolan do Batman do desenho, por exemplo.</p>
    ${franqs.map((fr) => secao(fr, `<div class="ugrade">${C.universos.filter((u) => u.franquia === fr).map((u) => {
      const g = progressoUniverso(u.id);
      return `<a class="ucard" href="#universo-${esc(u.id)}" style="--c:${u.cor}"><span class="ucard-t">${esc(u.nome)}</span><span class="ucard-m">${esc(u.midia)} · ${esc(u.anos)} · ${plural(u.obras.length, "obra", "obras")}</span>${barra(g.pct, "barra--fina")}</a>`;
    }).join("")}</div>`)).join("")}`;
}
function pgRanking() {
  PAG.titulo = "Ranking";
  const vers = [...C.versoes.values()].map((v) => ({ v, ...mediaVersao(v.chave) })).filter((x) => x.n >= 2).sort((a, b) => b.m - a.m || b.n - a.n).slice(0, 25);
  const obras = C.obras.map((o) => ({ o, ...mediaObra(o.id) })).filter((x) => x.n >= 2).sort((a, b) => b.m - a.m || b.n - a.n).slice(0, 25);
  const linhaV = (x, i) => {
    const p = C.P.get(x.v.p), u = C.U.get(x.v.u);
    return `<a class="rk" href="#personagem-${esc(p.id)}"><span class="rk-n">${i + 1}</span>${emblema(p, "", u.cor)}<span><span class="rk-t" style="display:block">${esc(p.nome)}</span><span class="rk-m">${esc([x.v.atores.join(", "), u.nome].filter(Boolean).join(" · "))}</span></span><span class="rk-v">${estrelas(Math.round(x.m))} ${mediaTxt(x.m)} <span class="mudo mini">(${x.n})</span></span></a>`;
  };
  const linhaO = (x, i) => `<a class="rk" href="#obra-${esc(x.o.id)}"><span class="rk-n">${i + 1}</span><span style="width:44px;display:block">${capa(x.o)}</span><span><span class="rk-t" style="display:block">${esc(x.o.titulo)}</span><span class="rk-m">${x.o.ano} · ${FORMATO[x.o.formato].nome}</span></span><span class="rk-v">${estrelas(Math.round(x.m))} ${mediaTxt(x.m)} <span class="mudo mini">(${x.n})</span></span></a>`;
  return `<h1 class="h1">Ranking</h1>${abasExplorar("ranking")}
    ${secao("Melhores versões de personagens", `<div class="rank">${vers.map(linhaV).join("")}</div>`, { nota: "Notas dos perfis de exemplo mais as suas. Entra no ranking com pelo menos 2 notas." })}
    ${secao("Obras mais bem avaliadas", `<div class="rank">${obras.map(linhaO).join("")}</div>`)}`;
}

// ---------- Obra ----------
function pgObra(id) {
  const o = C.O.get(id);
  if (!o) return naoAchei();
  PAG.titulo = o.titulo;
  const u = C.U.get(o.universo);
  const e = estObra(o.id) || {};
  const med = mediaObra(o.id);
  const breve = emBreve(o);
  const linha = [o.original !== o.titulo ? o.original : "", o.periodo || String(o.ano), o.creditos || ""].filter(Boolean).map(esc).join(" · ");
  const faixa = `<header class="faixa" style="--c1:${u.cor}">${TMDB.ativo && o.tmdb ? `<img class="faixa-bg" data-tmdb-fundo="${esc(o.id)}" alt="" hidden>` : ""}<div class="faixa-in">${capa(o)}<div class="faixa-txt">
      <div class="chips"><span class="chip">${esc(FORMATO[o.formato].nome)}</span>${uchip(u)}</div>
      <h1 class="h1">${esc(o.titulo)}</h1><p class="faixa-linha">${linha}</p>
      ${breve ? `<p class="nota-com">${o.data ? `Estreia em ${dataLonga(o.data)} · faltam ${plural(diasEntre(HOJE, o.data), "dia", "dias")}` : `Previsto para ${o.ano}`}</p>`
        : med.n ? `<p class="nota-com">${estrelas(Math.round(med.m))} ${mediaTxt(med.m)} <span class="mini">· ${plural(med.n, "nota", "notas")} no beta</span></p>` : ""}
    </div></div></header>`;
  const fav = R.favoritos.obras.includes(o.id);
  const meus = V.logs.filter((l) => l.obra === o.id).length;
  const lado = `<aside class="obra-lado"><div class="q bloco">
      <div class="status-g" role="group" aria-label="Status">${STATUS.map((s) => `<button class="st-bt" data-acao="status" data-obra="${esc(o.id)}" data-s="${s}" aria-pressed="${e.status === s}"${breve && s !== "quero" ? " disabled" : ""}>${ic(ICONE_STATUS[s])}${nomeStatus(s, o)}</button>`).join("")}</div>
      <div class="nota-linha"><div><span class="h3">Sua nota</span>${avaliador(e.nota || 0, "nota-obra", o.id, "Sua nota para " + o.titulo, { desligado: breve })}</div>
        <button class="coracao" data-acao="curtir" data-obra="${esc(o.id)}" aria-pressed="${!!e.curtiu}" aria-label="Curti"${breve ? " disabled" : ""}>${ic("coracao", e.curtiu ? "ic--cheio" : "")}</button></div>
      ${breve ? `<p class="mudo mini">Nota, curtida e registro liberam na estreia. Por enquanto, marque “Quero ver”.</p>` : ""}
      <button class="bt bt--forte" data-acao="log-abrir" data-obra="${esc(o.id)}"${breve ? " disabled" : ""}>${ic("diario")}Registrar no diário</button>
      <div class="acoes"><button class="bt bt--mini" data-acao="lista-add" data-obra="${esc(o.id)}">${ic("lista")}Pôr numa lista</button>
        <button class="bt bt--mini${fav ? " bt--amarelo" : ""}" data-acao="fav-obra" data-obra="${esc(o.id)}" aria-pressed="${fav}">${ic("estrela", fav ? "ic--cheio" : "")}${fav ? "Nas 4 favoritas" : "4 favoritas"}</button></div>
      ${meus ? `<p class="mini"><a href="#diario">Está ${plural(meus, "vez", "vezes")} no seu diário</a></p>` : ""}
    </div>${ondeVer(o)}</aside>`;
  const listas = [...C.L, ...V.listas, ...AMIGOS.flatMap((a) => a.listas)].filter((l) => l.itens.includes(o.id));
  const mesmoU = u.obras.filter((x) => x.id !== o.id);
  const resenhas = todasResenhas(o.id);
  const principal = `<div class="obra-princ" style="display:grid;gap:22px">
      ${o.nota ? `<p class="aviso">${esc(o.nota)}</p>` : ""}
      ${blocoProgresso(o, e)}
      ${o.elenco.length ? `<section class="q bloco"><h2 class="h2">${o.formato === "hq" ? "Personagens" : "Personagens e elenco"}</h2><div class="elenco">${o.elenco.map((x) => cartaoElenco(o, x)).join("")}</div>
        ${o.formato !== "hq" ? `<p class="mudo mini">Dublagem brasileira só aparece quando está confirmada. O resto ainda vai ser cadastrado.</p>` : ""}</section>` : ""}
      ${o.elenco.length && !breve ? blocoNotasPersonagens(o) : ""}
      <section class="bloco"><div class="sec-h" style="margin:0"><h2 class="leg">Resenhas</h2>${breve ? "" : `<button class="bt bt--mini" data-acao="log-abrir" data-obra="${esc(o.id)}">${ic("lapis")}Escrever a minha</button>`}</div>
        ${resenhas.length ? `<p class="sec-nota" style="margin:0">${NOTA_EXEMPLOS}</p><div class="resenhas">${resenhas.map((l) => resenha(l)).join("")}</div>` : `<p class="mudo">Ninguém escreveu sobre essa ainda.</p>`}</section>
    </div>`;
  return faixa + `<div class="obra-corpo">${lado}${principal}</div>`
    + (listas.length ? secao("Está nestas listas", `<div class="lgrade">${listas.slice(0, 6).map((l) => cardLista(l, l.autor ? AMIGO.get(l.autor)?.nome : "")).join("")}</div>`) : "")
    + (mesmoU.length ? secao(`Mais de ${u.nome}`, trilho(mesmoU.map((x) => cardObra(x)), { id: "tr-uni" }), { ver: `#universo-${u.id}`, botoes: botoesTrilho("tr-uni") }) : "");
}
function cartaoElenco(o, x) {
  const p = C.P.get(x.p);
  if (!p) return "";
  const vu = C.U.get(x.u) || C.U.get(o.universo);
  const animada = o.formato === "desenho" || o.formato === "animacao";
  return `<div class="ecard">${emblema(p, "", vu.cor)}<span class="ecard-n"><a href="#personagem-${esc(p.id)}">${esc(p.nome)}</a>${papelChip(x.r)}</span>`
    + (x.a ? `<span class="ecard-a"><a href="#pessoa-${esc(slug(x.a))}">${esc(x.a)}</a>${x.voz || animada ? " (voz)" : ""}${x.obs ? ` · <span class="mudo">${esc(x.obs)}</span>` : ""}</span>` : x.obs ? `<span class="ecard-a mudo">${esc(x.obs)}</span>` : "")
    + (o.formato !== "hq" ? `<span class="ecard-d">Dublagem BR: ${x.dub ? x.dub.split(" e ").map((d) => `<a href="#pessoa-${esc(slug(d))}">${esc(d)}</a>`).join(" e ") : "a cadastrar"}</span>` : "")
    + (x.u && x.u !== o.universo ? `<span class="ecard-d">Versão de ${esc(vu.nome)}</span>` : "")
    + `</div>`;
}
function blocoNotasPersonagens(o) {
  const chaves = [...new Set(o.elenco.filter((x) => C.P.has(x.p)).map((x) => `${x.p}@${C.U.has(x.u) ? x.u : o.universo}`))];
  const pode = comecou(o.id);
  return `<section class="q bloco"><h2 class="h2">Notas para os personagens</h2>
    <p class="mudo">${pode ? "Cada versão tem a própria nota. Essa nota vale para a versão desta obra." : "Marque como vendo ou terminei (ou registre no diário) para dar nota aos personagens."}</p>
    <div class="vnotas">${chaves.map((k) => {
      const v = C.versoes.get(k), p = C.P.get(v.p), u = C.U.get(v.u), med = mediaVersao(k);
      return `<div class="vnota">${emblema(p, "", u.cor)}<span><a href="#personagem-${esc(p.id)}"><strong>${esc(p.nome)}</strong></a> <span class="mudo mini">${esc(v.atores.join(", ") || u.nome)}</span><br><span class="mini">${med.n ? `Média ${mediaTxt(med.m)} · ${plural(med.n, "nota", "notas")}` : "Sem notas ainda"}</span></span>`
        + avaliador(V.persNotas[k] || 0, "nota-versao", k, "Sua nota para " + p.nome, { mini: true, desligado: !pode }) + `</div>`;
    }).join("")}</div></section>`;
}
function ondeVer(o) {
  if (o.formato === "hq") {
    const bigs = o.franquia === "Marvel" || o.franquia === "DC";
    return `<div class="q bloco"><h2 class="h3">Onde ler no Brasil</h2><p class="mudo">${bigs ? "As HQs da Marvel e da DC saem no Brasil pela Panini, quase sempre em encadernados que juntam várias edições." : "A disponibilidade muda bastante: vale procurar em lojas de quadrinhos e sebos."} As edições brasileiras de cada história ainda vão ser cadastradas.</p></div>`;
  }
  if (emBreve(o)) return "";
  if (TMDB.ativo && o.tmdb) return `<div class="q bloco"><h2 class="h3">Onde assistir no Brasil</h2><div data-provedores="${esc(o.id)}" class="mudo">Procurando...</div><p class="mudo mini">Dados de streaming: JustWatch, via TMDB.</p></div>`;
  return `<div class="q bloco"><h2 class="h3">Onde assistir no Brasil</h2><p class="mudo">Quando o site estiver no ar com a chave do TMDB, aqui aparecem os streamings do Brasil (dados do JustWatch).</p></div>`;
}
function blocoProgresso(o, e) {
  if (o.temporadas) {
    const algumEp = o.temporadas.some((t) => t.eps);
    const abertaPadrao = o.temporadas.find((t) => t.eps && (e.eps?.[t.n] || []).length < t.eps);
    return `<section class="q bloco"><div class="sec-h" style="margin:0"><h2 class="h2">Temporadas</h2>${algumEp ? `<span class="mudo num">${vistosEps(o, e)} de ${plural(totalEps(o), "episódio", "episódios")}</span>` : ""}</div><div>`
      + o.temporadas.map((t) => {
        if (!t.eps) {
          const on = (e.temps || []).includes(t.n);
          return `<div class="temp"><div class="temp-h"><span>Temporada ${t.n}</span><span class="acoes"><button class="chip" data-acao="temp-vista" data-obra="${esc(o.id)}" data-t="${t.n}" aria-pressed="${on}">${ic("check")}Vi</button><button class="bt bt--mini" data-acao="log-abrir" data-obra="${esc(o.id)}" data-t="${t.n}">Registrar</button></span></div></div>`;
        }
        const vis = new Set(e.eps?.[t.n] || []);
        const chave = `${o.id}#${t.n}`;
        const aberta = UI.temps[chave] ?? (abertaPadrao && abertaPadrao.n === t.n);
        return `<details class="temp" data-temp="${esc(chave)}"${aberta ? " open" : ""}><summary><span>Temporada ${t.n}</span><span class="mudo num">${vis.size}/${t.eps}</span>${barra(Math.round((vis.size / t.eps) * 100), "barra--fina")}</summary>
          <div class="temp-c"><div class="eps">${faixaNum(1, t.eps).map((n) => `<button class="ep" data-acao="ep" data-obra="${esc(o.id)}" data-t="${t.n}" data-e="${n}" aria-pressed="${vis.has(n)}" aria-label="Episódio ${n}">${n}</button>`).join("")}</div>
          <div class="acoes"><button class="bt bt--mini" data-acao="temp-toda" data-obra="${esc(o.id)}" data-t="${t.n}">${vis.size === t.eps ? "Desmarcar todos" : "Marcar todos"}</button>
          <button class="bt bt--mini" data-acao="log-abrir" data-obra="${esc(o.id)}" data-t="${t.n}">${ic("diario")}Registrar temporada ou episódio</button></div></div></details>`;
      }).join("") + `</div></section>`;
  }
  if (o.episodios) {
    const n = e.vistos || 0;
    return `<section class="q bloco"><h2 class="h2">Episódios</h2><div class="contador">
      <button class="icbt" data-acao="eps-n" data-obra="${esc(o.id)}" data-d="-1" aria-label="Um episódio a menos">${ic("esq")}</button>
      <span class="num" aria-live="polite">${n} de ${o.episodios} episódios</span>
      <button class="icbt" data-acao="eps-n" data-obra="${esc(o.id)}" data-d="1" aria-label="Um episódio a mais">${ic("dir")}</button>
      <button class="bt bt--mini" data-acao="eps-n" data-obra="${esc(o.id)}" data-d="10">+10</button></div>${barra(Math.round((n / o.episodios) * 100))}</section>`;
  }
  if (o.edicoes) {
    const lidos = new Set(e.eds || []);
    const muitos = o.edicoes.length > 14;
    const numEd = (ed) => (ed.match(/#\s*\d+/) || [ed])[0];
    return `<section class="q bloco"><div class="sec-h" style="margin:0"><h2 class="h2">Edições</h2><span class="mudo num">${lidos.size} de ${o.edicoes.length} lidas</span></div>
      ${muitos ? `<div class="eps">${o.edicoes.map((ed, i) => `<button class="ep" data-acao="ed" data-obra="${esc(o.id)}" data-i="${i}" aria-pressed="${lidos.has(i)}" aria-label="${esc(ed)}">${esc(numEd(ed).replace("#", ""))}</button>`).join("")}</div>`
        : `<div class="eds">${o.edicoes.map((ed, i) => `<button class="ed-l" data-acao="ed" data-obra="${esc(o.id)}" data-i="${i}" aria-pressed="${lidos.has(i)}"><span class="cx">${lidos.has(i) ? ic("check") : ""}</span>${esc(ed)}</button>`).join("")}</div>`}
      <div class="acoes"><button class="bt bt--mini" data-acao="eds-todas" data-obra="${esc(o.id)}">${lidos.size === o.edicoes.length ? "Desmarcar todas" : "Marcar todas"}</button>
      <button class="bt bt--mini" data-acao="log-abrir" data-obra="${esc(o.id)}" data-i="0">${ic("diario")}Registrar uma edição</button></div></section>`;
  }
  return "";
}

// ---------- Personagem ----------
function pgPersonagem(id) {
  const p = C.P.get(id);
  if (!p) return naoAchei();
  PAG.titulo = p.nome;
  const vs = versoesDe(id);
  const g = progressoPersonagem(id);
  const fav = R.favoritos.personagens.includes(id);
  const cor = corValida(COR_FRANQ[p.franquia]);
  const linha = [p.identidade, p.primeira ? "Primeira aparição: " + p.primeira : "Estreia: " + p.estreia].filter(Boolean).map(esc).join(" · ");
  return `<header class="faixa" style="--c1:${cor}"><div class="faixa-in faixa-in--sem-capa"><span class="emb-w">${emblema(p, "emb--xg")}</span><div class="faixa-txt">
      <div class="chips"><span class="chip">${esc(p.franquia)}</span>${p.jogo ? `<a class="chip" href="#jogo">${ic("jogo")}Está no ${NOME_DO_JOGO}</a>` : ""}</div>
      <h1 class="h1">${esc(p.nome)}</h1><p class="faixa-linha">${linha}</p></div></div></header>
    <div class="acoes" style="margin-top:18px"><button class="bt${fav ? " bt--amarelo" : ""}" data-acao="fav-pers" data-p="${esc(id)}" aria-pressed="${fav}">${ic("estrela", fav ? "ic--cheio" : "")}${fav ? "Nos seus 4 favoritos" : "Pôr nos 4 favoritos"}</button>
      <button class="bt" data-acao="partilhar-pers" data-p="${esc(id)}">${ic("partilhar")}Compartilhar meu progresso</button></div>
    <div class="grid2" style="margin-top:20px">
      <section class="q bloco"><div class="sec-h" style="margin:0"><h2 class="h2">Seu progresso</h2><span class="h2 num">${g.pct}%</span></div>${barra(g.pct)}
        <p class="mudo">Você viu ${g.vistas} de ${plural(g.total, "obra", "obras")} com esse personagem, contando participações.</p></section>
      ${p.resumo ? `<section class="q bloco"><h2 class="h2">Quem é</h2><p>${esc(p.resumo)}</p></section>` : ""}
    </div>
    ${secao("Versões", `<div class="versoes">${vs.map(cardVersao).join("")}</div>`, { nota: "Cada universo tem a sua versão, com nota própria. Você só avalia versões de obras que viu ou leu." })}
    ${p.jogo ? secao(`Ficha no ${NOME_DO_JOGO}`, fichaJogo(p.jogo)) : ""}`;
}
function cardVersao(v) {
  const u = C.U.get(v.u), p = C.P.get(v.p);
  const med = mediaVersao(v.chave);
  const pode = podeAvaliarVersao(v);
  const soVoz = v.aps.every((a) => { const o = C.O.get(a.obra); return a.voz || o.formato === "desenho" || o.formato === "animacao"; });
  const aberto = UI.versoes[v.chave];
  const aps = aberto ? v.aps : v.aps.slice(0, 4);
  const pessoa = (n) => `<a href="#pessoa-${esc(slug(n))}">${esc(n)}</a>`;
  return `<article class="q versao" style="--c:${u.cor}"><div class="versao-cab">${uchip(u)}<span class="mudo mini">${esc(u.anos)}</span></div>
    ${v.atores.length ? `<p class="versao-atores"><span>${soVoz ? "Voz" : "Interpretação"}:</span> ${v.atores.map(pessoa).join(", ")}${v.dubs.length ? `<br><span>Dublagem BR:</span> ${v.dubs.map((d) => d.split(" e ").map(pessoa).join(" e ")).join(", ")}` : ""}</p>` : `<p class="versao-atores"><span>Nos quadrinhos</span></p>`}
    <div class="nota-linha"><span>${med.n ? `${estrelas(Math.round(med.m))} <strong>${mediaTxt(med.m)}</strong> <span class="mudo mini">(${plural(med.n, "nota", "notas")})</span>` : `<span class="mudo">Sem notas ainda</span>`}</span>
      ${avaliador(V.persNotas[v.chave] || 0, "nota-versao", v.chave, `Sua nota para ${p.nome} em ${u.nome}`, { mini: true, desligado: !pode })}</div>
    ${pode ? "" : `<p class="mudo mini">Veja ou leia uma obra desta versão para dar nota.</p>`}
    <div>${aps.map((a) => { const o = C.O.get(a.obra); return `<a class="ap" href="#obra-${esc(o.id)}">${capa(o)}<span><span class="ap-t" style="display:block">${esc(o.titulo)}</span><span class="ap-m">${o.ano} · ${esc(FORMATO[o.formato].nome)}${a.obs ? " · " + esc(a.obs) : ""}</span></span>${papelChip(a.papel)}</a>`; }).join("")}</div>
    ${v.aps.length > 4 ? `<button class="bt bt--mini" data-acao="versao-mais" data-alvo="${esc(v.chave)}">${aberto ? "Mostrar menos" : `Ver todas as ${v.aps.length}`}</button>` : ""}
  </article>`;
}
function fichaJogo(j) {
  const it = [["Editora", j.editora], ["Gênero", j.genero], ["Lado", j.lado], ["Poder", j.poder.join(", ")], ["Equipe", j.equipe.length ? j.equipe.join(", ") : "Nenhuma"], ["Estreia", j.estreia]];
  return `<div class="q"><div class="ficha">${it.map(([k, v]) => `<div><b>${k}</b><span>${esc(v)}</span></div>`).join("")}</div><p class="mudo mini" style="margin-top:10px">É com essas pistas que o ${NOME_DO_JOGO} compara cada chute.</p></div>`;
}

// ---------- Universo e pessoa ----------
function pgUniverso(id) {
  const u = C.U.get(id);
  if (!u) return naoAchei();
  PAG.titulo = u.nome;
  const g = progressoUniverso(id);
  const vers = [...C.versoes.values()].filter((v) => v.u === id).map((v) => C.P.get(v.p)).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return `<header class="faixa" style="--c1:${u.cor}"><div class="faixa-in faixa-in--sem-capa"><span class="emb-w"><span class="emb emb--xg" aria-hidden="true">${ic("globo")}</span></span><div class="faixa-txt">
      <div class="chips"><span class="chip">${esc(u.franquia)}</span><span class="chip">${esc(u.midia)}</span><span class="chip">${esc(u.anos)}</span></div>
      <h1 class="h1">${esc(u.nome)}</h1><p class="faixa-linha">${esc(u.desc)}</p></div></div></header>
    <section class="q bloco" style="margin-top:20px"><div class="sec-h" style="margin:0"><h2 class="h2">Seu progresso</h2><span class="h2 num">${g.pct}%</span></div>${barra(g.pct)}
      <div class="acoes"><span class="mudo">Você viu ${g.vistas} de ${plural(g.total, "obra", "obras")} deste universo.</span><button class="bt bt--mini" data-acao="partilhar-uni" data-u="${esc(id)}">${ic("partilhar")}Compartilhar</button></div></section>
    ${secao("Obras em ordem de lançamento", `<div class="grade">${u.obras.map((o) => cardObra(o)).join("")}</div>`)}
    ${vers.length ? secao("Personagens neste universo", `<div class="chips">${vers.map((p) => `<a class="chip" href="#personagem-${esc(p.id)}">${esc(p.nome)}</a>`).join("")}</div>`) : ""}`;
}
function pgPessoa(id) {
  const pe = C.pessoas.get(id);
  if (!pe) return naoAchei();
  PAG.titulo = pe.nome;
  const grupos = [["atuacao", "Atuação"], ["voz", "Voz original"], ["dublagem", "Dublagem brasileira"]];
  return `<h1 class="h1" style="margin-top:8px">${esc(pe.nome)}</h1><p class="mudo" style="margin-top:6px">${plural(pe.creditos.length, "crédito", "créditos")} na ${NOME_DO_SITE}.</p>`
    + grupos.map(([t, nome]) => {
      const cs = pe.creditos.filter((c) => c.tipo === t);
      if (!cs.length) return "";
      return secao(nome, `<div class="q">${cs.map((c) => {
        const p = C.P.get(c.p), o = C.O.get(c.obra);
        return `<a class="ap" href="#obra-${esc(o.id)}">${capa(o)}<span><span class="ap-t" style="display:block">${esc(p.nome)}</span><span class="ap-m">em ${esc(o.titulo)} · ${o.ano}${c.obs ? " · " + esc(c.obs) : ""}</span></span>${papelChip(c.papel)}</a>`;
      }).join("")}</div>`);
    }).join("");
}

// ---------- Diário ----------
function pgDiario() {
  PAG.titulo = "Diário";
  const f = UI.diario;
  const anos = [...new Set(V.logs.map((l) => l.data.slice(0, 4)))].sort().reverse();
  const tags = [...new Set(V.logs.flatMap((l) => l.tags || []))].sort();
  const logs = V.logs.filter((l) => (f.ano === "todos" || l.data.startsWith(f.ano))
    && (f.formato === "todos" || C.O.get(l.obra).formato === f.formato) && (!f.tag || (l.tags || []).includes(f.tag)));
  const meses = new Map();
  for (const l of logs) { const k = l.data.slice(0, 7); if (!meses.has(k)) meses.set(k, []); meses.get(k).push(l); }
  const cab = `<div class="sec-h"><h1 class="h1">Seu diário</h1><button class="bt bt--forte" data-acao="registrar">${ic("mais")}Registrar</button></div>
    <p class="mudo">${plural(V.logs.length, "registro", "registros")}${V.logs.length ? ` · ${plural(V.logs.filter((l) => l.data.startsWith(HOJE.slice(0, 4))).length, "registro", "registros")} em ${HOJE.slice(0, 4)}` : ""}</p>${bannerExemplos("Seu diário")}`;
  if (!V.logs.length) return cab + `<div class="q vazio" style="margin-top:18px"><h2 class="h2">Diário vazio, herói!</h2><p>Registre um filme, um episódio ou uma edição de HQ e ele aparece aqui, com data, nota e resenha.</p><button class="bt bt--forte" data-acao="registrar">${ic("mais")}Registrar a primeira</button></div>`;
  const filtros = `<div class="filtros">${anos.length > 1 ? chipsFiltro("diario.ano", [["todos", "Todos os anos"], ...anos.map((a) => [a, a])], f.ano) : ""}
    ${chipsFiltro("diario.formato", FILTRO_FORMATO, f.formato)}
    ${tags.length ? chipsFiltro("diario.tag", [["", "Todas as tags"], ...tags.map((t) => [t, "#" + t])], f.tag) : ""}</div>`;
  const corpo = logs.length ? [...meses].map(([k, ls]) => { const [a, m] = k.split("-").map(Number); return `<section class="mes"><h2 class="mes-t">${MESES[m - 1]} ${a}</h2>${ls.map(linhaDiario).join("")}</section>`; }).join("")
    : `<div class="q vazio"><p>Nenhum registro com esses filtros.</p></div>`;
  return cab + filtros + corpo;
}
function linhaDiario(l) {
  const o = C.O.get(l.obra);
  const [, m, d] = l.data.split("-").map(Number);
  return `<div class="dl"><span class="dl-dia">${d}<small>${MESES_C[m - 1]}</small></span><a href="#obra-${esc(o.id)}" aria-label="${esc(o.titulo)}">${capa(o, { status: false })}</a>
    <div><a class="dl-t" href="#obra-${esc(o.id)}">${esc(o.titulo)}</a> <span class="mudo mini">${o.ano}</span>
      <div class="dl-m">${l.escopo ? `<span class="tag">${esc(escopoTxt(l))}</span>` : ""}${estrelas(l.nota)}${l.exemplo ? '<span class="selo-ex">exemplo</span>' : ""}${(l.tags || []).map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}</div></div>
    <div class="dl-ic">${l.curtiu ? `<span class="on" title="Curtiu">${ic("coracao", "ic--cheio")}</span>` : ""}${l.rever ? `<span title="Revendo">${ic("rever")}</span>` : ""}${l.review ? `<span title="Tem resenha">${ic("balao")}</span>` : ""}
      <button class="icbt" data-acao="${l.exemplo ? "log-ver" : "log-editar"}" data-log="${esc(l.id)}" aria-label="${l.exemplo ? "Ver registro" : "Editar registro"}">${ic(l.exemplo ? "olho" : "lapis")}</button></div></div>`;
}

// ---------- Listas ----------
function pgListas() {
  PAG.titulo = "Listas";
  const deles = AMIGOS.flatMap((a) => a.listas.map((l) => cardLista(l, a.nome)));
  return `<div class="sec-h"><h1 class="h1">Listas</h1><button class="bt bt--forte" data-acao="lista-nova">${ic("mais")}Criar lista</button></div>
    <p class="prosa mudo">Qualquer pessoa pode criar listas. As oficiais são montadas pela ${NOME_DO_SITE}.</p>
    ${secao("Oficiais", `<div class="lgrade">${C.L.map((l) => cardLista(l)).join("")}</div>`)}
    ${secao("Suas listas", V.listas.length ? `<div class="lgrade">${V.listas.map((l) => cardLista(l)).join("")}</div>` : `<div class="q vazio"><p>Você ainda não criou nenhuma lista.</p><button class="bt" data-acao="lista-nova">${ic("mais")}Criar a primeira</button></div>`)}
    ${deles.length ? secao("Da comunidade", `<div class="lgrade">${deles.join("")}</div>`, { nota: NOTA_EXEMPLOS }) : ""}`;
}
function acharLista(id) {
  const of = C.L.find((l) => l.id === id);
  if (of) return { l: of, tipo: "oficial" };
  const minha = V.listas.find((l) => l.id === id);
  if (minha) return { l: minha, tipo: minha.exemplo ? "exemplo" : "minha" };
  for (const a of AMIGOS) { const l = a.listas.find((x) => x.id === id); if (l) return { l, tipo: "amigo", autor: a }; }
  return null;
}
function pgLista(id) {
  const r = acharLista(id);
  if (!r) return naoAchei();
  const { l, tipo, autor } = r;
  PAG.titulo = l.titulo;
  const itens = l.itens.map((i) => C.O.get(i)).filter(Boolean);
  const vistas = itens.filter((o) => vista(o.id)).length;
  const pct = itens.length ? Math.round((vistas / itens.length) * 100) : 0;
  const edita = tipo === "minha";
  const por = tipo === "oficial" ? `<span class="oficial">Oficial</span> ${NOME_DO_SITE}` : tipo === "amigo" ? `por <a href="#usuario-${esc(autor.id)}">${esc(autor.nome)}</a> <span class="selo-ex">exemplo</span>` : tipo === "exemplo" ? `sua lista <span class="selo-ex">exemplo</span>` : "sua lista";
  return `<p class="mini" style="margin-top:6px">${por}</p><h1 class="h1" style="margin-top:6px">${esc(l.titulo)}</h1>
    ${l.descricao ? `<p class="prosa" style="margin-top:8px;font-size:18px">${esc(l.descricao)}</p>` : ""}
    <section class="q bloco" style="margin-top:18px"><div class="sec-h" style="margin:0"><span class="h3">Você viu ${vistas} de ${plural(itens.length, "obra", "obras")}</span><span class="h2 num">${pct}%</span></div>${barra(pct)}
      ${edita ? `<div class="acoes"><button class="bt bt--forte bt--mini" data-acao="lista-buscar" data-lista="${esc(l.id)}">${ic("mais")}Adicionar obra</button><button class="bt bt--mini" data-acao="lista-editar" data-lista="${esc(l.id)}">${ic("lapis")}Editar</button><button class="bt bt--mini bt--perigo" data-acao="lista-apagar" data-lista="${esc(l.id)}">${ic("lixo")}Apagar lista</button></div>` : ""}</section>
    ${itens.length ? `<div class="litens" style="margin-top:20px">${itens.map((o, i) => `<div class="litem"><span class="litem-n">${i + 1}</span><a href="#obra-${esc(o.id)}" aria-label="${esc(o.titulo)}">${capa(o)}</a>
      <span><a class="ap-t" href="#obra-${esc(o.id)}" style="display:block;text-decoration:none">${esc(o.titulo)}</a><span class="ap-m">${o.ano} · ${esc(FORMATO[o.formato].nome)}${emBreve(o) ? " · em breve" : ""}</span></span>
      ${edita ? `<span class="litem-a"><button class="icbt" data-acao="lista-mover" data-lista="${esc(l.id)}" data-i="${i}" data-d="-1" aria-label="Subir"${i === 0 ? " disabled" : ""}>${ic("cima")}</button><button class="icbt" data-acao="lista-mover" data-lista="${esc(l.id)}" data-i="${i}" data-d="1" aria-label="Descer"${i === itens.length - 1 ? " disabled" : ""}>${ic("baixo")}</button><button class="icbt" data-acao="lista-tirar" data-lista="${esc(l.id)}" data-obra="${esc(o.id)}" aria-label="Tirar da lista">${ic("x")}</button></span>` : ""}</div>`).join("")}</div>`
      : `<div class="q vazio" style="margin-top:20px"><p>Lista vazia por enquanto.</p></div>`}`;
}

// ---------- Perfil ----------
function pgPerfil() {
  PAG.titulo = "Perfil";
  const s = estatisticas();
  const nome = R.perfil.nome || "Você";
  const favP = V.favP.map((id) => C.P.get(id)).filter(Boolean);
  const favO = V.favO.map((id) => C.O.get(id)).filter(Boolean);
  const vagas = (n, txt) => Array.from({ length: Math.max(0, 4 - n) }, () => `<span class="vagao">${txt}</span>`).join("");
  const maxH = Math.max(1, ...s.hist);
  const progP = C.personagens.map((p) => ({ p, ...progressoPersonagem(p.id) })).filter((x) => x.vistas).sort((a, b) => b.pct - a.pct || b.vistas - a.vistas);
  const progU = C.universos.map((u) => ({ u, ...progressoUniverso(u.id) })).filter((x) => x.vistas).sort((a, b) => b.pct - a.pct || b.vistas - a.vistas);
  const lim = UI.perfilTudo ? 999 : 6;
  const minhasRes = V.logs.filter((l) => l.review).slice(0, 3);
  const avatar = R.perfil.nome ? emblema({ nome }, "avatar-g", "#c2166b") : `<span class="emb avatar-g" style="--av:#c2166b" aria-hidden="true">${ic("perfil")}</span>`;
  return `<section class="perfil-cab" style="margin-top:8px">${avatar}<div style="display:grid;gap:6px">
      <h1 class="h1">${esc(nome)}</h1><p class="mudo">${R.perfil.usuario ? "@" + esc(R.perfil.usuario) + " · " : ""}no beta desde novembro de 2026</p>
      ${R.perfil.bio ? `<p>${esc(R.perfil.bio)}</p>` : ""}
      <div class="acoes"><button class="bt bt--mini" data-acao="perfil-editar">${ic("lapis")}${R.perfil.nome ? "Editar perfil" : "Criar meu perfil"}</button><a class="bt bt--mini" href="#listas">${ic("lista")}Listas</a></div></div></section>
    ${bannerExemplos("Seu perfil")}
    <div class="numeros">${[[s.terminadas, "obras terminadas"], [s.esteAno, `registros em ${HOJE.slice(0, 4)}`], [s.eps, "episódios vistos"], [s.eds, "edições lidas"]].map(([n, t]) => `<div class="numero"><b>${n}</b><span>${t}</span></div>`).join("")}</div>
    ${secao("Personagens favoritos", `<div class="top4p">${favP.map((p) => `<a href="#personagem-${esc(p.id)}">${emblema(p)}${esc(p.nome)}</a>`).join("")}${vagas(favP.length, "Escolha na página do personagem")}</div>`, { nota: V.favPEx ? "Exemplo. Os seus aparecem quando você favoritar um personagem." : "" })}
    ${secao("Obras favoritas", `<div class="top4">${favO.map((o) => `<a href="#obra-${esc(o.id)}" aria-label="${esc(o.titulo)}">${capa(o)}</a>`).join("")}${vagas(favO.length, "Escolha na página da obra")}</div>`, { nota: V.favOEx ? "Exemplo. As suas aparecem quando você escolher uma obra." : "" })}
    <div class="grid2">
      ${secao("Suas notas", `<div class="q"><div class="hist" role="img" aria-label="Quantas obras você avaliou com cada nota">${s.hist.map((n) => `<i style="height:${Math.round((n / maxH) * 100)}%" title="${n}"></i>`).join("")}</div><div class="hist-l"><span>½</span><span>★★★★★</span></div></div>`)}
      ${secao("Por formato", `<div class="q"><div class="chips">${Object.keys(FORMATO).map((k) => `<span class="chip">${esc(FORMATO[k].plural)}: <strong class="num">${s.porFormato[k] || 0}</strong></span>`).join("")}</div><p class="mudo mini" style="margin-top:10px">Obras terminadas de cada tipo.</p></div>`)}
    </div>
    ${secao("Progresso por personagem", progP.length ? `<div class="q prog">${progP.slice(0, lim).map((x) => `<div class="prog-i">${emblema(x.p)}<a class="prog-n" href="#personagem-${esc(x.p.id)}">${esc(x.p.nome)} <span class="mudo mini">${x.vistas}/${x.total}</span></a><span class="prog-p num">${x.pct}%</span>${barra(x.pct, "barra--fina")}</div>`).join("")}
      ${progP.length > 6 ? `<button class="bt bt--mini" data-acao="perfil-tudo">${UI.perfilTudo ? "Mostrar menos" : `Ver todos os ${progP.length}`}</button>` : ""}</div>` : `<p class="mudo">Termine uma obra para ver quanto já viu de cada personagem.</p>`)}
    ${progU.length ? secao("Progresso por universo", `<div class="q prog">${progU.slice(0, lim).map((x) => `<div class="prog-i"><span class="emb" style="--av:${x.u.cor}" aria-hidden="true">${ic("globo")}</span><a class="prog-n" href="#universo-${esc(x.u.id)}">${esc(x.u.nome)} <span class="mudo mini">${x.vistas}/${x.total}</span></a><span class="prog-p num">${x.pct}%</span>${barra(x.pct, "barra--fina")}</div>`).join("")}</div>`) : ""}
    ${secao("Conquistas", `<div class="conq">${CONQUISTAS.map((c) => { const ok = c.ok(s); return `<div class="cq${ok ? "" : " off"}"><span class="burst-n">${esc(c.t)}</span><b>${esc(c.nome)}</b><span>${esc(c.desc)}</span></div>`; }).join("")}</div>`)}
    ${minhasRes.length ? secao("Suas resenhas", `<div class="resenhas">${minhasRes.map((l) => resenha(l, { comObra: true })).join("")}</div>`, { ver: "#diario", verTxt: "Diário" }) : ""}
    ${secao("Quem você segue", `<div class="amigos">${AMIGOS.map((a) => { const sg = R.seguindo.includes(a.id); return `<div class="amigo">${emblema({ nome: a.nome }, "", a.cor)}<a href="#usuario-${esc(a.id)}">${esc(a.nome)} <span class="mudo mini">@${esc(a.usuario)}</span></a><button class="bt bt--mini${sg ? "" : " bt--forte"}" data-acao="seguir" data-u="${esc(a.id)}" aria-pressed="${sg}">${sg ? "Seguindo" : "Seguir"}</button><span class="mudo mini">${esc(a.bio)}</span></div>`; }).join("")}</div>`, { nota: NOTA_EXEMPLOS })}
    ${secao("Ajustes", `<div class="q ajustes"><p class="armazem" id="armazem"></p>
      <div class="acoes"><button class="bt bt--mini" data-acao="exemplos">${R.ocultarExemplos ? "Mostrar exemplos de novo" : "Apagar exemplos"}</button>
      <button class="bt bt--mini" data-acao="exportar">${ic("baixar")}Baixar backup</button>
      <button class="bt bt--mini" data-acao="importar">${ic("upload")}Importar backup</button>
      <button class="bt bt--mini bt--perigo" data-acao="apagar-tudo">${ic("lixo")}Apagar tudo</button></div>
      <input type="file" id="arquivo-importar" accept="application/json,.json" hidden>
      <p class="mudo mini">No site de verdade, aqui também vão ficar a política de privacidade e o botão de excluir a conta.</p></div>`)}`;
}
function pgUsuario(id) {
  const a = AMIGO.get(id);
  if (!a) return naoAchei();
  PAG.titulo = a.nome;
  const sg = R.seguindo.includes(a.id);
  const favP = a.fav.map((p) => C.P.get(p)).filter(Boolean);
  return `<section class="perfil-cab" style="margin-top:8px">${emblema({ nome: a.nome }, "avatar-g", a.cor)}<div style="display:grid;gap:6px">
      <h1 class="h1">${esc(a.nome)}</h1><p class="mudo">@${esc(a.usuario)} <span class="selo-ex">perfil de exemplo</span></p><p>${esc(a.bio)}</p>
      <div class="acoes"><button class="bt bt--mini${sg ? "" : " bt--forte"}" data-acao="seguir" data-u="${esc(a.id)}" aria-pressed="${sg}">${sg ? "Seguindo" : "Seguir"}</button></div></div></section>
    <div class="numeros">${[[Object.keys(a.notas).length, "obras avaliadas"], [a.logs.length, "registros recentes"], [Object.keys(a.pers).length, "versões avaliadas"], [a.listas.length, a.listas.length === 1 ? "lista" : "listas"]].map(([n, t]) => `<div class="numero"><b>${n}</b><span>${t}</span></div>`).join("")}</div>
    ${secao("Personagens favoritos", `<div class="top4p">${favP.map((p) => `<a href="#personagem-${esc(p.id)}">${emblema(p)}${esc(p.nome)}</a>`).join("")}</div>`)}
    ${secao("Últimos registros", `<div class="resenhas">${a.logs.map((l) => (l.review ? resenha(l, { comObra: true }) : itemFeed(l))).join("")}</div>`)}
    ${a.listas.length ? secao("Listas", `<div class="lgrade">${a.listas.map((l) => cardLista(l, a.nome)).join("")}</div>`) : ""}`;
}

// ---------- Sobre ----------
function pgSobre() {
  PAG.titulo = "Sobre o beta";
  return `<h1 class="h1" style="margin-top:8px">Sobre o beta</h1>
    <div class="prosa" style="margin-top:14px;font-size:17px">
      <p>A ${NOME_DO_SITE} é um diário só de heróis: filmes, séries, desenhos e HQs da Marvel, da DC e de outras editoras, tudo num lugar só. O foco são os personagens: cada versão de cada personagem tem página, nota e lista de aparições.</p>
      <p>Esta é a versão de teste. Tudo funciona de verdade (registrar, dar nota, listas, progresso, ${NOME_DO_JOGO}), mas a comunidade é de exemplo e o catálogo ainda é pequeno.</p>
    </div>
    ${secao("O que entra na versão no ar", `<div class="q prosa"><p>Endereço próprio (.com.br), login com Google e contas de verdade, para seguir amigos reais.</p><p>Pôsteres e dados de streaming do TMDB, com o aviso de crédito.</p><p>Política de privacidade (LGPD), botão para excluir a conta, denúncias com moderação e cuidados extras com menores de idade (ECA Digital).</p><p>Catálogo maior, com as edições brasileiras das HQs e onde ler cada uma.</p></div>`)}
    ${secao("Sobre os dados", `<div class="q prosa"><p>O catálogo foi montado à mão. A dublagem brasileira só aparece quando está confirmada; o resto fica “a cadastrar”. O elenco de filmes que ainda não estrearam é parcial.</p><p>As capas que você vê aqui são desenhadas pela própria ${NOME_DO_SITE}. Quando o site estiver no ar com a chave do TMDB, os pôsteres oficiais aparecem por cima delas.</p></div>`)}
    ${secao("Seus dados", `<div class="q prosa"><p id="armazem"></p><p>Em Perfil, você pode baixar um backup, importar um backup ou apagar tudo.</p></div>`)}`;
}
