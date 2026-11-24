#!/usr/bin/env python3
"""Roda o site num navegador sem tela: visita todas as rotas, clica nas ações principais e junta erros."""
import json, subprocess, sys, time
from playwright.sync_api import sync_playwright

PASTA = "/home/claude/heroteca"
PORTA = 8765
SAIDA = sys.argv[1] if len(sys.argv) > 1 else "/tmp/shots"
FOTOS = "--fotos" in sys.argv

srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORTA), "-d", PASTA], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
erros = []
try:
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, locale="pt-BR", timezone_id="America/Sao_Paulo")
        ctx.route("**/fonts.googleapis.com/**", lambda r: r.abort())
        ctx.route("**/fonts.gstatic.com/**", lambda r: r.abort())
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: erros.append(f"pageerror: {e}"))
        pg.on("console", lambda m: erros.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        base = f"http://localhost:{PORTA}/index.html"
        pg.goto(base)
        try:
            pg.wait_for_selector(".splash", timeout=8000)
        except Exception:
            print("ERROS:", erros[:10]); print(pg.inner_text("body")[:400]); raise

        def ir(h, sel=None):
            pg.evaluate(f"location.hash = '{h}'")
            pg.wait_for_timeout(250)
            if sel:
                pg.wait_for_selector(sel, timeout=4000)
            txt = pg.inner_text("#conteudo").lower()
            if "sumiu no multiverso" in txt:
                erros.append(f"rota {h}: caiu em 'não achei'")

        rotas = ["inicio", "explorar", "personagens", "universos", "ranking", "jogo", "diario", "listas", "perfil", "sobre",
                 "obra-x-men-97", "obra-batman-ano-um", "obra-tartarugas-ninja-1987", "obra-vingadores-doutor-destino-2026",
                 "obra-mulher-maravilha-1975", "obra-invencivel-hq", "obra-a-ultima-cacada-de-kraven", "obra-smallville",
                 "personagem-batman", "personagem-hellboy", "personagem-doutor-destino", "universo-mcu", "universo-dcau",
                 "pessoa-j-k-simmons", "pessoa-guilherme-briggs", "lista-antes-doutor-destino", "lista-ex-fds", "lista-pedro-destino",
                 "usuario-lari", "obra-nao-existe"]
        for r in rotas:
            pg.evaluate(f"location.hash = '{r}'")
            pg.wait_for_timeout(200)
        if "sumiu no multiverso" not in pg.inner_text("#conteudo").lower():
            erros.append("rota inexistente não mostrou a página de erro")

        # status, nota, curtir, episódios
        ir("obra-x-men-97", ".st-bt")
        pg.click('.st-bt[data-s="terminei"]')
        pg.click('.aval-b[data-acao="nota-obra"][data-n="9"]')
        pg.click('.coracao[data-acao="curtir"]')
        pg.click('.ep[data-t="1"][data-e="7"]')
        est = pg.evaluate("JSON.parse(localStorage.getItem('heroteca-v1')).obras['x-men-97']")
        if not (est.get("nota") == 9 and est.get("curtiu") and 7 in est["eps"]["1"]):
            erros.append(f"estado da obra errado: {est}")
        # nota de personagem (liberada porque começou a ver)
        pg.click('.vnota .aval-b[data-n="8"] >> nth=0')
        # registrar um episódio pelo modal
        pg.click('button[data-acao="log-abrir"] >> nth=0')
        pg.wait_for_selector("#f-data")
        pg.select_option("#f-temp", "1")
        pg.select_option("#f-ep", "9")
        pg.click('#f-aval .aval-b[data-n="10"]')
        pg.fill("#f-review", "Teste <b>sem html</b> & aspas \"ok\"")
        pg.fill("#f-tag", "maratona de teste")
        pg.keyboard.press("Enter")
        pg.click('[data-acao="f-salvar"]')
        pg.wait_for_timeout(300)
        logs = pg.evaluate("JSON.parse(localStorage.getItem('heroteca-v1')).logs")
        if not logs or logs[-1].get("escopo") != {"t": 1, "e": 9} or "maratona-de-teste" not in logs[-1].get("tags", []):
            erros.append(f"registro errado: {logs[-1] if logs else None}")
        if "<b>sem html</b>" in pg.inner_html("#conteudo"):
            erros.append("resenha não foi escapada")

        # HQ: edições
        ir("obra-batman-ano-um", ".ed-l")
        pg.click('.ed-l[data-i="1"]')
        # contador de episódios
        ir("obra-tartarugas-ninja-1987", ".contador")
        pg.click('[data-acao="eps-n"][data-d="10"]')
        # obra em breve: só "quero ver"
        ir("obra-vingadores-doutor-destino-2026", ".st-bt")
        if not pg.is_disabled('.st-bt[data-s="terminei"]'):
            erros.append("obra em breve deixou marcar terminei")

        # busca rápida + registrar filme inteiro
        pg.click('.topo-acoes [data-acao="registrar"]:visible')
        pg.wait_for_selector("#qb")
        pg.fill("#qb", "logan")
        pg.wait_for_selector('#qb-res [data-obra="logan-2017"]')
        pg.click('#qb-res [data-obra="logan-2017"]')
        pg.wait_for_selector("#f-data")
        pg.click('[data-acao="f-salvar"]')
        pg.wait_for_timeout(300)
        if pg.evaluate("JSON.parse(localStorage.getItem('heroteca-v1')).obras['logan-2017'].status") != "terminei":
            erros.append("registrar o filme não marcou terminei")

        # listas: criar, adicionar e mover
        ir("listas", ".lgrade")
        pg.click('button[data-acao="lista-nova"] >> nth=0')
        pg.fill("#lista-titulo", "Teste de lista")
        pg.click('button[form="form-lista"]')
        pg.wait_for_selector('[data-acao="lista-buscar"]')
        pg.click('[data-acao="lista-buscar"]')
        pg.fill("#qb", "batman")
        pg.wait_for_selector("#qb-res [data-acao=qb-obra]")
        pg.click("#qb-res [data-acao=qb-obra] >> nth=0")
        pg.click("#qb-res [data-acao=qb-obra]:not([disabled]) >> nth=0")
        pg.click('[data-acao="modal-fechar"]')
        pg.wait_for_selector(".litem")
        pg.click('[data-acao="lista-mover"][data-d="1"] >> nth=0')
        if pg.locator(".litem").count() != 2:
            erros.append(f"lista com {pg.locator('.litem').count()} itens (esperava 2)")
        # pôr numa lista pela obra
        ir("obra-logan-2017", ".st-bt")
        pg.click('[data-acao="lista-add"]')
        pg.fill("#nl-titulo", "Outra lista")
        pg.click('form[data-form="lista-rapida"] button[type=submit]')
        pg.wait_for_timeout(200)
        pg.click('[data-acao="modal-fechar"]')

        # personagem: favoritar, versões, cartão
        ir("personagem-wolverine", ".versao")
        pg.click('[data-acao="fav-pers"]')
        pg.click('[data-acao="versao-mais"] >> nth=0')
        pg.click('[data-acao="partilhar-pers"]')
        pg.wait_for_selector(".cartao-img", timeout=8000)
        if FOTOS:
            pg.screenshot(path=f"{SAIDA}/cartao-modal.png")
        pg.click('[data-acao="modal-fechar"]')

        # jogo: chutar até acertar
        ir("jogo", "#j-in")
        alvo = pg.evaluate("document.title")  # força avaliação
        for nome in ["Wolverine", "Batman", "Coringa"]:
            if pg.is_disabled("#j-in"):
                break
            pg.fill("#j-in", nome)
            pg.wait_for_selector("#j-sug li")
            pg.keyboard.press("Enter")
            pg.wait_for_timeout(150)
        dias = pg.evaluate("JSON.parse(localStorage.getItem('heroteca-v1')).jogo.dias")
        if not dias:
            erros.append("jogo não salvou os chutes")

        # explorar: busca e filtros
        ir("explorar", "#exp-q")
        pg.fill("#exp-q", "simmons")
        pg.wait_for_timeout(150)
        if "J.K. Simmons" not in pg.inner_text("#exp-res"):
            erros.append("busca de pessoa não achou J.K. Simmons")
        pg.fill("#exp-q", "")
        pg.click('[data-k="explorar.formato"][data-v="hq"]')
        pg.select_option('[data-filtro="explorar.ordem"]', "nota")

        # perfil: editar, exemplos, seguir
        ir("perfil", ".perfil-cab")
        pg.click('[data-acao="perfil-editar"]')
        pg.fill("#p-nome", "Teste <script>")
        pg.fill("#p-usuario", "Fã do Multiverso!")
        pg.click('button[form="form-perfil"]')
        pg.wait_for_timeout(200)
        perfil = pg.evaluate("JSON.parse(localStorage.getItem('heroteca-v1')).perfil")
        if perfil["usuario"] != "fdomultiverso":
            erros.append(f"usuário não foi limpo: {perfil}")
        pg.click('[data-acao="seguir"][data-u="carol"]')
        pg.click('.ajustes [data-acao="exemplos"]')
        if pg.locator(".selo-ex").count() > 0 and "exemplo" in pg.inner_text(".numeros"):
            erros.append("exemplos não sumiram")

        # diário: editar e apagar um registro
        ir("diario", ".dl")
        pg.click('[data-acao="log-editar"] >> nth=0')
        pg.wait_for_selector("#f-data")
        pg.click('[data-acao="f-apagar"]')
        pg.click('[data-acao="confirmar-sim"]')
        pg.wait_for_timeout(200)

        # recarrega e confere que tudo voltou
        antes = pg.evaluate("localStorage.getItem('heroteca-v1')")
        pg.reload()
        pg.wait_for_selector("#conteudo .h1", timeout=8000)
        depois = pg.evaluate("localStorage.getItem('heroteca-v1')")
        if json.loads(antes)["logs"] != json.loads(depois)["logs"]:
            erros.append("dados mudaram depois de recarregar")

        if FOTOS:
            pg.evaluate("localStorage.clear()")
            pg.reload()
            pg.wait_for_selector("#conteudo .h1", timeout=8000)
            for nome, h in [("inicio", "inicio"), ("obra", "obra-x-men-97"), ("personagem", "personagem-batman"), ("diario", "diario"), ("perfil", "perfil"), ("jogo", "jogo")]:
                pg.evaluate(f"location.hash = '{h}'")
                pg.wait_for_timeout(400)
                pg.screenshot(path=f"{SAIDA}/m-{nome}.png", full_page=True)
            pg.set_viewport_size({"width": 1280, "height": 900})
            for nome, h in [("inicio", "inicio"), ("obra", "obra-batman-a-serie-animada")]:
                pg.evaluate(f"location.hash = '{h}'")
                pg.wait_for_timeout(400)
                pg.screenshot(path=f"{SAIDA}/d-{nome}.png", full_page=False)
        nav.close()
finally:
    srv.terminate()

ruido = [e for e in erros if "fonts.g" in e or "ERR_FAILED" in e or "net::" in e]
reais = [e for e in erros if e not in ruido]
print(f"{len(reais)} problema(s)")
for e in reais:
    print(" -", e)
