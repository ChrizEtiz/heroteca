// Ponte entre a Heroteca e o TMDB: a chave fica guardada no Supabase e nunca vai para o navegador.
// GET ?acao=busca&tipo=movie|tv&q=Titulo&y=2008&lang=pt-BR  -> { id, p, b }
// GET ?acao=onde&tipo=movie|tv&id=123&pais=BR               -> { streaming: [], aluguel: [], compra: [] }
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CHAVE = Deno.env.get("TMDB_TOKEN") ?? "";
const LINGUAS = new Set(["pt-BR", "en-US"]);
const PAISES = new Set(["BR", "US", "PT", "GB", "CA", "MX", "AR"]);

function cors(origem: string | null): Record<string, string> {
  const ok = !origem || /^https:\/\/([a-z0-9-]+--)?heroteca\.netlify\.app$/.test(origem) || /^http:\/\/localhost(:\d+)?$/.test(origem);
  return {
    "Access-Control-Allow-Origin": ok && origem ? origem : "https://heroteca.netlify.app",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  };
}
function resposta(corpo: unknown, status: number, h: Record<string, string>, cache = 0) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...h, "Content-Type": "application/json", "Cache-Control": cache ? `public, max-age=${cache}` : "no-store" },
  });
}
async function tmdb(caminho: string, params: Record<string, string>) {
  const u = new URL("https://api.themoviedb.org/3" + caminho);
  const v4 = CHAVE.length > 40;
  if (!v4) u.searchParams.set("api_key", CHAVE);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: v4 ? { Authorization: `Bearer ${CHAVE}`, accept: "application/json" } : { accept: "application/json" } });
  if (!r.ok) throw new Error(`tmdb ${r.status}`);
  return await r.json();
}
const caminhoImg = (s: unknown) => (typeof s === "string" && /^\/[\w.-]+$/.test(s) ? s : "");

Deno.serve(async (req: Request) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "GET") return resposta({ erro: "metodo" }, 405, h);
  if (!CHAVE) return resposta({ erro: "sem-chave" }, 503, h);
  const p = new URL(req.url).searchParams;
  const tipo = p.get("tipo") === "tv" ? "tv" : "movie";
  try {
    if (p.get("acao") === "busca") {
      const q = (p.get("q") ?? "").trim().slice(0, 120);
      const y = /^\d{4}$/.test(p.get("y") ?? "") ? p.get("y")! : "";
      const lang = LINGUAS.has(p.get("lang") ?? "") ? p.get("lang")! : "pt-BR";
      if (!q) return resposta({ erro: "q" }, 400, h);
      const base = { query: q, language: lang, include_adult: "false" };
      let j = await tmdb(`/search/${tipo}`, y ? { ...base, [tipo === "movie" ? "year" : "first_air_date_year"]: y } : base);
      if (!j.results?.length && y) j = await tmdb(`/search/${tipo}`, base);
      const r = j.results?.[0];
      return resposta(r ? { id: Number(r.id), p: caminhoImg(r.poster_path), b: caminhoImg(r.backdrop_path) } : null, 200, h, 86400);
    }
    if (p.get("acao") === "onde") {
      const id = /^\d{1,9}$/.test(p.get("id") ?? "") ? p.get("id")! : "";
      const pais = PAISES.has(p.get("pais") ?? "") ? p.get("pais")! : "BR";
      if (!id) return resposta({ erro: "id" }, 400, h);
      const j = await tmdb(`/${tipo}/${id}/watch/providers`, {});
      const r = j.results?.[pais] ?? {};
      const nomes = (l: unknown) => (Array.isArray(l) ? l.map((x) => String(x?.provider_name ?? "")).filter(Boolean).slice(0, 12) : []);
      return resposta({ streaming: nomes(r.flatrate), aluguel: nomes(r.rent), compra: nomes(r.buy) }, 200, h, 43200);
    }
    return resposta({ erro: "acao" }, 400, h);
  } catch (_e) {
    return resposta({ erro: "tmdb" }, 502, h);
  }
});
