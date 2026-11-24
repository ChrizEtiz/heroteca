#!/usr/bin/env python3
"""Junta o catálogo feito à mão com a colheita do TMDB.

   gerar_catalogo.py  ->  catalogo-base.json   (148 obras ricas, feitas à mão)
   importar_tmdb.py   ->  catalogo.json        (base + milhares de obras do TMDB)

As obras feitas à mão mandam: se uma obra do TMDB bate com uma delas, a do TMDB
some e a feita à mão só ganha o id e o caminho do pôster, para o site parar de
precisar procurar a capa uma por uma.
"""
import json
import re
import sys
import unicodedata

BASE = sys.argv[1] if len(sys.argv) > 1 else "catalogo-base.json"
COLHEITA = sys.argv[2] if len(sys.argv) > 2 else "/home/claude/coleta/filtrado.json"
SAIDA = sys.argv[3] if len(sys.argv) > 3 else "catalogo.json"
# O catálogo sai em dois arquivos: o essencial abre junto com o site, o resto
# só é buscado quando a pessoa vai explorar ou procurar alguma coisa.
SAIDA_EXTRA = SAIDA.replace(".json", "-extra.json")
HOJE = __import__("datetime").date.today().isoformat()

# campos da colheita
TIPO, TID, TITULO, ORIGINAL, DATA, POSTER, NOTA, VOTOS, POP, GENEROS, LINGUA, ORIGEM = range(12)
ANIMACAO = 16  # gênero "Animation" no TMDB


def slug(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-zA-Z0-9]+", "-", s.lower()).strip("-")


def chave(titulo, ano):
    """Chave frouxa para casar a mesma obra escrita de dois jeitos."""
    s = unicodedata.normalize("NFD", (titulo or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"\b(the|a|an|o|a|os|as|um|uma|el|la)\b", "", s)
    s = re.sub(r"[^a-z0-9]+", "", s)
    return (s, ano)


# ------------------------------------------------------------------ universos
# Baldes para onde vai o que veio do TMDB. Os 44 universos feitos à mão continuam
# existindo e continuam donos das obras deles.
BALDES = [
    # id,                nome,                                   franquia,          mídia,          anos,          cor
    ("marvel-mais",      "Marvel · Mais produções",              "Marvel",          "Cinema e TV",  "1944–hoje",   "#e05561"),
    ("dc-mais",          "DC · Mais produções",                  "DC",              "Cinema e TV",  "1941–hoje",   "#4d8ae8"),
    ("image-mais",       "Image · Mais produções",               "Image",           "Cinema e TV",  "1992–hoje",   "#2fb3aa"),
    ("dark-horse-mais",  "Dark Horse · Mais produções",          "Dark Horse",      "Cinema e TV",  "1990–hoje",   "#8a7ad0"),
    ("tmnt-mais",        "Tartarugas Ninja · Mais produções",    "TMNT",            "Cinema e TV",  "1987–hoje",   "#4fb95c"),
    ("ben10",            "Ben 10",                               "Cartoon Network", "Animação",     "2005–hoje",   "#49a83a"),
    ("sentai",           "Super Sentai e Power Rangers",         "Tokusatsu",       "TV e cinema",  "1975–hoje",   "#e8673a"),
    ("kamen-rider",      "Kamen Rider",                          "Tokusatsu",       "TV e cinema",  "1971–hoje",   "#d04a6a"),
    ("ultraman",         "Ultraman",                             "Tokusatsu",       "TV e cinema",  "1966–hoje",   "#4ab9d8"),
    ("metal-heroes",     "Heróis de Metal",                      "Tokusatsu",       "TV e cinema",  "1982–1999",   "#b9b3c2"),
    ("toku-mais",        "Tokusatsu · Mais produções",           "Tokusatsu",       "TV e cinema",  "1954–hoje",   "#d89a3a"),
    ("editoras-mais",    "Outras editoras",                      "Outras editoras", "Cinema e TV",  "1936–hoje",   "#c09a4a"),
    ("herois-mais",      "Outros heróis",                        "Outros",          "Cinema e TV",  "1920–hoje",   "#7f8aa8"),
]
DESC = {
    "marvel-mais": "Produções da Marvel que ainda não entraram num universo próprio aqui dentro.",
    "dc-mais": "Produções da DC que ainda não entraram num universo próprio aqui dentro.",
    "image-mais": "Filmes e séries tirados das HQs da Image.",
    "dark-horse-mais": "Filmes e séries tirados das HQs da Dark Horse.",
    "tmnt-mais": "Tudo das Tartarugas Ninja fora dos universos já separados.",
    "ben10": "O Ben 10 e as continuações, do Cartoon Network.",
    "sentai": "Os times coloridos japoneses e a versão americana deles, o Power Rangers.",
    "kamen-rider": "A linhagem dos Kamen Riders, de 1971 até hoje.",
    "ultraman": "O gigante de prata da Tsuburaya e toda a família Ultra.",
    "metal-heroes": "Jaspion, Jiraiya, Sharivan, Winspector e os outros heróis de armadura que passaram na Manchete.",
    "toku-mais": "Heróis japoneses de carne e osso fora das linhagens já separadas.",
    "editoras-mais": "Heróis de editoras como Dynamite, Valiant, BOOM!, IDW e outras.",
    "herois-mais": "Heróis que não vieram de nenhuma das editoras acima, ou que nasceram direto na tela.",
}

# ------------------------------------------------------- de onde veio -> balde
POR_ORIGEM = [
    ("marvel", "marvel-mais"), ("kw-mcu", "marvel-mais"),
    ("dc", "dc-mais"), ("wb-animacao", "dc-mais"),
    ("image", "image-mais"),
    ("dark-horse", "dark-horse-mais"),
    ("tmnt", "tmnt-mais"),
    ("ben10", "ben10"),
    ("rangers", "sentai"),
    ("kamen-rider", "kamen-rider"),
    ("ultraman", "ultraman"),
    ("toku-br", "metal-heroes"),
    ("dynamite-millar", "editoras-mais"), ("outras-editoras", "editoras-mais"),
    ("kw-toku", "toku-mais"),
]

# O título manda mais que a origem: "Batman" é DC mesmo que tenha vindo por palavra-chave.
POR_TITULO = [
    (r"\b(spider[- ]?man|spiderman|homem[- ]aranha|avengers|vingadores|x[- ]?men|wolverine|deadpool|iron man|homem de ferro|captain america|capit(ã|a)o am(é|e)rica|thor|hulk|black panther|pantera negra|doctor strange|doutor estranho|ant[- ]man|homem[- ]formiga|guardians of the galaxy|guardi(õ|o)es da gal(á|a)xia|fantastic four|quarteto fant(á|a)stico|daredevil|demolidor|punisher|justiceiro|venom|morbius|blade|ghost rider|motoqueiro fantasma|loki|hawkeye|gavi(ã|a)o arqueiro|black widow|viúva negra|moon knight|cavaleiro da lua|she[- ]hulk|mulher[- ]hulk|eternals|eternos|shang[- ]chi|marvel)\b", "marvel-mais"),
    (r"\b(batman|superman|super[- ]homem|wonder woman|mulher[- ]maravilha|justice league|liga da justi(ç|c)a|aquaman|flash|green lantern|lanterna verde|teen titans|jovens tit(ã|a)s|harley quinn|joker|coringa|suicide squad|esquadr(ã|a)o suicida|supergirl|batgirl|robin|nightwing|asa noturna|catwoman|mulher[- ]gato|shazam|black adam|ad(ã|a)o negro|constantine|swamp thing|monstro do p(â|a)ntano|watchmen|static shock|super choque|krypto|legion of super|doom patrol|peacemaker|blue beetle|besouro azul|gotham|smallville|arrow|arqueiro verde|titans|\bdc\b)\b", "dc-mais"),
    (r"\b(teenage mutant ninja turtles|ninja turtles|tartarugas ninja|tmnt)\b", "tmnt-mais"),
    (r"\bben 10\b", "ben10"),
    (r"\b(power rangers|sentai)\b", "sentai"),
    (r"\bkamen rider\b", "kamen-rider"),
    (r"\bultraman\b", "ultraman"),
    (r"\b(jaspion|jiraiya|sharivan|gavan|shaider|winspector|solbrain|exceedraft|metalder|spielvan|juspion|kabutack)\b", "metal-heroes"),
    (r"\b(invincible|invenc(í|i)vel|spawn|savage dragon|witchblade)\b", "image-mais"),
    (r"\b(hellboy|the mask|sin city|barb wire|timecop|mystery men)\b", "dark-horse-mais"),
    (r"\b(the boys|kick[- ]ass|wanted|kingsman|judge dredd|juiz dredd|men in black|mib|vampirella|red sonja|the tick|darkman|the phantom|fantasma|rocketeer|the shadow|sombra|zorro|hellblazer)\b", "editoras-mais"),
]


# Coisas que entraram de carona pela produtora e não têm nada a ver com herói.
FORA_DE_PROPOSITO = re.compile(
    r"\b(star wars|jornada nas estrelas|star trek|transformers: (dark|revenge|age|the last)"
    r"|my little pony|hora de aventura|adventure time|hello kitty|barbie)\b", re.I)


def balde_de(linha):
    titulo = f"{linha[TITULO] or ''} {linha[ORIGINAL] or ''}".lower()
    for padrao, b in POR_TITULO:
        if re.search(padrao, titulo):
            return b
    origens = set((linha[ORIGEM] or "").split())
    for o, b in POR_ORIGEM:
        if o in origens:
            return b
    return "herois-mais"


def formato_de(linha):
    desenho = ANIMACAO in (linha[GENEROS] or [])
    if linha[TIPO] == "movie":
        return "animacao" if desenho else "filme"
    return "desenho" if desenho else "serie"


def main():
    base = json.load(open(BASE, encoding="utf-8"))
    colheita = json.load(open(COLHEITA, encoding="utf-8"))

    universos = {x["id"]: x for x in base if x["tipo"] == "universo"}
    obras = [x for x in base if x["tipo"] == "obra"]
    resto = [x for x in base if x["tipo"] not in ("universo", "obra")]

    # ---- 1. casar a colheita com as obras feitas à mão
    mao = {}
    for o in obras:
        for t in (o.get("original"), o.get("titulo")):
            if t:
                mao.setdefault(chave(t, o["ano"]), o)

    casadas, novas = 0, []
    for linha in colheita:
        ano = int(linha[DATA][:4]) if linha[DATA] and linha[DATA][:4].isdigit() else None
        achou = None
        for t in (linha[ORIGINAL], linha[TITULO]):
            if not t or ano is None:
                continue
            for a in (ano, ano - 1, ano + 1):
                achou = mao.get(chave(t, a))
                if achou:
                    break
            if achou:
                break
        if achou is not None:
            # a feita à mão fica, e ganha id, pôster e a fama que o TMDB mede
            achou.setdefault("tmdb", {})
            achou["tmdb"]["i"] = linha[TID]
            if linha[POSTER]:
                achou["tmdb"]["p"] = linha[POSTER]
            if linha[VOTOS]:
                achou["votos"] = linha[VOTOS]
            if linha[VOTOS] and linha[VOTOS] >= 20 and linha[NOTA]:
                achou["notaTmdb"] = round(float(linha[NOTA]), 1)
            casadas += 1
        else:
            novas.append((linha, ano))

    # ---- 2. criar os universos-balde que forem usados
    usados = {}
    ids = {o["id"] for o in obras}
    acrescentadas = []
    fora = 0
    for linha, ano in novas:
        titulo_bruto = f"{linha[TITULO] or ''} {linha[ORIGINAL] or ''}"
        if FORA_DE_PROPOSITO.search(titulo_bruto):
            fora += 1
            continue
        b = balde_de(linha)
        usados[b] = usados.get(b, 0) + 1

        titulo = linha[TITULO] or linha[ORIGINAL] or ""
        base_id = slug(titulo) or f"tmdb-{linha[TID]}"
        oid = f"{base_id}-{ano}" if ano else base_id
        if oid in ids:
            oid = f"{oid}-{linha[TID]}"
        ids.add(oid)

        ob = {
            "tipo": "obra", "id": oid, "titulo": titulo,
            "ano": ano or 0,
            "formato": formato_de(linha),
            "universo": b,
            "tmdb": {"t": linha[TIPO], "i": linha[TID]},
        }
        # o título original só entra quando é mesmo diferente do traduzido
        orig = linha[ORIGINAL] or ""
        if orig and chave(orig, 0) != chave(titulo, 0):
            ob["original"] = orig
        if linha[POSTER]:
            ob["tmdb"]["p"] = linha[POSTER]
        # a data só importa para o que ainda vai estrear
        if linha[DATA] and linha[DATA] > HOJE:
            ob["data"] = linha[DATA]
            ob["status"] = "em-breve"
        if linha[VOTOS] and linha[VOTOS] >= 20 and linha[NOTA]:
            ob["notaTmdb"] = round(float(linha[NOTA]), 1)
        if linha[VOTOS]:
            ob["votos"] = linha[VOTOS]
        acrescentadas.append(ob)

    for i, nome, franquia, midia, anos, cor in BALDES:
        if usados.get(i):
            universos[i] = {"tipo": "universo", "id": i, "nome": nome, "franquia": franquia,
                            "midia": midia, "anos": anos, "cor": cor, "desc": DESC[i]}

    # a franquia da obra sai do arquivo: o site a tira do universo
    for o in obras + acrescentadas:
        o.pop("franquia", None)

    def grava(caminho, regs):
        with open(caminho, "w", encoding="utf-8") as f:
            f.write("[\n")
            f.write(",\n".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in regs))
            f.write("\n]\n")
        return __import__("os").path.getsize(caminho)

    essencial = list(universos.values()) + obras + resto
    t1 = grava(SAIDA, essencial)
    t2 = grava(SAIDA_EXTRA, acrescentadas)

    print(f"à mão: {len(obras)} obras · casadas com o TMDB: {casadas} · acrescentadas: {len(acrescentadas)} · fora de propósito: {fora}")
    print(f"universos: {len(universos)} · registros: {len(essencial) + len(acrescentadas)}")
    print(f"{SAIDA}: {t1/1024:.0f} KB (abre junto com o site)")
    print(f"{SAIDA_EXTRA}: {t2/1024:.0f} KB (só quando precisar)")
    print("\nnos baldes:")
    for i, nome, *_ in BALDES:
        if usados.get(i):
            print(f"  {usados[i]:5d}  {nome}")


if __name__ == "__main__":
    main()
