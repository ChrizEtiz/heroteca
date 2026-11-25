// ================= Catálogo =================
const C = {
  U: new Map(), P: new Map(), O: new Map(), L: [], porTmdb: new Map(),
  obras: [], personagens: [], universos: [],
  versoes: new Map(), aparicoes: new Map(), pessoas: new Map(),
  jogo: [], jogoPorId: new Map(),
};

async function carregarCatalogo() {
  const r = await fetch("catalogo.json", { cache: "no-cache" });
  if (!r.ok) throw new Error("catalogo " + r.status);
  indexar(await r.json());
}

// O catálogo grande (milhares de obras do TMDB) só desce quando a pessoa vai
// explorar ou procurar. Depois disso fica em memória até fechar a aba.
let promessaExtra = null;
const extraPronto = () => C.extraCarregado === true;
function carregarExtra() {
  if (!promessaExtra) {
    promessaExtra = (async () => {
      const r = await fetch("catalogo-extra.json", { cache: "default" });
      if (!r.ok) throw new Error("extra " + r.status);
      const regs = await r.json();
      C.extraCarregado = true;
      indexar(regs);
    })().catch((e) => { promessaExtra = null; throw e; });
  }
  return promessaExtra;
}

function addPessoa(nome, credito) {
  const id = slug(nome);
  if (!id) return;
  let p = C.pessoas.get(id);
  if (!p) { p = { id, nome, creditos: [] }; C.pessoas.set(id, p); }
  p.creditos.push(credito);
}

function indexar(regs) {
  // tudo que é derivado é refeito do zero, para indexar poder rodar de novo
  C.versoes.clear(); C.aparicoes.clear(); C.pessoas.clear();
  C.jogo = []; C.jogoPorId.clear();
  for (const x of regs) {
    if (!x || typeof x !== "object") continue;
    if (x.tipo === "universo") C.U.set(x.id, x);
    else if (x.tipo === "personagem") C.P.set(x.id, x);
    else if (x.tipo === "obra") C.O.set(x.id, x);
    else if (x.tipo === "lista" && !C.L.some((l) => l.id === x.id)) C.L.push(x);
  }
  C.universos = [...C.U.values()];
  C.personagens = [...C.P.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  C.obras = [...C.O.values()].filter((o) => C.U.has(o.universo));
  // As obras vindas do TMDB chegam enxutas: completa o que as páginas esperam.
  C.porTmdb.clear();
  for (const o of C.obras) {
    o.franquia = C.U.get(o.universo).franquia;
    if (!o.original) o.original = o.titulo;
    if (!o.elenco) o.elenco = [];
    if (o.tmdb && o.tmdb.i) C.porTmdb.set((o.tmdb.t || "movie") + ":" + o.tmdb.i, o);
  }
  for (const u of C.universos) { u.cor = corValida(u.cor); u.busca = normalizar(`${u.nome} ${u.franquia} ${u.midia}`); u.obras = []; }
  for (const p of C.personagens) p.busca = [p.nome, p.identidade, ...(p.apelidos || [])].filter(Boolean).map(normalizar);
  for (const o of C.obras) {
    o.busca = normalizar(`${o.titulo} ${o.original} ${o.ano}`);
    C.U.get(o.universo).obras.push(o);
    for (const e of o.elenco || []) {
      if (!C.P.has(e.p)) continue;
      const u = C.U.has(e.u) ? e.u : o.universo;
      const chave = `${e.p}@${u}`;
      let v = C.versoes.get(chave);
      if (!v) { v = { chave, p: e.p, u, aps: [], atores: [], dubs: [], ano: o.ano }; C.versoes.set(chave, v); }
      const ap = { obra: o.id, p: e.p, u, papel: e.r, ator: e.a || "", dub: e.dub || "", obs: e.obs || "", voz: !!e.voz };
      v.aps.push(ap);
      v.ano = Math.min(v.ano, o.ano);
      if (ap.ator && !v.atores.includes(ap.ator)) v.atores.push(ap.ator);
      if (ap.dub && !v.dubs.includes(ap.dub)) v.dubs.push(ap.dub);
      if (!C.aparicoes.has(e.p)) C.aparicoes.set(e.p, []);
      C.aparicoes.get(e.p).push(ap);
      const animada = o.formato === "desenho" || o.formato === "animacao";
      if (ap.ator) addPessoa(ap.ator, { ...ap, tipo: ap.voz || animada ? "voz" : "atuacao" });
      if (ap.dub) ap.dub.split(" e ").forEach((n) => addPessoa(n.trim(), { ...ap, tipo: "dublagem" }));
    }
  }
  for (const u of C.universos) u.obras.sort((a, b) => a.ano - b.ano || a.titulo.localeCompare(b.titulo, "pt-BR"));
  for (const v of C.versoes.values()) v.aps.sort((a, b) => C.O.get(a.obra).ano - C.O.get(b.obra).ano);
  for (const p of C.pessoas.values()) p.creditos.sort((a, b) => C.O.get(a.obra).ano - C.O.get(b.obra).ano);
  // Jogo do dia: mesmos nomes e ids do jogo avulso, para o personagem do dia bater
  for (const p of C.personagens) {
    if (!p.jogo) continue;
    const j = { ...p.jogo, id: slug(p.jogo.nome), site: p.id, apelidos: p.apelidos || [], franquia: p.franquia };
    j.busca = [j.nome, ...j.apelidos].map(normalizar);
    C.jogo.push(j);
    C.jogoPorId.set(j.id, j);
  }
}

const emBreve = (o) => o.status === "em-breve" && (!o.data || o.data > HOJE);
const versoesDe = (pid) => [...C.versoes.values()].filter((v) => v.p === pid).sort((a, b) => a.ano - b.ano);
function obrasDoPersonagem(pid) {
  const ids = [...new Set(aparicoesCompletas(pid).map((a) => a.obra))];
  return ids.map((id) => C.O.get(id)).filter(Boolean).sort((a, b) => a.ano - b.ano);
}

// ================= Perfis de exemplo (comunidade do beta) =================
// Gente fictícia, só para testar a parte social. Tudo aparece marcado como exemplo.
const AMIGOS = [
  {
    id: "lari", nome: "Lari", usuario: "lari.hq", cor: "#1f56c6", bio: "Leio mais do que assisto. Time Batman: Ano Um.",
    fav: ["batman", "gordon", "mulher-gato", "arlequina"],
    notas: { "batman-ano-um": 10, "o-longo-dia-das-bruxas": 9, "a-piada-mortal": 8, "batman-a-serie-animada": 10, "cavaleiro-das-trevas-2008": 10, "the-batman-2022": 9, "o-cavaleiro-das-trevas-hq": 9, "grandes-astros-superman": 9, "batman-1989": 8, "batman-e-robin-1997": 3, "pinguim-2024": 9, "coringa-2019": 7, "a-noite-mais-densa": 8, "batman-begins-2005": 8 },
    pers: { "batman@dc-hq": 10, "gordon@dc-hq": 10, "coringa@nolan": 10, "batman@the-batman": 9, "pinguim@the-batman": 10, "batman@dcau": 10, "coringa@dcau": 10, "batman@nolan": 8 },
    logs: [
      { obra: "the-batman-2022", data: "2026-11-22", nota: 9, curtiu: true, rever: true, review: "O Batman mais detetive do cinema. A chuva, o Charada, a trilha... parece Ano Um em filme." },
      { obra: "pinguim-2024", data: "2026-11-16", nota: 9, review: "O Colin Farrell sumiu dentro do personagem. Série de máfia que por acaso é de herói." },
      { obra: "o-longo-dia-das-bruxas", data: "2026-11-09", nota: 9, curtiu: true, review: "Um mistério que vai de feriado em feriado. A arte do Tim Sale é absurda." },
      { obra: "batman-e-robin-1997", data: "2026-10-31", nota: 3, review: "Vi pela zoeira no Halloween. Missão cumprida: rimos muito.", tags: ["zoeira"] },
    ],
    listas: [{ id: "lari-iniciante", titulo: "HQs pra quem nunca leu HQ", descricao: "Histórias fechadas, sem precisar saber nada antes.", itens: ["batman-ano-um", "grandes-astros-superman", "o-longo-dia-das-bruxas", "a-saga-da-fenix-negra", "ultimate-homem-aranha-miles", "invencivel-hq"] }],
  },
  {
    id: "pedro", nome: "Pedro", usuario: "pedro.mcu", cor: "#a3121f", bio: "Vi tudo do MCU na ordem. Duas vezes.",
    fav: ["homem-de-ferro", "capitao-america", "thor", "loki"],
    notas: { "os-vingadores-2012": 9, "vingadores-guerra-infinita-2018": 10, "vingadores-ultimato-2019": 10, "capitao-america-soldado-invernal-2014": 10, "capitao-america-guerra-civil-2016": 9, "homem-de-ferro-2008": 9, "thor-ragnarok-2017": 8, "guardioes-da-galaxia-2014": 9, "homem-aranha-sem-volta-para-casa-2021": 9, "deadpool-e-wolverine-2024": 8, "thor-amor-e-trovao-2022": 5, "quarteto-fantastico-primeiros-passos-2025": 8, "capitao-america-admiravel-mundo-novo-2025": 6, "loki-2021": 9, "wandavision-2021": 8, "pantera-negra-2018": 9 },
    pers: { "homem-de-ferro@mcu": 10, "capitao-america@mcu": 10, "thanos@mcu": 10, "loki@mcu": 9, "doutor-estranho@mcu": 8, "homem-aranha@mcu": 8, "killmonger@mcu": 9 },
    logs: [
      { obra: "quarteto-fantastico-primeiros-passos-2025", data: "2026-11-21", nota: 8, review: "Esse Quarteto tem cara de família de verdade. Agora é contar os dias pro Destino.", tags: ["esquenta-destino"] },
      { obra: "vingadores-ultimato-2019", data: "2026-11-14", nota: 10, curtiu: true, rever: true, review: "Revendo antes de Doutor Destino. A cena dos portais ainda me arrepia.", tags: ["esquenta-destino"] },
      { obra: "vingadores-guerra-infinita-2018", data: "2026-11-07", nota: 10, rever: true, tags: ["esquenta-destino"] },
      { obra: "capitao-america-soldado-invernal-2014", data: "2026-10-28", nota: 10, review: "Melhor filme solo do MCU e eu não aceito discussão." },
    ],
    listas: [{ id: "pedro-destino", titulo: "Maratona até Doutor Destino", descricao: "Um filme por dia até a estreia.", itens: ["homem-de-ferro-2008", "os-vingadores-2012", "capitao-america-guerra-civil-2016", "vingadores-guerra-infinita-2018", "vingadores-ultimato-2019", "loki-2021", "homem-aranha-sem-volta-para-casa-2021", "quarteto-fantastico-primeiros-passos-2025"] }],
  },
  {
    id: "bia", nome: "Bia", usuario: "bia.quinzel", cor: "#c2166b", bio: "Criada pelo DCAU.",
    fav: ["arlequina", "hera-venenosa", "super-choque", "batman"],
    notas: { "batman-a-serie-animada": 10, "batman-mascara-do-fantasma-1993": 10, "amor-louco": 10, "superman-a-serie-animada": 9, "liga-da-justica-2001": 9, "liga-da-justica-sem-limites": 10, "super-choque": 9, "aves-de-rapina-2020": 7, "o-esquadrao-suicida-2021": 8, "esquadrao-suicida-2016": 4, "coringa-delirio-a-dois-2024": 4, "os-jovens-titas-2003": 9 },
    pers: { "arlequina@dcau": 10, "arlequina@dceu": 8, "coringa@dcau": 10, "batman@dcau": 10, "hera-venenosa@dcau": 9, "super-choque@dcau": 10, "arlequina@coringa-phillips": 4 },
    logs: [
      { obra: "liga-da-justica-sem-limites", data: "2026-11-20", nota: 10, curtiu: true, review: "Cada episódio apresenta um herói que eu nem conhecia e no fim todos parecem importantes." },
      { obra: "amor-louco", data: "2026-11-12", nota: 10, review: "Dá pra ler numa sentada. Triste, engraçada e explica a Arlequina melhor que qualquer filme." },
      { obra: "coringa-delirio-a-dois-2024", data: "2026-11-03", nota: 4, review: "Queria gostar. O musical não me pegou." },
      { obra: "batman-mascara-do-fantasma-1993", data: "2026-10-29", nota: 10, curtiu: true, rever: true },
    ],
    listas: [],
  },
  {
    id: "gui", nome: "Gui", usuario: "gui.aranha", cor: "#d0246c", bio: "Cada um tem o seu Homem-Aranha. O meu é o Miles.",
    fav: ["miles-morales", "homem-aranha", "gwen-stacy", "venom"],
    notas: { "homem-aranha-no-aranhaverso-2018": 10, "homem-aranha-atraves-do-aranhaverso-2023": 10, "homem-aranha-2-2004": 10, "homem-aranha-2002": 9, "homem-aranha-3-2007": 6, "o-espetacular-homem-aranha-2012": 7, "o-espetacular-homem-aranha-2-2014": 6, "homem-aranha-de-volta-ao-lar-2017": 8, "homem-aranha-longe-de-casa-2019": 7, "homem-aranha-sem-volta-para-casa-2021": 10, "venom-2018": 6, "a-ultima-cacada-de-kraven": 9, "ultimate-homem-aranha-miles": 9 },
    pers: { "miles-morales@aranhaverso": 10, "homem-aranha@raimi": 9, "homem-aranha@webb": 8, "homem-aranha@mcu": 8, "doutor-octopus@raimi": 10, "duende-verde@raimi": 10, "gwen-stacy@aranhaverso": 9 },
    logs: [
      { obra: "homem-aranha-atraves-do-aranhaverso-2023", data: "2026-11-19", nota: 10, curtiu: true, rever: true, review: "Cada universo tem um traço diferente e mesmo assim tudo conversa. Quero a parte 3 pra ontem." },
      { obra: "homem-aranha-2-2004", data: "2026-11-11", nota: 10, review: "A cena do trem continua sendo uma das melhores cenas de herói já filmadas." },
      { obra: "a-ultima-cacada-de-kraven", data: "2026-11-02", nota: 9, review: "Pesada, sombria e linda. Não é a HQ pra começar, mas é a que fica na cabeça." },
    ],
    listas: [],
  },
  {
    id: "carol", nome: "Carol", usuario: "carol.kree", cor: "#d39f10", bio: "X-Men '97 me fez chorar.",
    fav: ["tempestade", "jean-grey", "capita-marvel", "wolverine"],
    notas: { "x-men-97": 10, "x-men-a-serie-animada": 9, "a-saga-da-fenix-negra": 10, "dias-de-um-futuro-esquecido-hq": 9, "x-men-2-2003": 8, "x-men-o-filme-2000": 7, "x-men-dias-de-um-futuro-esquecido-2014": 8, "logan-2017": 10, "capita-marvel-2019": 7, "deadpool-2016": 8, "o-velho-logan": 9 },
    pers: { "wolverine@fox-xmen": 10, "wolverine@xmen-tas": 10, "tempestade@xmen-tas": 10, "magneto@xmen-tas": 10, "magneto@fox-xmen": 9, "jean-grey@marvel-616": 10, "professor-x@fox-xmen": 9 },
    logs: [
      { obra: "x-men-97", escopo: { t: 1, e: 5 }, data: "2026-11-18", nota: 10, spoiler: true, review: "Não estava preparada. Vi duas vezes seguidas e chorei nas duas." },
      { obra: "logan-2017", data: "2026-11-10", nota: 10, curtiu: true, review: "Um faroeste com garras. A despedida que o personagem merecia." },
      { obra: "a-saga-da-fenix-negra", data: "2026-11-01", nota: 10, review: "Clássico é clássico. Entendi por que todo mundo tenta adaptar e quase ninguém acerta." },
    ],
    listas: [],
  },
  {
    id: "joao", nome: "João", usuario: "joao.casco", cor: "#2e8b3a", bio: "Infância: Tartarugas e Ben 10. Agora: Invencível.",
    fav: ["invencivel", "ben-10", "michelangelo", "omni-man"],
    notas: { "invencivel-serie": 10, "invencivel-hq": 10, "tartarugas-ninja-1987": 8, "caos-mutante-2023": 9, "ben-10-2005": 9, "ben-10-forca-alienigena": 8, "tmnt-1-1984": 8, "os-jovens-titas-2003": 9, "spawn-1992": 7, "hellboy-2004": 8 },
    pers: { "invencivel@invencivel-serie": 10, "omni-man@invencivel-serie": 10, "omni-man@invencivel-hq": 10, "ben-10@ben10": 9, "michelangelo@tmnt-2023": 9, "leonardo@tmnt-1987": 8 },
    logs: [
      { obra: "invencivel-serie", escopo: { t: 3 }, data: "2026-11-21", nota: 9, review: "Terceira temporada mais madura. O Mark finalmente parece um adulto." },
      { obra: "caos-mutante-2023", data: "2026-11-13", nota: 9, curtiu: true, review: "Finalmente tartarugas que parecem adolescentes. A animação parece caderno de desenho." },
      { obra: "ben-10-2005", data: "2026-11-05", nota: 9, rever: true, review: "Revi com meu sobrinho. Ele escolheu o Quatro Braços, eu fiquei com o Chama.", tags: ["nostalgia"] },
    ],
    listas: [],
  },
];
const AMIGO = new Map(AMIGOS.map((a) => [a.id, a]));
AMIGOS.forEach((a) => {
  a.logs.forEach((l, i) => { l.id = `${a.id}-${i}`; l.autor = a.id; l.base = 2 + (hash(l.id) % 37); });
  a.listas.forEach((l) => { l.autor = a.id; });
});

// ================= Seus registros de exemplo =================
// Aparecem só até você apagar os exemplos (Perfil > Ajustes). Nunca são salvos.
const EX = {
  obras: {
    "homem-aranha-no-aranhaverso-2018": { status: "terminei", nota: 10, curtiu: true },
    "cavaleiro-das-trevas-2008": { status: "terminei", nota: 10, curtiu: true },
    "batman-ano-um": { status: "terminei", nota: 9, eds: [0, 1, 2, 3] },
    "x-men-97": { status: "vendo", eps: { 1: [1, 2, 3, 4, 5] } },
    "invencivel-serie": { status: "vendo", eps: { 1: faixaNum(1, 8), 2: faixaNum(1, 8), 3: [1, 2, 3, 4, 5] } },
    "batman-a-serie-animada": { status: "vendo", eps: { 1: faixaNum(1, 12) } },
    "coringa-2019": { status: "terminei", nota: 7 },
    "caos-mutante-2023": { status: "terminei", nota: 8 },
    "vingadores-doutor-destino-2026": { status: "quero" },
    "a-saga-da-fenix-negra": { status: "quero" },
  },
  logs: [
    { id: "ex1", obra: "homem-aranha-no-aranhaverso-2018", data: "2026-11-20", nota: 10, curtiu: true, rever: true, review: "Revi pela terceira vez e continua parecendo uma HQ em movimento.", tags: ["revendo"] },
    { id: "ex2", obra: "invencivel-serie", escopo: { t: 3, e: 5 }, data: "2026-11-18", nota: 9, spoiler: true, review: "Esse final de episódio... precisei pausar e respirar." },
    { id: "ex3", obra: "batman-ano-um", data: "2026-11-15", nota: 9, review: "Curtinha e perfeita pra começar a ler Batman. O Gordon rouba a cena.", tags: ["hq-fisica"] },
    { id: "ex4", obra: "x-men-97", escopo: { t: 1, e: 5 }, data: "2026-11-12", nota: 10, spoiler: true, review: "Acabou comigo. Ainda estou digerindo." },
    { id: "ex5", obra: "cavaleiro-das-trevas-2008", data: "2026-11-08", nota: 10, curtiu: true, rever: true },
    { id: "ex6", obra: "coringa-2019", data: "2026-10-31", nota: 7, review: "Muito bem atuado, mas pesado demais pra ver de novo." },
    { id: "ex7", obra: "caos-mutante-2023", data: "2026-10-25", nota: 8, tags: ["dublado"] },
  ],
  persNotas: { "coringa@nolan": 10, "batman@nolan": 9, "miles-morales@aranhaverso": 10, "wolverine@xmen-tas": 9, "gordon@dc-hq": 9 },
  favoritos: { personagens: ["batman", "miles-morales", "wolverine", "invencivel"], obras: ["cavaleiro-das-trevas-2008", "homem-aranha-no-aranhaverso-2018", "x-men-97", "batman-ano-um"] },
  listas: [{ id: "ex-fds", titulo: "Pra maratonar no fim de semana", descricao: "Coisas curtas que dá pra ver em dois dias.", itens: ["os-jovens-titas-2003", "x-men-97", "pinguim-2024", "wandavision-2021", "gaviao-arqueiro-2021"] }],
};
EX.logs.forEach((l) => { l.exemplo = true; l.criado = 0; });
EX.listas.forEach((l) => { l.exemplo = true; });
