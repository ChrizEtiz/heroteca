#!/usr/bin/env python3
"""Junta pagina.html + estilo.css + js/*.js em heroteca/index.html."""
import pathlib, sys
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
html = (src / "pagina.html").read_text(encoding="utf-8")
css = (src / "estilo.css").read_text(encoding="utf-8")
js = "\n".join(p.read_text(encoding="utf-8") for p in sorted((src / "js").glob("*.js")))
assert "</script" not in js.lower() and "</style" not in css.lower()
html = html.replace("/*CSS*/", css, 1).replace("/*JS*/", js, 1)
out.write_text(html, encoding="utf-8")
print(f"{out}: {len(html):,} bytes, {html.count(chr(10)):,} linhas")
