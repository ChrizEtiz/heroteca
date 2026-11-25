// ================= Dicas que aparecem ao passar o mouse =================
// A ideia é da Steam: dar a informação na hora, sem obrigar a abrir a página e
// voltar. Dois tamanhos: a dica curta (um selo, um título cortado) e o cartão,
// que mostra o resumo da obra enquanto a pessoa passa os olhos pelo mural.

let DICA = null;
let DICA_T = null;

function caixaDica() {
  if (!DICA) {
    DICA = document.createElement("div");
    DICA.className = "dica";
    DICA.setAttribute("role", "tooltip");
    DICA.hidden = true;
    document.body.appendChild(DICA);
  }
  return DICA;
}

function posicionarDica(alvo) {
  const d = caixaDica();
  const a = alvo.getBoundingClientRect();
  const c = d.getBoundingClientRect();
  const margem = 10;
  let x = a.left + a.width / 2 - c.width / 2;
  x = Math.max(margem, Math.min(window.innerWidth - c.width - margem, x));
  // acima do alvo, a não ser que não caiba
  let y = a.top - c.height - 9;
  d.classList.toggle("dica--baixo", y < 64);
  if (y < 64) y = a.bottom + 9;
  d.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

function mostrarDica(alvo, html) {
  const d = caixaDica();
  d.innerHTML = html;
  d.hidden = false;
  posicionarDica(alvo);
}
function esconderDica() {
  clearTimeout(DICA_T);
  if (DICA) DICA.hidden = true;
}

// O cartão da obra: o que a pessoa precisa para decidir sem sair do mural.
function cartaoDica(o) {
  const e = estObra(o.id) || {};
  const med = mediaObra(o.id);
  const u = C.U.get(o.universo);
  const linhas = [];
  linhas.push(`<span class="dica-t">${esc(o.titulo)}</span>`);
  linhas.push(`<span class="dica-m">${o.ano || "—"} · ${esc(FORMATO[o.formato].nome)} · ${esc(u.nome)}</span>`);
  if (o.original && o.original !== o.titulo) linhas.push(`<span class="dica-m">${esc(o.original)}</span>`);
  if (e.status) linhas.push(`<span class="dica-st st-${esc(e.status)}">${esc(nomeStatus(e.status, o))}</span>`);
  if (e.nota) linhas.push(`<span class="dica-m">Sua nota: ${estrelas(e.nota)}</span>`);
  if (med.n) linhas.push(`<span class="dica-m">Média ${mediaTxt(med.m)} · ${plural(med.n, "nota", "notas")}</span>`);
  else if (o.notaTmdb) linhas.push(`<span class="dica-m">TMDB ${o.notaTmdb.toFixed(1)}${o.votos ? ` · ${o.votos.toLocaleString("pt-BR")} votos` : ""}</span>`);
  if (!e.status && !e.nota) linhas.push(`<span class="dica-m mudo">Você ainda não marcou esta.</span>`);
  return linhas.join("");
}

function ligarDicas() {
  const achar = (el) => el && el.closest("[data-dica], [data-dica-obra]");
  document.addEventListener("mouseover", (ev) => {
    const alvo = achar(ev.target);
    if (!alvo || alvo === DICA) return;
    clearTimeout(DICA_T);
    DICA_T = setTimeout(() => {
      const o = alvo.dataset.dicaObra ? C.O.get(alvo.dataset.dicaObra) : null;
      const html = o ? cartaoDica(o) : `<span class="dica-t">${esc(alvo.dataset.dica)}</span>`;
      if (html) { caixaDica().classList.toggle("dica--cartao", !!o); mostrarDica(alvo, html); }
    }, o_atraso(alvo));
  });
  document.addEventListener("mouseout", (ev) => { if (achar(ev.target)) esconderDica(); });
  document.addEventListener("focusin", (ev) => {
    const alvo = achar(ev.target);
    if (alvo && alvo.dataset.dica) mostrarDica(alvo, `<span class="dica-t">${esc(alvo.dataset.dica)}</span>`);
  });
  document.addEventListener("focusout", esconderDica);
  window.addEventListener("scroll", esconderDica, { passive: true });
  window.addEventListener("hashchange", esconderDica);
}
// O cartão demora um pouco mais para não piscar enquanto a pessoa passa o mouse.
const o_atraso = (el) => (el.dataset.dicaObra ? 420 : 240);
