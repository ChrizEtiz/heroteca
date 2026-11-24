#!/usr/bin/env python3
"""Acrescenta as sagas de quadrinho do Comic Vine ao catálogo.

Ninguém lembra que leu "Uncanny X-Men #129". As pessoas lembram que leram
a Saga da Fênix Negra. Então a unidade aqui é a saga, não a edição.

   importar_sagas.py  catalogo-extra.json  sagas.json  catalogo-extra.json
"""
import json
import re
import sys
import unicodedata

EXTRA = sys.argv[1] if len(sys.argv) > 1 else "site/catalogo-extra.json"
SAGAS = sys.argv[2] if len(sys.argv) > 2 else "/home/claude/coleta/sagas.json"
BASE = sys.argv[3] if len(sys.argv) > 3 else "site/catalogo.json"
SAIDA = sys.argv[4] if len(sys.argv) > 4 else EXTRA

CV_ID, CV_NOME, CV_ANO, CV_EDITORA, CV_IMG = range(5)

BALDES = [
    ("marvel-sagas",     "Marvel · Sagas",      "Marvel",          "1961–hoje", "#e05561",
     "As grandes sagas das HQs da Marvel, de Guerras Secretas a Guerra Civil."),
    ("dc-sagas",         "DC · Sagas",          "DC",              "1938–hoje", "#4d8ae8",
     "As grandes sagas das HQs da DC, de Crise nas Infinitas Terras em diante."),
    ("image-sagas",      "Image · Sagas",       "Image",           "1992–hoje", "#2fb3aa",
     "As sagas das HQs da Image, incluindo Invencível, Spawn e Top Cow."),
    ("dark-horse-sagas", "Dark Horse · Sagas",  "Dark Horse",      "1986–hoje", "#8a7ad0",
     "As sagas das HQs da Dark Horse, de Hellboy a Sin City."),
    ("editoras-sagas",   "Outras editoras · Sagas", "Outras editoras", "1937–hoje", "#c09a4a",
     "Sagas de IDW, Valiant, BOOM!, Dynamite, 2000 AD e outras editoras."),
]
POR_EDITORA = {
    "Marvel": "marvel-sagas", "Marvel Knights": "marvel-sagas", "Icon": "marvel-sagas", "Max": "marvel-sagas",
    "DC Comics": "dc-sagas", "Vertigo": "dc-sagas", "Wildstorm": "dc-sagas", "Milestone": "dc-sagas",
    "Image": "image-sagas", "Skybound": "image-sagas", "Top Cow": "image-sagas",
    "Dark Horse Comics": "dark-horse-sagas",
}


def slug(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-zA-Z0-9]+", "-", s.lower()).strip("-")


def chave(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "", s)


def partir_nome(bruto):
    """O Comic Vine escreve 'Série' Nome da Saga. Separa os dois."""
    m = re.match(r'^\s*"([^"]{1,90})"\s*(.*)$', bruto or "")
    if m and m.group(2).strip():
        return m.group(2).strip(), m.group(1).strip()
    return (bruto or "").strip(), ""


def main():
    extra = json.load(open(EXTRA, encoding="utf-8"))
    base = json.load(open(BASE, encoding="utf-8"))
    sagas = json.load(open(SAGAS, encoding="utf-8"))

    universos = {x["id"]: x for x in base if x["tipo"] == "universo"}
    hqs_mao = {chave(o["titulo"]) for o in base if o.get("tipo") == "obra" and o.get("formato") == "hq"}
    hqs_mao |= {chave(o.get("original", "")) for o in base if o.get("tipo") == "obra" and o.get("formato") == "hq"}
    ids = {o["id"] for o in base + extra if o.get("tipo") == "obra"}

    novas, usados, repetidas = [], {}, 0
    vistos = set()
    for s in sagas:
        nome, serie = partir_nome(s[CV_NOME])
        if not nome:
            continue
        k = chave(nome + serie)
        if k in vistos:
            continue
        vistos.add(k)
        if chave(nome) in hqs_mao:        # já existe feita à mão, com elenco e edições
            repetidas += 1
            continue

        b = POR_EDITORA.get(s[CV_EDITORA], "editoras-sagas")
        usados[b] = usados.get(b, 0) + 1
        ano = s[CV_ANO] if isinstance(s[CV_ANO], int) and s[CV_ANO] > 1900 else 0

        oid = slug(nome) or f"saga-{s[CV_ID]}"
        if ano:
            oid = f"{oid}-{ano}"
        if oid in ids:
            oid = f"{oid}-{s[CV_ID]}"
        ids.add(oid)

        ob = {
            "tipo": "obra", "id": oid, "titulo": nome, "ano": ano,
            "formato": "hq", "universo": b,
            "cv": {"i": s[CV_ID], "p": s[CV_IMG]},
        }
        if serie and chave(serie) != chave(nome):
            ob["original"] = serie
        novas.append(ob)

    for i, nome, franquia, anos, cor, desc in BALDES:
        if usados.get(i):
            universos[i] = {"tipo": "universo", "id": i, "nome": nome, "franquia": franquia,
                            "midia": "HQ", "anos": anos, "cor": cor, "desc": desc}

    # os universos ficam no arquivo que abre com o site; as obras, no grande
    sem_uni = [x for x in base if x["tipo"] != "universo"]
    novo_base = list(universos.values()) + sem_uni
    with open(BASE, "w", encoding="utf-8") as f:
        f.write("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in novo_base) + "\n]\n")

    saida = extra + novas
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write("[\n" + ",\n".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in saida) + "\n]\n")

    import os
    print(f"sagas lidas: {len(sagas)} · acrescentadas: {len(novas)} · já existiam à mão: {repetidas}")
    for i, nome, *_ in BALDES:
        if usados.get(i):
            print(f"  {usados[i]:5d}  {nome}")
    print(f"{BASE}: {os.path.getsize(BASE)/1024:.0f} KB · {SAIDA}: {os.path.getsize(SAIDA)/1024:.0f} KB")


if __name__ == "__main__":
    main()
