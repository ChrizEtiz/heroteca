"use strict";
// ================= Configurações: mude à vontade =================
const NOME_DO_SITE = "Heroteca";            // nome provisório
const NOME_DO_JOGO = "Jogo do dia";
const ENDERECO_DO_SITE = "";                // quando tiver domínio, ex.: "https://heroteca.com.br"
// Supabase: a chave "anon" é pública por natureza (o que protege os dados são as regras do banco).
const SUPABASE_URL = "https://sdjuzthrlelhrevgaihz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkanV6dGhybGVsaHJldmdhaWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0ODc0NzIsImV4cCI6MjExMTA2MzQ3Mn0.aJZitwT6za_ffoRfncICGZC7xiK2haJpAut7i7hUVB0";
const FUSO = "America/Sao_Paulo";
const DATA_DE_LANCAMENTO = "2026-11-22";    // dia nº 1 do jogo
const SEMENTE = 20261122;                   // mesma semente do jogo avulso: o personagem do dia é o mesmo
const DIAS_ESPECIAIS = { "2026-12-17": "Doutor Destino" };
const CHAVE_LOCAL = "heroteca-v1";

// ================= Utilidades =================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
const normalizar = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => normalizar(s).replace(/ /g, "-");
const plural = (n, um, varios) => `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;
const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
const faixaNum = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const idNovo = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function hash(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const corValida = (c, padrao = "#555555") => (/^#[0-9a-f]{6}$/i.test(String(c)) ? c : padrao);
function corTexto(hex) {
  const c = corValida(hex).slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.42 ? "#17151c" : "#ffffff";
}
function iniciais(nome) {
  const limpo = String(nome).replace(/\(.*?\)/g, "").replace(/[.']/g, " ").trim();
  const palavras = limpo.split(/[\s-]+/).filter((w) => w && !["de", "da", "do", "das", "dos", "e"].includes(w.toLowerCase()));
  const t = palavras.length >= 2 ? palavras[0][0] + palavras[1][0] : (palavras[0] || "?").slice(0, 2);
  return t.toUpperCase();
}

// ================= Datas (horário de Brasília) =================
function hojeEmSP(agora = new Date()) {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(agora);
  const pega = (t) => partes.find((p) => p.type === t).value;
  return `${pega("year")}-${pega("month")}-${pega("day")}`;
}
function diaUTC(chave) {
  const [a, m, d] = String(chave).split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}
const diasEntre = (a, b) => Math.round((diaUTC(b) - diaUTC(a)) / 86400000);
const dataValida = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !Number.isNaN(diaUTC(s));
function segundosAteMeiaNoite(agora = new Date()) {
  const partes = new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(agora);
  const pega = (t) => Number(partes.find((p) => p.type === t).value);
  return 86400 - (pega("hour") * 3600 + pega("minute") * 60 + pega("second"));
}
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_C = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function dataLonga(chave) { const [a, m, d] = chave.split("-").map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; }
function dataCurta(chave) { const [a, m, d] = chave.split("-"); return `${d}/${m}/${a}`; }
function haQuanto(chave) {
  const n = diasEntre(chave, HOJE);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  if (n < 7) return `há ${n} dias`;
  if (n < 30) { const s = Math.round(n / 7); return s === 1 ? "há 1 semana" : `há ${s} semanas`; }
  const [a, m, d] = chave.split("-").map(Number);
  return `${d} ${MESES_C[m - 1]} ${a}`;
}
let HOJE = hojeEmSP();

// ================= Notas (guardadas de 1 a 10 = meia estrela a 5) =================
const notaTxt = (n) => (n / 2).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
function estrelasTxt(n) {
  if (!n) return "";
  return "★".repeat(Math.floor(n / 2)) + (n % 2 ? "½" : "");
}
const estrelas = (n) => (n ? `<span class="est" role="img" aria-label="${notaTxt(n)} de 5 estrelas">${estrelasTxt(n)}</span>` : "");
function mediaTxt(m) { return m ? (m / 2).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "–"; }

// ================= Ícones (traço) =================
const ICONES = {
  casa: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  busca: "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4.2-4.2",
  jogo: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM15 15.5a1.9 1.9 0 1 1 2.6 1.8c-.6.3-.6.7-.6 1.2M17 20.6v.1",
  diario: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11",
  perfil: "M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  lista: "M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01",
  coracao: "M12 20.5l-1.4-1.2C5.6 14.8 2.5 12 2.5 8.4 2.5 5.6 4.7 3.5 7.4 3.5c1.7 0 3.4.8 4.6 2.1 1.2-1.3 2.9-2.1 4.6-2.1 2.7 0 4.9 2.1 4.9 4.9 0 3.6-3.1 6.4-8.1 10.9z",
  olho: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z",
  check: "M4 12.5l5 5L20 6.5",
  mais: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  rever: "M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3",
  partilhar: "M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M12 3v12M7 8l5-5 5 5",
  bandeira: "M5 21V4M5 4h11l-2 4 2 4H5",
  balao: "M4 5h16v11H10l-5 4v-4H4z",
  marcador: "M6 3h12v18l-6-4-6 4z",
  play: "M8 5l11 7-11 7z",
  pare: "M6 6l12 12M18 6L6 18",
  trofeu: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M10 17h4",
  dir: "M9 5l7 7-7 7",
  esq: "M15 5l-7 7 7 7",
  cima: "M5 15l7-7 7 7",
  baixo: "M5 9l7 7 7-7",
  lapis: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  lixo: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  globo: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  baixar: "M12 3v12M7 10l5 5 5-5M4 20h16",
  copiar: "M8 8h12v12H8zM4 16V4h12",
  info: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 11v6M12 7.5h.01",
  fogo: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1.5 1 2.5 2.5 3 4 .5-2 0-5 0-7z",
  estrela: "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z",
  spoiler: "M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.3 3.9M6.6 6.6C3.9 8.4 2 12 2 12s3.6 6 10 6c1.6 0 3-.3 4.3-.9M9.9 9.9a3 3 0 0 0 4.2 4.2",
  upload: "M12 21V9M7 14l5-5 5 5M4 4h16",
  troca: "M7 7h11l-3-3M17 17H6l3 3",
};
const ic = (nome, extra = "") => `<svg class="ic ${extra}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONES[nome]}"/></svg>`;
const SVG_ESTRELA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="eo" d="${ICONES.estrela}"/><path class="ef" d="${ICONES.estrela}"/></svg>`;

// ================= Textos fixos =================
const FORMATO = {
  filme: { nome: "Filme", plural: "Filmes", curto: "FILME" },
  serie: { nome: "Série", plural: "Séries", curto: "SÉRIE" },
  desenho: { nome: "Desenho", plural: "Desenhos", curto: "DESENHO" },
  animacao: { nome: "Filme animado", plural: "Filmes animados", curto: "ANIMAÇÃO" },
  hq: { nome: "HQ", plural: "HQs", curto: "HQ" },
};
const PAPEL = { protagonista: "Protagonista", antagonista: "Antagonista", coadjuvante: "Coadjuvante", participacao: "Participação" };
const ORDEM_PAPEL = { protagonista: 0, antagonista: 1, coadjuvante: 2, participacao: 3 };
const COR_FRANQ = { Marvel: "#c8364f", DC: "#3a6fe0", Image: "#15968f", "Dark Horse": "#6b5fa8", TMNT: "#3f9a4a", "Cartoon Network": "#49a83a" , Tokusatsu: "#e8673a", "Outras editoras": "#c09a4a", Outros: "#7f8aa8" };
const CAPA_CV = "https://comicvine.gamespot.com/a/uploads/scale_large/";
const FRANQ_CURTA = { Marvel: "MARVEL", DC: "DC", Image: "IMAGE", TMNT: "TMNT", "Cartoon Network": "CN", "Dark Horse": "DARK HORSE", Tokusatsu: "TOKU", "Outras editoras": "INDIE", Outros: "HERÓI" };
const STATUS = ["quero", "vendo", "terminei", "abandonei"];
const ICONE_STATUS = { quero: "marcador", vendo: "play", terminei: "check", abandonei: "pare" };
function nomeStatus(s, o) {
  const hq = o && o.formato === "hq";
  return { quero: hq ? "Quero ler" : "Quero ver", vendo: hq ? "Lendo" : "Vendo", terminei: "Terminei", abandonei: "Abandonei" }[s] || "";
}
