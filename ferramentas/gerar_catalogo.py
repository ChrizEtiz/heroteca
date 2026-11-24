#!/usr/bin/env python3
"""Gera o catalogo.json da Heroteca (um registro por linha) e confere todas as referências."""
import json
import re
import sys
import unicodedata

SAIDA = sys.argv[1] if len(sys.argv) > 1 else "catalogo.json"
HEROIDLE = sys.argv[2] if len(sys.argv) > 2 else "/home/claude/heroidle/index.html"


def slug(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-zA-Z0-9]+", "-", s.lower()).strip("-")


# ---------------------------------------------------------------- universos
UNIVERSOS = []


def U(id, nome, franquia, midia, anos, cor, desc):
    UNIVERSOS.append(dict(tipo="universo", id=id, nome=nome, franquia=franquia, midia=midia, anos=anos, cor=cor, desc=desc))


U("dc-hq", "DC · Quadrinhos", "DC", "HQ", "1938–hoje", "#3a6fe0", "A linha principal das HQs da DC, desde Action Comics #1.")
U("dc-elseworlds", "DC · Fora da cronologia", "DC", "HQ", "1986–hoje", "#7b57c9", "Histórias da DC fora da linha principal: futuros possíveis e realidades alternativas.")
U("batman66", "Batman '66", "DC", "TV e cinema", "1966–1968", "#e8b02a", "O Batman colorido e cheio de onomatopeias da série de TV e do filme dos anos 60.")
U("burton", "Batman de Burton e Schumacher", "DC", "Cinema", "1989–1997", "#55607f", "Os quatro filmes do Batman de 1989 a 1997, de Tim Burton e Joel Schumacher. Michael Keaton voltou como Batman em The Flash (2023), que ainda mostra George Clooney como Bruce Wayne.")
U("reeve", "Superman de Christopher Reeve", "DC", "Cinema", "1978–1987", "#e04a4f", "O Superman que fez o mundo acreditar que um homem pode voar.")
U("nolan", "Trilogia Cavaleiro das Trevas", "DC", "Cinema", "2005–2012", "#4a5570", "O Batman realista de Christopher Nolan, com Christian Bale.")
U("dceu", "DCEU", "DC", "Cinema", "2013–2023", "#5a7290", "O universo estendido da DC no cinema, iniciado com O Homem de Aço (2013).")
U("dcu", "DCU", "DC", "Cinema e TV", "2024–hoje", "#3f8ae8", "O novo universo da DC comandado por James Gunn e Peter Safran.")
U("the-batman", "Universo The Batman", "DC", "Cinema e TV", "2022–hoje", "#a83a3a", "O Batman detetive de Matt Reeves, separado do DCU.")
U("coringa-phillips", "Universo Coringa", "DC", "Cinema", "2019–2024", "#6f9440", "O Coringa de Todd Phillips e Joaquin Phoenix, sem Batman de uniforme.")
U("dcau", "Universo Animado DC", "DC", "Animação", "1992–2006", "#d4573a", "O DCAU: Batman: A Série Animada, Superman, Liga da Justiça, Super Choque e mais, tudo conectado.")
U("mm1975", "Mulher-Maravilha (1975)", "DC", "TV", "1975–1979", "#e03a52", "A Mulher-Maravilha de Lynda Carter na TV dos anos 70.")
U("marvel-616", "Marvel · Terra-616", "Marvel", "HQ", "1939–hoje", "#e04a4f", "A linha principal das HQs da Marvel, a famosa Terra-616.")
U("marvel-alt", "Marvel · Realidades alternativas", "Marvel", "HQ", "1977–hoje", "#9a57d6", "Futuros possíveis e realidades alternativas das HQs da Marvel.")
U("ultimate", "Universo Ultimate", "Marvel", "HQ", "2000–2015", "#5a5668", "A linha Ultimate da Marvel (Terra-1610), onde nasceu Miles Morales.")
U("mcu", "MCU", "Marvel", "Cinema e TV", "2008–hoje", "#cc3340", "O Universo Cinematográfico Marvel, de Homem de Ferro (2008) até Guerras Secretas.")
U("raimi", "Homem-Aranha de Sam Raimi", "Marvel", "Cinema", "2002–2007", "#d4424f", "A trilogia de Sam Raimi com Tobey Maguire. Voltou pelo multiverso em Sem Volta para Casa.")
U("webb", "O Espetacular Homem-Aranha", "Marvel", "Cinema", "2012–2014", "#4760b8", "Os filmes de Marc Webb com Andrew Garfield.")
U("aranhaverso", "Aranhaverso", "Marvel", "Animação", "2018–hoje", "#e04a8a", "As animações do Aranhaverso, com Miles Morales e um multiverso inteiro de aranhas.")
U("sony-spider", "Universo Sony do Homem-Aranha", "Marvel", "Cinema", "2018–2024", "#4f4f5c", "Os filmes da Sony com personagens do Homem-Aranha, como Venom.")
U("fox-xmen", "X-Men da Fox", "Marvel", "Cinema", "2000–2020", "#4466a8", "Os X-Men da Fox, de X-Men: O Filme a Logan. Deadpool e Wolverine depois atravessaram para o MCU.")
U("xmen-tas", "X-Men: A Série Animada", "Marvel", "Animação", "1992–1997, 2024–hoje", "#e0b02a", "O desenho clássico dos anos 90 e a continuação X-Men '97.")
U("hulk-tv", "O Incrível Hulk (TV)", "Marvel", "TV", "1977–1982", "#3f9a4a", "A série com Bill Bixby como David Banner e Lou Ferrigno como Hulk.")
U("hulk-2003", "Hulk de Ang Lee", "Marvel", "Cinema", "2003", "#5e8c48", "O Hulk de Ang Lee, com Eric Bana.")
U("qf-2005", "Quarteto Fantástico (2005)", "Marvel", "Cinema", "2005–2007", "#3f84d8", "O Quarteto dos anos 2000, com Chris Evans como Tocha Humana.")
U("qf-2015", "Quarteto Fantástico (2015)", "Marvel", "Cinema", "2015", "#5c7280", "O reboot de 2015.")
U("invencivel-hq", "Invencível · Quadrinhos", "Image", "HQ", "2003–2018", "#f0c62a", "A HQ de Robert Kirkman pela Image.")
U("invencivel-serie", "Invencível (série)", "Image", "Animação", "2021–hoje", "#3a93e8", "A adaptação animada da HQ.")
U("tmnt-hq", "Tartarugas Ninja · Quadrinhos", "TMNT", "HQ", "1984", "#60656f", "As HQs originais de Kevin Eastman e Peter Laird.")
U("tmnt-1987", "Tartarugas Ninja (1987)", "TMNT", "Animação", "1987–1996", "#2e8b3a", "O desenho clássico que deixou as tartarugas famosas no mundo todo.")
U("tmnt-2023", "Tartarugas Ninja: Caos Mutante", "TMNT", "Animação", "2023–hoje", "#76b038", "As tartarugas adolescentes de verdade de Caos Mutante.")
U("titas-2003", "Os Jovens Titãs (2003)", "DC", "Animação", "2003–2006", "#7f4fc0", "O desenho dos Jovens Titãs no Cartoon Network, com Robin, Estelar, Ravena, Mutano e Ciborgue.")
U("arrowverso", "Arrowverso", "DC", "TV", "2012–2023", "#36906a", "As séries de heróis da DC na CW, de Arrow a The Flash, ligadas por crossovers.")
U("smallville", "Smallville", "DC", "TV", "2001–2011", "#d4564a", "Os anos de Clark Kent antes de virar o Superman, em dez temporadas.")
U("lanterna-2011", "Lanterna Verde (2011)", "DC", "Cinema", "2011", "#38a858", "O filme do Lanterna Verde com Ryan Reynolds.")
U("constantine-2005", "Constantine (2005)", "DC", "Cinema", "2005", "#6b6350", "O Constantine de Keanu Reeves.")
U("marvel-netflix", "Marvel na Netflix", "Marvel", "TV", "2015–2019", "#b04038", "As séries da Marvel feitas pela Netflix. Demolidor, Rei do Crime e Justiceiro voltaram depois no MCU.")
U("blade-snipes", "Blade de Wesley Snipes", "Marvel", "Cinema", "1998–2004", "#8c3038", "Os filmes do Blade com Wesley Snipes, que reaparece em Deadpool & Wolverine (2024).")
U("motoqueiro-2007", "Motoqueiro Fantasma de Nicolas Cage", "Marvel", "Cinema", "2007–2012", "#e07030", "Os filmes com Nicolas Cage como Johnny Blaze.")
U("spawn-hq", "Spawn · Quadrinhos", "Image", "HQ", "1992–hoje", "#5a5a5a", "A HQ de Todd McFarlane pela Image.")
U("spawn-1997", "Spawn (1997)", "Image", "Cinema", "1997", "#6b4470", "O filme de 1997 com Michael Jai White.")
U("hellboy-hq", "Hellboy · Quadrinhos", "Dark Horse", "HQ", "1994–hoje", "#c44a40", "As HQs de Mike Mignola pela Dark Horse.")
U("hellboy-del-toro", "Hellboy de Guillermo del Toro", "Dark Horse", "Cinema", "2004–2008", "#a84038", "Os dois filmes de Guillermo del Toro com Ron Perlman.")
U("ben10", "Ben 10 (clássico)", "Cartoon Network", "Animação", "2005–2014", "#52b33d", "A continuidade clássica de Ben 10, do desenho de 2005 até Omniverse.")

# ---------------------------------------------------------------- personagens
PERS = {}


def P(id, nome, franquia, estreia, identidade=None, primeira=None, resumo=None, apelidos=None):
    PERS[id] = dict(tipo="personagem", id=id, nome=nome, franquia=franquia, estreia=estreia)
    if identidade:
        PERS[id]["identidade"] = identidade
    if primeira:
        PERS[id]["primeira"] = primeira
    if resumo:
        PERS[id]["resumo"] = resumo
    if apelidos:
        PERS[id]["apelidos"] = apelidos


# Os 70 do jogo (atributos vêm do Heroidle)
MAPA_JOGO = {
    "Homem-Aranha": "homem-aranha", "Homem de Ferro": "homem-de-ferro", "Capitão América": "capitao-america",
    "Thor": "thor", "Hulk": "hulk", "Viúva Negra": "viuva-negra", "Gavião Arqueiro": "gaviao-arqueiro",
    "Doutor Estranho": "doutor-estranho", "Pantera Negra": "pantera-negra", "Capitã Marvel": "capita-marvel",
    "Wolverine": "wolverine", "Ciclope": "ciclope", "Jean Grey": "jean-grey", "Tempestade": "tempestade",
    "Professor X": "professor-x", "Magneto": "magneto", "Mística": "mistica", "Deadpool": "deadpool",
    "Venom": "venom", "Thanos": "thanos", "Loki": "loki", "Duende Verde": "duende-verde",
    "Doutor Octopus": "doutor-octopus", "Justiceiro": "justiceiro", "Demolidor": "demolidor",
    "Feiticeira Escarlate": "feiticeira-escarlate", "Senhor das Estrelas": "senhor-das-estrelas",
    "Gamora": "gamora", "Groot": "groot", "Rocket Raccoon": "rocket", "Senhor Fantástico": "senhor-fantastico",
    "Coisa": "coisa", "Doutor Destino": "doutor-destino", "Blade": "blade", "Motoqueiro Fantasma": "motoqueiro-fantasma",
    "Rei do Crime": "rei-do-crime", "Ultron": "ultron", "Miles Morales": "miles-morales",
    "Superman": "superman", "Batman": "batman", "Mulher-Maravilha": "mulher-maravilha",
    "Flash (Barry Allen)": "flash", "Lanterna Verde (Hal Jordan)": "lanterna-verde", "Aquaman": "aquaman",
    "Ciborgue": "ciborgue", "Shazam": "shazam", "Coringa": "coringa", "Arlequina": "arlequina",
    "Lex Luthor": "lex-luthor", "Mulher-Gato": "mulher-gato", "Robin (Dick Grayson)": "robin",
    "Ravena": "ravena", "Estelar": "estelar", "Mutano": "mutano", "Arqueiro Verde": "arqueiro-verde",
    "Caçador de Marte": "cacador-de-marte", "Constantine": "constantine", "Zatanna": "zatanna",
    "Darkseid": "darkseid", "Bane": "bane", "Pinguim": "pinguim", "Charada": "charada",
    "Duas-Caras": "duas-caras", "Hera Venenosa": "hera-venenosa", "Pacificador": "pacificador",
    "Brainiac": "brainiac", "Besouro Azul (Jaime Reyes)": "besouro-azul", "Exterminador": "exterminador",
    "Spawn": "spawn", "Hellboy": "hellboy",
}
NOME_SITE = {"Flash (Barry Allen)": "Flash", "Lanterna Verde (Hal Jordan)": "Lanterna Verde",
             "Robin (Dick Grayson)": "Robin", "Besouro Azul (Jaime Reyes)": "Besouro Azul"}
IDENT = {
    "homem-aranha": "Peter Parker", "homem-de-ferro": "Tony Stark", "capitao-america": "Steve Rogers",
    "thor": "Thor Odinson", "hulk": "Bruce Banner", "viuva-negra": "Natasha Romanoff", "gaviao-arqueiro": "Clint Barton",
    "doutor-estranho": "Stephen Strange", "pantera-negra": "T'Challa", "capita-marvel": "Carol Danvers",
    "wolverine": "Logan (James Howlett)", "ciclope": "Scott Summers", "jean-grey": "Jean Grey", "tempestade": "Ororo Munroe",
    "professor-x": "Charles Xavier", "magneto": "Erik Lehnsherr", "mistica": "Raven Darkhölme", "deadpool": "Wade Wilson",
    "venom": "Eddie Brock e o simbionte", "loki": "Loki Laufeyson", "duende-verde": "Norman Osborn",
    "doutor-octopus": "Otto Octavius", "justiceiro": "Frank Castle", "demolidor": "Matt Murdock",
    "feiticeira-escarlate": "Wanda Maximoff", "senhor-das-estrelas": "Peter Quill", "rocket": "Rocket",
    "senhor-fantastico": "Reed Richards", "coisa": "Ben Grimm", "doutor-destino": "Victor von Doom", "blade": "Eric Brooks",
    "motoqueiro-fantasma": "Johnny Blaze", "rei-do-crime": "Wilson Fisk", "miles-morales": "Miles Morales",
    "superman": "Clark Kent (Kal-El)", "batman": "Bruce Wayne", "mulher-maravilha": "Diana de Themyscira",
    "flash": "Barry Allen", "lanterna-verde": "Hal Jordan", "aquaman": "Arthur Curry", "ciborgue": "Victor Stone",
    "shazam": "Billy Batson", "arlequina": "Harleen Quinzel", "lex-luthor": "Lex Luthor", "mulher-gato": "Selina Kyle",
    "robin": "Dick Grayson", "ravena": "Rachel Roth", "estelar": "Koriand'r", "mutano": "Garfield Logan",
    "arqueiro-verde": "Oliver Queen", "cacador-de-marte": "J'onn J'onzz", "constantine": "John Constantine",
    "zatanna": "Zatanna Zatara", "pinguim": "Oswald Cobblepot", "charada": "Edward Nygma",
    "duas-caras": "Harvey Dent", "hera-venenosa": "Pamela Isley", "pacificador": "Christopher Smith",
    "besouro-azul": "Jaime Reyes", "exterminador": "Slade Wilson", "spawn": "Al Simmons", "hellboy": "Anung Un Rama",
}
PRIMEIRA = {
    "batman": "Detective Comics #27 (1939)", "coringa": "Batman #1 (1940)", "superman": "Action Comics #1 (1938)",
    "mulher-maravilha": "All Star Comics #8 (1941)", "arlequina": "Batman: A Série Animada (1992)",
    "homem-aranha": "Amazing Fantasy #15 (1962)", "miles-morales": "Ultimate Fallout #4 (2011)",
    "homem-de-ferro": "Tales of Suspense #39 (1963)", "capitao-america": "Captain America Comics #1 (1941)",
    "thor": "Journey into Mystery #83 (1962)", "hulk": "The Incredible Hulk #1 (1962)",
    "viuva-negra": "Tales of Suspense #52 (1964)", "pantera-negra": "Fantastic Four #52 (1966)",
    "wolverine": "The Incredible Hulk #181 (1974)", "deadpool": "The New Mutants #98 (1991)",
    "venom": "The Amazing Spider-Man #300 (1988)", "doutor-destino": "Fantastic Four #5 (1962)",
    "thanos": "Iron Man #55 (1973)",
}
RESUMO = {
    "batman": "Bruce Wayne viu os pais serem assassinados num beco de Gotham e transformou o trauma em missão. Sem superpoderes: só disciplina, inteligência, tecnologia e, na maioria das versões, a regra de não matar.",
    "coringa": "O maior inimigo do Batman e o palhaço do crime de Gotham. A origem muda de versão pra versão, e ele parece gostar disso: o caos é o único plano.",
    "superman": "Último filho de Krypton, enviado à Terra ainda bebê e criado no Kansas como Clark Kent. O sol amarelo dá a força e o voo; os Kent deram o resto.",
    "mulher-maravilha": "Diana, princesa das amazonas, deixou Themyscira para levar verdade e justiça ao mundo. Força de deusa, braceletes e o Laço da Verdade.",
    "arlequina": "Harleen Quinzel era psiquiatra no Asilo Arkham até se apaixonar pelo Coringa. Nasceu no desenho de 1992, foi parar nos quadrinhos e virou anti-heroína com vida própria.",
    "homem-aranha": "Peter Parker ganhou poderes com a picada de uma aranha radioativa e aprendeu da pior forma que grandes poderes trazem grandes responsabilidades. Herói do bairro, sempre sem dinheiro e sempre atrasado.",
    "miles-morales": "Garoto do Brooklyn picado por uma aranha modificada. Herdou o manto do Homem-Aranha em outro universo e criou o próprio estilo, com camuflagem e choque venenoso.",
    "homem-de-ferro": "Tony Stark, gênio e bilionário, construiu uma armadura para fugir de um cativeiro e nunca mais parou de melhorá-la.",
    "capitao-america": "Steve Rogers era franzino demais para o exército até receber o soro do supersoldado. Congelado por décadas, acordou num mundo novo com os mesmos valores e o mesmo escudo.",
    "thor": "Deus do trovão de Asgard e filho de Odin. Precisou aprender humildade para ser digno do martelo Mjolnir.",
    "hulk": "O cientista Bruce Banner foi atingido por raios gama e, quando perde o controle, vira o monstro verde mais forte que existe. Quanto mais bravo, mais forte.",
    "viuva-negra": "Natasha Romanoff foi treinada desde criança na Sala Vermelha para ser espiã. Desertou e passou a usar o mesmo treinamento para proteger as pessoas.",
    "pantera-negra": "T'Challa é o rei de Wakanda, a nação mais avançada do planeta graças ao vibranium, e carrega o manto de protetor do seu povo.",
    "wolverine": "Mutante com fator de cura, sentidos aguçados e garras. O programa Arma X cobriu o esqueleto dele de adamantium e levou boa parte da memória junto.",
    "deadpool": "Wade Wilson virou cobaia de um experimento que deu a ele um fator de cura e marcou o rosto para sempre. Tagarela, violento e o único que sabe que está dentro de uma história.",
    "venom": "Um simbionte alienígena que se une a um hospedeiro, o mais famoso deles Eddie Brock. Começou como inimigo do Homem-Aranha e virou um protetor letal.",
    "doutor-destino": "Victor von Doom, monarca da Latvéria, mistura ciência e feitiçaria atrás da máscara de ferro. Rival eterno de Reed Richards e um dos maiores vilões da Marvel.",
    "thanos": "Titã obcecado pela morte e pelas Joias do Infinito. Nas HQs, quer impressionar a Morte; nos filmes, quer equilibrar o universo com um estalar de dedos.",
    "flash": "Barry Allen, perito da polícia, foi atingido por um raio no meio de produtos químicos e virou o homem mais rápido do mundo.",
    "lex-luthor": "Gênio, bilionário e convencido de que o Superman é uma ameaça à humanidade.",
    "mulher-gato": "Selina Kyle, a ladra mais elegante de Gotham, vive entre o crime e um romance com o Batman.",
    "duas-caras": "O promotor Harvey Dent teve metade do rosto desfigurada e passou a decidir tudo no cara ou coroa.",
    "pinguim": "Chefão do crime de Gotham, com guarda-chuvas, ambição e muito rancor.",
    "charada": "Criminoso obcecado por enigmas, que sempre deixa uma pista porque precisa provar que é mais esperto.",
    "bane": "Criado numa prisão, forte e estrategista, ficou famoso por quebrar o Batman.",
    "magneto": "Mutante que controla o magnetismo e sobreviveu ao Holocausto. Quer proteger os mutantes a qualquer custo.",
    "professor-x": "Telepata e fundador dos X-Men, sonha com mutantes e humanos vivendo em paz.",
    "duende-verde": "Norman Osborn tomou uma fórmula experimental e virou o vilão mais pessoal da vida de Peter Parker.",
    "doutor-octopus": "O cientista Otto Octavius ficou preso a quatro braços mecânicos após um acidente.",
    "demolidor": "Matt Murdock ficou cego ainda criança, mas os outros sentidos viraram superpoderes. Advogado de dia, justiceiro de Hell's Kitchen à noite.",
}

# Atributos do jogo, tirados do Heroidle
heroidle = open(HEROIDLE, encoding="utf-8").read()
linhas = re.findall(r'^\s*(\{ nome: ".*?\})\s*,?\s*$', heroidle, flags=re.M)
JOGO = []
for ln in linhas:
    js = re.sub(r'(\{\s*|,\s*)(\w+):', r'\1"\2":', ln)
    JOGO.append(json.loads(js))
assert len(JOGO) == 70, f"esperava 70 personagens do jogo, achei {len(JOGO)}"

for j in JOGO:
    pid = MAPA_JOGO[j["nome"]]
    nome = NOME_SITE.get(j["nome"], j["nome"])
    P(pid, nome, j["editora"], j["estreia"], IDENT.get(pid), PRIMEIRA.get(pid), RESUMO.get(pid), j["apelidos"])
    PERS[pid]["jogo"] = {k: j[k] for k in ("nome", "editora", "genero", "lado", "poder", "equipe", "estreia")}

# Personagens que não estão no jogo
P("gordon", "Comissário Gordon", "DC", 1939, "James Gordon", "Detective Comics #27 (1939)", "Policial honesto de Gotham e o maior aliado do Batman dentro da lei.", ["Jim Gordon", "James Gordon"])
P("alfred", "Alfred", "DC", 1943, "Alfred Pennyworth", "Batman #16 (1943)", "Mordomo, médico de campo e figura paterna de Bruce Wayne.", ["Alfred Pennyworth"])
P("lois-lane", "Lois Lane", "DC", 1938, "Lois Lane", "Action Comics #1 (1938)", "Repórter do Planeta Diário que nunca larga uma pauta, nem quando a pauta voa.")
P("jor-el", "Jor-El", "DC", 1939, None, None, "Cientista de Krypton e pai do Superman, que mandou o filho para a Terra antes de o planeta explodir.")
P("zod", "General Zod", "DC", 1961, "Dru-Zod", "Adventure Comics #283 (1961)", "Militar kryptoniano exilado na Zona Fantasma, com os mesmos poderes do Superman e nenhum dos valores.")
P("supergirl", "Supergirl", "DC", 1959, "Kara Zor-El", "Action Comics #252 (1959)", "Prima kryptoniana do Superman.", ["Kara Zor-El"])
P("espantalho", "Espantalho", "DC", 1941, "Jonathan Crane", "World's Finest Comics #3 (1941)", "Psiquiatra que usa o gás do medo contra Gotham.", ["Scarecrow", "Jonathan Crane"])
P("ras-al-ghul", "Ra's al Ghul", "DC", 1971, None, "Batman #232 (1971)", "Líder imortal da Liga dos Assassinos, que em algumas versões treinou o próprio Batman.")
P("sr-frio", "Sr. Frio", "DC", 1959, "Victor Fries", "Batman #121 (1959)", "Cientista preso a um traje congelante, que faz qualquer coisa para salvar a esposa, Nora.", ["Mr. Freeze", "Senhor Frio", "Victor Fries"])
P("super-choque", "Super Choque", "DC", 1993, "Virgil Hawkins", "Static #1 (1993)", "Adolescente que ganhou poderes elétricos numa explosão de gás e virou herói da cidade de Dakota.", ["Static", "Static Shock", "Virgil Hawkins"])
P("nick-fury", "Nick Fury", "Marvel", 1963, "Nick Fury", "Sgt. Fury and His Howling Commandos #1 (1963)", "Diretor da S.H.I.E.L.D. e o homem que juntou os Vingadores.")
P("soldado-invernal", "Soldado Invernal", "Marvel", 1941, "Bucky Barnes", "Captain America Comics #1 (1941)", "Melhor amigo do Capitão América, dado como morto na guerra e transformado em assassino.", ["Bucky", "Winter Soldier", "Bucky Barnes"])
P("falcao", "Falcão", "Marvel", 1969, "Sam Wilson", "Captain America #117 (1969)", "Herói alado e parceiro do Capitão América, que depois herdou o escudo.", ["Falcon", "Sam Wilson"])
P("caveira-vermelha", "Caveira Vermelha", "Marvel", 1941, "Johann Schmidt", None, "Arqui-inimigo nazista do Capitão América.", ["Red Skull"])
P("abutre", "Abutre", "Marvel", 1963, "Adrian Toomes", "The Amazing Spider-Man #2 (1963)", "Velho inimigo do Homem-Aranha que voa com asas mecânicas.", ["Vulture", "Adrian Toomes"])
P("hela", "Hela", "Marvel", 1964, None, "Journey into Mystery #102 (1964)", "Deusa asgardiana da morte.")
P("killmonger", "Killmonger", "Marvel", 1973, "N'Jadaka (Erik Stevens)", "Jungle Action #6 (1973)", "Rival de T'Challa pelo trono de Wakanda.", ["Erik Killmonger"])
P("shuri", "Shuri", "Marvel", 2005, "Shuri", "Black Panther #2 (2005)", "Irmã de T'Challa, gênio da tecnologia de Wakanda e, depois, a nova Pantera Negra.")
P("gorr", "Gorr", "Marvel", 2013, "Gorr, o Carniceiro dos Deuses", "Thor: God of Thunder #2 (2013)", "Caçador de deuses armado com a Necroespada.", ["Gorr the God Butcher"])
P("jameson", "J. Jonah Jameson", "Marvel", 1963, "J. Jonah Jameson", "The Amazing Spider-Man #1 (1963)", "Editor do Clarim Diário e o maior hater do Homem-Aranha.", ["JJJ", "Jonah Jameson"])
P("mary-jane", "Mary Jane", "Marvel", 1965, "Mary Jane Watson", "The Amazing Spider-Man #25 (1965)", "Vizinha, amiga e grande amor de Peter Parker.", ["MJ", "Mary Jane Watson"])
P("gwen-stacy", "Gwen Stacy", "Marvel", 1965, "Gwen Stacy", "The Amazing Spider-Man #31 (1965)", "Primeiro grande amor de Peter Parker. No Aranhaverso, é a heroína Spider-Gwen.", ["Spider-Gwen", "Ghost-Spider"])
P("electro", "Electro", "Marvel", 1964, "Max Dillon", "The Amazing Spider-Man #9 (1964)", "Vilão que controla a eletricidade.")
P("carnificina", "Carnificina", "Marvel", 1992, "Cletus Kasady", "The Amazing Spider-Man #361 (1992)", "Assassino em série unido a um filhote do simbionte Venom.", ["Carnage", "Cletus Kasady"])
P("cable", "Cable", "Marvel", 1990, "Nathan Summers", "The New Mutants #87 (1990)", "Soldado vindo do futuro e filho do Ciclope.")
P("mulher-invisivel", "Mulher-Invisível", "Marvel", 1961, "Sue Storm", "Fantastic Four #1 (1961)", "Integrante do Quarteto Fantástico; fica invisível e cria campos de força.", ["Invisible Woman", "Sue Storm"])
P("tocha-humana", "Tocha Humana", "Marvel", 1961, "Johnny Storm", "Fantastic Four #1 (1961)", "Integrante do Quarteto Fantástico que pega fogo e voa.", ["Human Torch", "Johnny Storm"])
P("kraven", "Kraven", "Marvel", 1964, "Sergei Kravinoff", "The Amazing Spider-Man #15 (1964)", "O caçador que quer provar ser superior ao Homem-Aranha.", ["Kraven the Hunter"])
P("invencivel", "Invencível", "Image", 2003, "Mark Grayson", None, "Filho do herói mais poderoso da Terra. Quando os poderes aparecem, Mark descobre que o legado do pai esconde um segredo terrível.", ["Invincible", "Mark Grayson"])
P("omni-man", "Omni-Man", "Image", 2003, "Nolan Grayson", None, "O maior herói da Terra, marido e pai exemplar. Ou pelo menos é o que todo mundo acha.", ["Nolan Grayson"])
P("ben-10", "Ben 10", "Cartoon Network", 2005, "Ben Tennyson", "Ben 10 (2005)", "Aos 10 anos, Ben Tennyson achou o Omnitrix, um relógio alienígena que o transforma em criaturas diferentes.", ["Ben Tennyson"])
P("vilgax", "Vilgax", "Cartoon Network", 2005, None, "Ben 10 (2005)", "Conquistador alienígena que quer o Omnitrix a qualquer custo.")
P("leonardo", "Leonardo", "TMNT", 1984, None, "Teenage Mutant Ninja Turtles #1 (1984)", "Líder das Tartarugas Ninja: faixa azul e duas katanas.", ["Leo"])
P("michelangelo", "Michelangelo", "TMNT", 1984, None, "Teenage Mutant Ninja Turtles #1 (1984)", "O mais brincalhão das Tartarugas: faixa laranja, nunchakus e muita pizza.", ["Mikey"])
P("raphael", "Raphael", "TMNT", 1984, None, "Teenage Mutant Ninja Turtles #1 (1984)", "O esquentado das Tartarugas: faixa vermelha e sais.", ["Raph", "Rafael"])
P("donatello", "Donatello", "TMNT", 1984, None, "Teenage Mutant Ninja Turtles #1 (1984)", "O gênio das Tartarugas: faixa roxa e bastão bō.", ["Donnie"])
P("destruidor", "Destruidor", "TMNT", 1984, "Oroku Saki", "Teenage Mutant Ninja Turtles #1 (1984)", "Líder do Clã do Pé e arqui-inimigo das Tartarugas.", ["Shredder"])

# ---------------------------------------------------------------- obras
OBRAS = []
PAPEL = {"pro": "protagonista", "ant": "antagonista", "coa": "coadjuvante", "par": "participacao"}
FORMATOS = {"filme", "serie", "desenho", "animacao", "hq"}


def ED(prefixo, a, b, exceto=()):
    return [f"{prefixo} #{i}" for i in range(a, b + 1) if i not in exceto]


def O(id, titulo, original, ano, formato, universo, creditos=None, elenco=(), temporadas=None, edicoes=None,
      periodo=None, status=None, data=None, episodios=None, nota=None):
    assert formato in FORMATOS, id
    u = next(x for x in UNIVERSOS if x["id"] == universo)
    ob = dict(tipo="obra", id=id, titulo=titulo, original=original, ano=ano, formato=formato, universo=universo,
              franquia=u["franquia"])
    if creditos:
        ob["creditos"] = creditos
    if periodo:
        ob["periodo"] = periodo
    if status:
        ob["status"] = status
    if data:
        ob["data"] = data
    if nota:
        ob["nota"] = nota
    if temporadas:
        ob["temporadas"] = [t if isinstance(t, dict) else {"n": i + 1, "eps": t} for i, t in enumerate(temporadas)]
    if episodios:
        ob["episodios"] = episodios
    if edicoes:
        ob["edicoes"] = edicoes
    if formato != "hq":
        ob["tmdb"] = {"t": "movie" if formato in ("filme", "animacao") else "tv", "q": original, "y": ano}
    el = []
    for e in elenco:
        d = {"p": e[0], "r": PAPEL[e[2]]}
        if e[1]:
            d["a"] = e[1]
        if len(e) > 3:
            d.update(e[3])
        el.append(d)
    ob["elenco"] = el
    OBRAS.append(ob)


MR = {"dub": "Marco Ribeiro"}          # Robert Downey Jr. como Tony Stark
IB = {"dub": "Isaac Bardavid"}         # Wolverine (desenho dos anos 90 e filmes da Fox até Logan)
GB = {"dub": "Guilherme Briggs"}       # Superman de Henry Cavill e da Liga da Justiça animada
VOZ = {"voz": True}

# ===== DC: cinema e TV
O("batman-1966", "Batman: O Homem-Morcego", "Batman", 1966, "filme", "batman66", "Direção: Leslie H. Martinson", [
    ("batman", "Adam West", "pro"), ("robin", "Burt Ward", "coa"), ("coringa", "Cesar Romero", "ant"),
    ("pinguim", "Burgess Meredith", "ant"), ("charada", "Frank Gorshin", "ant"), ("mulher-gato", "Lee Meriwether", "ant")])
O("batman-tv-1966", "Batman", "Batman", 1966, "serie", "batman66", "Produção: William Dozier", [
    ("batman", "Adam West", "pro"), ("robin", "Burt Ward", "pro"), ("coringa", "Cesar Romero", "ant"),
    ("mulher-gato", "Julie Newmar", "ant"), ("pinguim", "Burgess Meredith", "ant"), ("charada", "Frank Gorshin", "ant"),
    ("gordon", "Neil Hamilton", "coa"), ("alfred", "Alan Napier", "coa")], temporadas=[34, 60, 26], periodo="1966–1968")
O("batman-1989", "Batman", "Batman", 1989, "filme", "burton", "Direção: Tim Burton", [
    ("batman", "Michael Keaton", "pro"), ("coringa", "Jack Nicholson", "ant"), ("gordon", "Pat Hingle", "coa"),
    ("alfred", "Michael Gough", "coa"), ("duas-caras", "Billy Dee Williams", "par", {"obs": "ainda como Harvey Dent"})])
O("batman-o-retorno-1992", "Batman: O Retorno", "Batman Returns", 1992, "filme", "burton", "Direção: Tim Burton", [
    ("batman", "Michael Keaton", "pro"), ("pinguim", "Danny DeVito", "ant"), ("mulher-gato", "Michelle Pfeiffer", "ant"),
    ("alfred", "Michael Gough", "coa"), ("gordon", "Pat Hingle", "par")])
O("batman-begins-2005", "Batman Begins", "Batman Begins", 2005, "filme", "nolan", "Direção: Christopher Nolan", [
    ("batman", "Christian Bale", "pro"), ("ras-al-ghul", "Liam Neeson", "ant"), ("espantalho", "Cillian Murphy", "ant"),
    ("alfred", "Michael Caine", "coa"), ("gordon", "Gary Oldman", "coa")])
O("cavaleiro-das-trevas-2008", "Batman: O Cavaleiro das Trevas", "The Dark Knight", 2008, "filme", "nolan", "Direção: Christopher Nolan", [
    ("batman", "Christian Bale", "pro"), ("coringa", "Heath Ledger", "ant", {"dub": "Márcio Simões"}),
    ("duas-caras", "Aaron Eckhart", "ant"), ("gordon", "Gary Oldman", "coa"), ("alfred", "Michael Caine", "coa"),
    ("espantalho", "Cillian Murphy", "par")])
O("cavaleiro-das-trevas-ressurge-2012", "Batman: O Cavaleiro das Trevas Ressurge", "The Dark Knight Rises", 2012, "filme", "nolan", "Direção: Christopher Nolan", [
    ("batman", "Christian Bale", "pro"), ("bane", "Tom Hardy", "ant"), ("mulher-gato", "Anne Hathaway", "coa"),
    ("gordon", "Gary Oldman", "coa"), ("alfred", "Michael Caine", "coa"), ("espantalho", "Cillian Murphy", "par"),
    ("ras-al-ghul", "Liam Neeson", "par")])
O("the-batman-2022", "The Batman", "The Batman", 2022, "filme", "the-batman", "Direção: Matt Reeves", [
    ("batman", "Robert Pattinson", "pro"), ("charada", "Paul Dano", "ant"), ("mulher-gato", "Zoë Kravitz", "coa"),
    ("pinguim", "Colin Farrell", "coa"), ("gordon", "Jeffrey Wright", "coa"), ("alfred", "Andy Serkis", "coa")])
O("pinguim-2024", "Pinguim", "The Penguin", 2024, "serie", "the-batman", "Criação: Lauren LeFranc", [
    ("pinguim", "Colin Farrell", "pro")], temporadas=[8], periodo="2024")
O("batman-a-serie-animada", "Batman: A Série Animada", "Batman: The Animated Series", 1992, "desenho", "dcau", "Criação: Bruce Timm e Eric Radomski", [
    ("batman", "Kevin Conroy", "pro", {"dub": "Márcio Seixas e Maurício Berger"}), ("coringa", "Mark Hamill", "ant"),
    ("arlequina", "Arleen Sorkin", "coa", {"obs": "estreia da personagem"}), ("robin", "Loren Lester", "coa"),
    ("gordon", "Bob Hastings", "coa"), ("alfred", "Efrem Zimbalist Jr.", "coa"), ("pinguim", "Paul Williams", "ant"),
    ("charada", "John Glover", "ant"), ("duas-caras", "Richard Moll", "ant"), ("mulher-gato", "Adrienne Barbeau", "ant"),
    ("bane", "Henry Silva", "ant"), ("espantalho", "Henry Polic II", "ant"), ("ras-al-ghul", "David Warner", "ant"),
    ("hera-venenosa", "Diane Pershing", "ant"), ("sr-frio", "Michael Ansara", "ant")],
    temporadas=[65, 20], periodo="1992–1995")
O("batman-mascara-do-fantasma-1993", "Batman: A Máscara do Fantasma", "Batman: Mask of the Phantasm", 1993, "animacao", "dcau", "Direção: Eric Radomski e Bruce Timm", [
    ("batman", "Kevin Conroy", "pro"), ("coringa", "Mark Hamill", "ant"), ("alfred", "Efrem Zimbalist Jr.", "coa"),
    ("gordon", "Bob Hastings", "par")])
O("superman-a-serie-animada", "Superman: A Série Animada", "Superman: The Animated Series", 1996, "desenho", "dcau", "Criação: Bruce Timm, Paul Dini e Alan Burnett", [
    ("superman", "Tim Daly", "pro"), ("lois-lane", "Dana Delany", "coa"), ("lex-luthor", "Clancy Brown", "ant"),
    ("darkseid", "Michael Ironside", "ant"), ("brainiac", "Corey Burton", "ant"), ("batman", "Kevin Conroy", "par"),
    ("coringa", "Mark Hamill", "par")], temporadas=[13, 28, 13], periodo="1996–2000")
O("liga-da-justica-2001", "Liga da Justiça", "Justice League", 2001, "desenho", "dcau", "Criação: Bruce Timm", [
    ("superman", "George Newbern", "pro", GB), ("batman", "Kevin Conroy", "pro"), ("mulher-maravilha", "Susan Eisenberg", "pro"),
    ("cacador-de-marte", "Carl Lumbly", "pro"), ("lex-luthor", "Clancy Brown", "ant"), ("darkseid", "Michael Ironside", "ant"),
    ("coringa", "Mark Hamill", "par")], temporadas=[26, 26], periodo="2001–2004")
O("super-choque", "Super Choque", "Static Shock", 2000, "desenho", "dcau", "Baseado no herói da Milestone Comics", [
    ("super-choque", "Phil LaMarr", "pro"), ("batman", "Kevin Conroy", "par"), ("coringa", "Mark Hamill", "par"),
    ("superman", "George Newbern", "par")], temporadas=[13, 13, 13, 13], periodo="2000–2004")
O("superman-o-filme-1978", "Superman: O Filme", "Superman", 1978, "filme", "reeve", "Direção: Richard Donner", [
    ("superman", "Christopher Reeve", "pro"), ("lex-luthor", "Gene Hackman", "ant"), ("lois-lane", "Margot Kidder", "coa"),
    ("jor-el", "Marlon Brando", "coa", IB)])
O("superman-2-1980", "Superman II: A Aventura Continua", "Superman II", 1980, "filme", "reeve", "Direção: Richard Lester", [
    ("superman", "Christopher Reeve", "pro"), ("zod", "Terence Stamp", "ant"), ("lois-lane", "Margot Kidder", "coa"),
    ("lex-luthor", "Gene Hackman", "coa")])
O("homem-de-aco-2013", "O Homem de Aço", "Man of Steel", 2013, "filme", "dceu", "Direção: Zack Snyder", [
    ("superman", "Henry Cavill", "pro", GB), ("zod", "Michael Shannon", "ant"), ("lois-lane", "Amy Adams", "coa"),
    ("jor-el", "Russell Crowe", "coa")])
O("batman-vs-superman-2016", "Batman vs Superman: A Origem da Justiça", "Batman v Superman: Dawn of Justice", 2016, "filme", "dceu", "Direção: Zack Snyder", [
    ("batman", "Ben Affleck", "pro", {"dub": "Jorge Lucas"}), ("superman", "Henry Cavill", "pro", GB),
    ("mulher-maravilha", "Gal Gadot", "coa"), ("lex-luthor", "Jesse Eisenberg", "ant"), ("lois-lane", "Amy Adams", "coa"),
    ("alfred", "Jeremy Irons", "coa"), ("flash", "Ezra Miller", "par"), ("aquaman", "Jason Momoa", "par"),
    ("ciborgue", "Ray Fisher", "par")])
O("esquadrao-suicida-2016", "Esquadrão Suicida", "Suicide Squad", 2016, "filme", "dceu", "Direção: David Ayer", [
    ("arlequina", "Margot Robbie", "pro"), ("coringa", "Jared Leto", "coa"), ("batman", "Ben Affleck", "par"),
    ("flash", "Ezra Miller", "par")])
O("mulher-maravilha-2017", "Mulher-Maravilha", "Wonder Woman", 2017, "filme", "dceu", "Direção: Patty Jenkins", [
    ("mulher-maravilha", "Gal Gadot", "pro")])
O("liga-da-justica-2017", "Liga da Justiça", "Justice League", 2017, "filme", "dceu", "Direção: Zack Snyder (finalizado por Joss Whedon)", [
    ("batman", "Ben Affleck", "pro"), ("mulher-maravilha", "Gal Gadot", "pro"), ("superman", "Henry Cavill", "pro", GB),
    ("flash", "Ezra Miller", "pro"), ("aquaman", "Jason Momoa", "pro"), ("ciborgue", "Ray Fisher", "pro"),
    ("gordon", "J.K. Simmons", "coa"), ("alfred", "Jeremy Irons", "coa"),
    ("lex-luthor", "Jesse Eisenberg", "par", {"obs": "cena pós-créditos"}), ("exterminador", "Joe Manganiello", "par", {"obs": "cena pós-créditos"})])
O("liga-da-justica-zack-snyder-2021", "Liga da Justiça de Zack Snyder", "Zack Snyder's Justice League", 2021, "filme", "dceu", "Direção: Zack Snyder", [
    ("batman", "Ben Affleck", "pro", {"dub": "Jorge Lucas"}), ("superman", "Henry Cavill", "pro", GB),
    ("mulher-maravilha", "Gal Gadot", "pro"), ("flash", "Ezra Miller", "pro"), ("aquaman", "Jason Momoa", "pro"),
    ("ciborgue", "Ray Fisher", "pro"), ("darkseid", "Ray Porter", "ant"), ("gordon", "J.K. Simmons", "coa"),
    ("alfred", "Jeremy Irons", "coa"), ("coringa", "Jared Leto", "par"), ("lex-luthor", "Jesse Eisenberg", "par"),
    ("exterminador", "Joe Manganiello", "par")])
O("aves-de-rapina-2020", "Aves de Rapina: Arlequina e sua Emancipação Fantabulosa", "Birds of Prey", 2020, "filme", "dceu", "Direção: Cathy Yan", [
    ("arlequina", "Margot Robbie", "pro")])
O("o-esquadrao-suicida-2021", "O Esquadrão Suicida", "The Suicide Squad", 2021, "filme", "dceu", "Direção: James Gunn", [
    ("arlequina", "Margot Robbie", "pro"), ("pacificador", "John Cena", "coa")])
O("the-flash-2023", "The Flash", "The Flash", 2023, "filme", "dceu", "Direção: Andy Muschietti", [
    ("flash", "Ezra Miller", "pro"), ("batman", "Michael Keaton", "coa", {"u": "burton"}), ("batman", "Ben Affleck", "coa"),
    ("supergirl", "Sasha Calle", "coa"), ("zod", "Michael Shannon", "ant"),
    ("batman", "George Clooney", "par", {"u": "burton", "obs": "como Bruce Wayne, no fim"})])
O("superman-2025", "Superman", "Superman", 2025, "filme", "dcu", "Direção: James Gunn", [
    ("superman", "David Corenswet", "pro"), ("lois-lane", "Rachel Brosnahan", "coa"), ("lex-luthor", "Nicholas Hoult", "ant")])
O("coringa-2019", "Coringa", "Joker", 2019, "filme", "coringa-phillips", "Direção: Todd Phillips", [
    ("coringa", "Joaquin Phoenix", "pro")])
O("coringa-delirio-a-dois-2024", "Coringa: Delírio a Dois", "Joker: Folie à Deux", 2024, "filme", "coringa-phillips", "Direção: Todd Phillips", [
    ("coringa", "Joaquin Phoenix", "pro"), ("arlequina", "Lady Gaga", "pro", {"obs": "como Lee Quinzel"})])
O("mulher-maravilha-1975", "Mulher-Maravilha", "Wonder Woman", 1975, "serie", "mm1975", None, [
    ("mulher-maravilha", "Lynda Carter", "pro")], temporadas=[{"n": 1}, {"n": 2}, {"n": 3}], periodo="1975–1979")

# ===== DC: HQs
O("batman-ano-um", "Batman: Ano Um", "Batman: Year One", 1987, "hq", "dc-hq", "Roteiro: Frank Miller · Arte: David Mazzucchelli", [
    ("batman", None, "pro"), ("gordon", None, "pro"), ("mulher-gato", None, "coa")], edicoes=ED("Batman", 404, 407))
O("o-cavaleiro-das-trevas-hq", "Batman: O Cavaleiro das Trevas", "The Dark Knight Returns", 1986, "hq", "dc-elseworlds", "Roteiro e arte: Frank Miller · Arte-final: Klaus Janson · Cores: Lynn Varley", [
    ("batman", None, "pro"), ("coringa", None, "ant"), ("superman", None, "coa"), ("gordon", None, "coa"),
    ("duas-caras", None, "ant")], edicoes=ED("The Dark Knight Returns", 1, 4))
O("a-piada-mortal", "Batman: A Piada Mortal", "Batman: The Killing Joke", 1988, "hq", "dc-hq", "Roteiro: Alan Moore · Arte: Brian Bolland", [
    ("coringa", None, "pro"), ("batman", None, "pro"), ("gordon", None, "coa")])
O("o-longo-dia-das-bruxas", "Batman: O Longo Dia das Bruxas", "Batman: The Long Halloween", 1996, "hq", "dc-hq", "Roteiro: Jeph Loeb · Arte: Tim Sale", [
    ("batman", None, "pro"), ("duas-caras", None, "ant"), ("gordon", None, "coa"), ("mulher-gato", None, "coa"),
    ("coringa", None, "par"), ("charada", None, "par")], edicoes=ED("The Long Halloween", 1, 13), periodo="1996–1997")
O("a-morte-do-superman", "A Morte do Superman", "The Death of Superman", 1992, "hq", "dc-hq", "Dan Jurgens, Louise Simonson, Roger Stern, Jerry Ordway e outros", [
    ("superman", None, "pro"), ("lois-lane", None, "coa")], periodo="1992–1993")
O("grandes-astros-superman", "Grandes Astros: Superman", "All-Star Superman", 2005, "hq", "dc-elseworlds", "Roteiro: Grant Morrison · Arte: Frank Quitely", [
    ("superman", None, "pro"), ("lex-luthor", None, "ant"), ("lois-lane", None, "coa")], edicoes=ED("All-Star Superman", 1, 12), periodo="2005–2008")
O("entre-a-foice-e-o-martelo", "Superman: Entre a Foice e o Martelo", "Superman: Red Son", 2003, "hq", "dc-elseworlds", "Roteiro: Mark Millar · Arte: Dave Johnson e Kilian Plunkett", [
    ("superman", None, "pro"), ("lex-luthor", None, "coa"), ("batman", None, "ant"), ("mulher-maravilha", None, "coa")], edicoes=ED("Superman: Red Son", 1, 3))
O("amor-louco", "Amor Louco", "Mad Love", 1994, "hq", "dcau", "Roteiro: Paul Dini · Arte: Bruce Timm", [
    ("arlequina", None, "pro"), ("coringa", None, "ant"), ("batman", None, "coa")])
O("mulher-maravilha-deuses-e-mortais", "Mulher-Maravilha: Deuses e Mortais", "Wonder Woman: Gods and Mortals", 1987, "hq", "dc-hq", "Roteiro: George Pérez, Greg Potter e Len Wein · Arte: George Pérez", [
    ("mulher-maravilha", None, "pro")], edicoes=ED("Wonder Woman", 1, 7))

# ===== Marvel: MCU
O("homem-de-ferro-2008", "Homem de Ferro", "Iron Man", 2008, "filme", "mcu", "Direção: Jon Favreau", [
    ("homem-de-ferro", "Robert Downey Jr.", "pro", MR), ("nick-fury", "Samuel L. Jackson", "par", {"obs": "cena pós-créditos"})])
O("o-incrivel-hulk-2008", "O Incrível Hulk", "The Incredible Hulk", 2008, "filme", "mcu", "Direção: Louis Leterrier", [
    ("hulk", "Edward Norton", "pro"), ("homem-de-ferro", "Robert Downey Jr.", "par", MR)])
O("homem-de-ferro-2-2010", "Homem de Ferro 2", "Iron Man 2", 2010, "filme", "mcu", "Direção: Jon Favreau", [
    ("homem-de-ferro", "Robert Downey Jr.", "pro", MR), ("viuva-negra", "Scarlett Johansson", "coa"),
    ("nick-fury", "Samuel L. Jackson", "coa")])
O("thor-2011", "Thor", "Thor", 2011, "filme", "mcu", "Direção: Kenneth Branagh", [
    ("thor", "Chris Hemsworth", "pro"), ("loki", "Tom Hiddleston", "ant"), ("gaviao-arqueiro", "Jeremy Renner", "par"),
    ("nick-fury", "Samuel L. Jackson", "par")])
O("capitao-america-primeiro-vingador-2011", "Capitão América: O Primeiro Vingador", "Captain America: The First Avenger", 2011, "filme", "mcu", "Direção: Joe Johnston", [
    ("capitao-america", "Chris Evans", "pro"), ("caveira-vermelha", "Hugo Weaving", "ant"),
    ("soldado-invernal", "Sebastian Stan", "coa", {"obs": "como Bucky Barnes"}), ("nick-fury", "Samuel L. Jackson", "par")])
O("os-vingadores-2012", "Os Vingadores: The Avengers", "The Avengers", 2012, "filme", "mcu", "Direção: Joss Whedon", [
    ("homem-de-ferro", "Robert Downey Jr.", "pro", MR), ("capitao-america", "Chris Evans", "pro"), ("thor", "Chris Hemsworth", "pro"),
    ("hulk", "Mark Ruffalo", "pro"), ("viuva-negra", "Scarlett Johansson", "pro"), ("gaviao-arqueiro", "Jeremy Renner", "pro"),
    ("loki", "Tom Hiddleston", "ant"), ("nick-fury", "Samuel L. Jackson", "coa"),
    ("thanos", "Damion Poitier", "par", {"obs": "cena pós-créditos"})])
O("capitao-america-soldado-invernal-2014", "Capitão América 2: O Soldado Invernal", "Captain America: The Winter Soldier", 2014, "filme", "mcu", "Direção: Anthony e Joe Russo", [
    ("capitao-america", "Chris Evans", "pro"), ("soldado-invernal", "Sebastian Stan", "ant"), ("viuva-negra", "Scarlett Johansson", "coa"),
    ("falcao", "Anthony Mackie", "coa"), ("nick-fury", "Samuel L. Jackson", "coa")])
O("guardioes-da-galaxia-2014", "Guardiões da Galáxia", "Guardians of the Galaxy", 2014, "filme", "mcu", "Direção: James Gunn", [
    ("senhor-das-estrelas", "Chris Pratt", "pro"), ("gamora", "Zoe Saldaña", "pro"), ("rocket", "Bradley Cooper", "pro", VOZ),
    ("groot", "Vin Diesel", "pro", VOZ), ("thanos", "Josh Brolin", "par")])
O("vingadores-era-de-ultron-2015", "Vingadores: Era de Ultron", "Avengers: Age of Ultron", 2015, "filme", "mcu", "Direção: Joss Whedon", [
    ("homem-de-ferro", "Robert Downey Jr.", "pro", MR), ("capitao-america", "Chris Evans", "pro"), ("thor", "Chris Hemsworth", "pro"),
    ("hulk", "Mark Ruffalo", "pro"), ("viuva-negra", "Scarlett Johansson", "pro"), ("gaviao-arqueiro", "Jeremy Renner", "pro"),
    ("ultron", "James Spader", "ant"), ("feiticeira-escarlate", "Elizabeth Olsen", "coa"), ("nick-fury", "Samuel L. Jackson", "coa"),
    ("thanos", "Josh Brolin", "par")])
O("capitao-america-guerra-civil-2016", "Capitão América: Guerra Civil", "Captain America: Civil War", 2016, "filme", "mcu", "Direção: Anthony e Joe Russo", [
    ("capitao-america", "Chris Evans", "pro"), ("homem-de-ferro", "Robert Downey Jr.", "pro", MR),
    ("viuva-negra", "Scarlett Johansson", "coa"), ("soldado-invernal", "Sebastian Stan", "coa"), ("falcao", "Anthony Mackie", "coa"),
    ("pantera-negra", "Chadwick Boseman", "coa", {"obs": "estreia no MCU"}), ("homem-aranha", "Tom Holland", "coa", {"obs": "estreia no MCU"}),
    ("feiticeira-escarlate", "Elizabeth Olsen", "coa"), ("gaviao-arqueiro", "Jeremy Renner", "coa")])
O("doutor-estranho-2016", "Doutor Estranho", "Doctor Strange", 2016, "filme", "mcu", "Direção: Scott Derrickson", [
    ("doutor-estranho", "Benedict Cumberbatch", "pro"), ("thor", "Chris Hemsworth", "par")])
O("homem-aranha-de-volta-ao-lar-2017", "Homem-Aranha: De Volta ao Lar", "Spider-Man: Homecoming", 2017, "filme", "mcu", "Direção: Jon Watts", [
    ("homem-aranha", "Tom Holland", "pro"), ("abutre", "Michael Keaton", "ant"), ("homem-de-ferro", "Robert Downey Jr.", "coa", MR),
    ("capitao-america", "Chris Evans", "par")])
O("thor-ragnarok-2017", "Thor: Ragnarok", "Thor: Ragnarok", 2017, "filme", "mcu", "Direção: Taika Waititi", [
    ("thor", "Chris Hemsworth", "pro"), ("hela", "Cate Blanchett", "ant"), ("hulk", "Mark Ruffalo", "coa"),
    ("loki", "Tom Hiddleston", "coa"), ("doutor-estranho", "Benedict Cumberbatch", "par")])
O("pantera-negra-2018", "Pantera Negra", "Black Panther", 2018, "filme", "mcu", "Direção: Ryan Coogler", [
    ("pantera-negra", "Chadwick Boseman", "pro"), ("killmonger", "Michael B. Jordan", "ant"), ("shuri", "Letitia Wright", "coa"),
    ("soldado-invernal", "Sebastian Stan", "par")])
O("vingadores-guerra-infinita-2018", "Vingadores: Guerra Infinita", "Avengers: Infinity War", 2018, "filme", "mcu", "Direção: Anthony e Joe Russo", [
    ("thanos", "Josh Brolin", "ant"), ("homem-de-ferro", "Robert Downey Jr.", "pro", MR), ("thor", "Chris Hemsworth", "pro"),
    ("doutor-estranho", "Benedict Cumberbatch", "pro"), ("capitao-america", "Chris Evans", "coa"), ("hulk", "Mark Ruffalo", "coa"),
    ("viuva-negra", "Scarlett Johansson", "coa"), ("homem-aranha", "Tom Holland", "coa"), ("pantera-negra", "Chadwick Boseman", "coa"),
    ("senhor-das-estrelas", "Chris Pratt", "coa"), ("gamora", "Zoe Saldaña", "coa"), ("feiticeira-escarlate", "Elizabeth Olsen", "coa"),
    ("soldado-invernal", "Sebastian Stan", "coa"), ("falcao", "Anthony Mackie", "coa"), ("shuri", "Letitia Wright", "coa"),
    ("groot", "Vin Diesel", "coa", VOZ), ("rocket", "Bradley Cooper", "coa", VOZ), ("loki", "Tom Hiddleston", "par"),
    ("nick-fury", "Samuel L. Jackson", "par", {"obs": "cena pós-créditos"})])
O("vingadores-ultimato-2019", "Vingadores: Ultimato", "Avengers: Endgame", 2019, "filme", "mcu", "Direção: Anthony e Joe Russo", [
    ("homem-de-ferro", "Robert Downey Jr.", "pro", MR), ("capitao-america", "Chris Evans", "pro"), ("thor", "Chris Hemsworth", "pro"),
    ("hulk", "Mark Ruffalo", "pro"), ("viuva-negra", "Scarlett Johansson", "pro"), ("gaviao-arqueiro", "Jeremy Renner", "pro"),
    ("thanos", "Josh Brolin", "ant"), ("capita-marvel", "Brie Larson", "coa"), ("homem-aranha", "Tom Holland", "coa"),
    ("pantera-negra", "Chadwick Boseman", "coa"), ("doutor-estranho", "Benedict Cumberbatch", "coa"),
    ("senhor-das-estrelas", "Chris Pratt", "coa"), ("gamora", "Zoe Saldaña", "coa"), ("rocket", "Bradley Cooper", "coa", VOZ),
    ("feiticeira-escarlate", "Elizabeth Olsen", "coa"), ("falcao", "Anthony Mackie", "coa"), ("soldado-invernal", "Sebastian Stan", "par"),
    ("loki", "Tom Hiddleston", "par"), ("shuri", "Letitia Wright", "par")])
O("homem-aranha-longe-de-casa-2019", "Homem-Aranha: Longe de Casa", "Spider-Man: Far From Home", 2019, "filme", "mcu", "Direção: Jon Watts", [
    ("homem-aranha", "Tom Holland", "pro"), ("nick-fury", "Samuel L. Jackson", "coa"),
    ("jameson", "J.K. Simmons", "par", {"obs": "cena pós-créditos"})])
O("viuva-negra-2021", "Viúva Negra", "Black Widow", 2021, "filme", "mcu", "Direção: Cate Shortland", [
    ("viuva-negra", "Scarlett Johansson", "pro")])
O("homem-aranha-sem-volta-para-casa-2021", "Homem-Aranha: Sem Volta para Casa", "Spider-Man: No Way Home", 2021, "filme", "mcu", "Direção: Jon Watts", [
    ("homem-aranha", "Tom Holland", "pro"), ("homem-aranha", "Tobey Maguire", "coa", {"u": "raimi", "dub": "Manolo Rey"}),
    ("homem-aranha", "Andrew Garfield", "coa", {"u": "webb", "dub": "Sérgio Cantú"}), ("doutor-estranho", "Benedict Cumberbatch", "coa"),
    ("duende-verde", "Willem Dafoe", "ant", {"u": "raimi"}), ("doutor-octopus", "Alfred Molina", "ant", {"u": "raimi"}),
    ("electro", "Jamie Foxx", "ant", {"u": "webb"}), ("jameson", "J.K. Simmons", "par"), ("demolidor", "Charlie Cox", "par"),
    ("venom", "Tom Hardy", "par", {"u": "sony-spider", "obs": "cena pós-créditos"})])
O("thor-amor-e-trovao-2022", "Thor: Amor e Trovão", "Thor: Love and Thunder", 2022, "filme", "mcu", "Direção: Taika Waititi", [
    ("thor", "Chris Hemsworth", "pro"), ("gorr", "Christian Bale", "ant")])
O("pantera-negra-wakanda-para-sempre-2022", "Pantera Negra: Wakanda para Sempre", "Black Panther: Wakanda Forever", 2022, "filme", "mcu", "Direção: Ryan Coogler", [
    ("shuri", "Letitia Wright", "pro")])
O("deadpool-e-wolverine-2024", "Deadpool & Wolverine", "Deadpool & Wolverine", 2024, "filme", "mcu", "Direção: Shawn Levy", [
    ("deadpool", "Ryan Reynolds", "pro", {"u": "fox-xmen"}), ("wolverine", "Hugh Jackman", "pro", {"u": "fox-xmen", "dub": "Luiz Feier Motta"}),
    ("blade", "Wesley Snipes", "par", {"u": "blade-snipes"}), ("tocha-humana", "Chris Evans", "par", {"u": "qf-2005"})])
O("vingadores-doutor-destino-2026", "Vingadores: Doutor Destino", "Avengers: Doomsday", 2026, "filme", "mcu", "Direção: Anthony e Joe Russo", [
    ("doutor-destino", "Robert Downey Jr.", "ant"), ("thor", "Chris Hemsworth", "coa"), ("loki", "Tom Hiddleston", "coa"),
    ("falcao", "Anthony Mackie", "coa", {"obs": "agora como Capitão América"}), ("soldado-invernal", "Sebastian Stan", "coa"),
    ("shuri", "Letitia Wright", "coa"), ("senhor-fantastico", "Pedro Pascal", "coa"), ("mulher-invisivel", "Vanessa Kirby", "coa"),
    ("tocha-humana", "Joseph Quinn", "coa"), ("coisa", "Ebon Moss-Bachrach", "coa"),
    ("professor-x", "Patrick Stewart", "coa", {"u": "fox-xmen"}), ("magneto", "Ian McKellen", "coa", {"u": "fox-xmen"}),
    ("ciclope", "James Marsden", "coa", {"u": "fox-xmen"}), ("mistica", "Rebecca Romijn", "coa", {"u": "fox-xmen"})],
    status="em-breve", data="2026-12-17", nota="Elenco ainda parcial, a partir do que a Marvel anunciou. O papel de cada um entra depois da estreia.")
O("vingadores-guerras-secretas-2027", "Vingadores: Guerras Secretas", "Avengers: Secret Wars", 2027, "filme", "mcu", "Direção: Anthony e Joe Russo", [],
    status="em-breve", nota="Previsto para 2027. Elenco ainda não divulgado.")

# ===== Marvel: outros universos no cinema e na TV
MRey = {"dub": "Manolo Rey"}
SC = {"dub": "Sérgio Cantú"}
O("homem-aranha-2002", "Homem-Aranha", "Spider-Man", 2002, "filme", "raimi", "Direção: Sam Raimi", [
    ("homem-aranha", "Tobey Maguire", "pro", MRey), ("duende-verde", "Willem Dafoe", "ant"), ("mary-jane", "Kirsten Dunst", "coa"),
    ("jameson", "J.K. Simmons", "coa")])
O("homem-aranha-2-2004", "Homem-Aranha 2", "Spider-Man 2", 2004, "filme", "raimi", "Direção: Sam Raimi", [
    ("homem-aranha", "Tobey Maguire", "pro", MRey), ("doutor-octopus", "Alfred Molina", "ant"), ("mary-jane", "Kirsten Dunst", "coa"),
    ("jameson", "J.K. Simmons", "coa")])
O("homem-aranha-3-2007", "Homem-Aranha 3", "Spider-Man 3", 2007, "filme", "raimi", "Direção: Sam Raimi", [
    ("homem-aranha", "Tobey Maguire", "pro", MRey), ("venom", "Topher Grace", "ant"), ("mary-jane", "Kirsten Dunst", "coa"),
    ("jameson", "J.K. Simmons", "coa")])
O("o-espetacular-homem-aranha-2012", "O Espetacular Homem-Aranha", "The Amazing Spider-Man", 2012, "filme", "webb", "Direção: Marc Webb", [
    ("homem-aranha", "Andrew Garfield", "pro", SC), ("gwen-stacy", "Emma Stone", "coa")])
O("o-espetacular-homem-aranha-2-2014", "O Espetacular Homem-Aranha 2: A Ameaça de Electro", "The Amazing Spider-Man 2", 2014, "filme", "webb", "Direção: Marc Webb", [
    ("homem-aranha", "Andrew Garfield", "pro", SC), ("electro", "Jamie Foxx", "ant"), ("gwen-stacy", "Emma Stone", "coa"),
    ("duende-verde", "Dane DeHaan", "ant", {"obs": "Harry Osborn"})])
O("homem-aranha-no-aranhaverso-2018", "Homem-Aranha no Aranhaverso", "Spider-Man: Into the Spider-Verse", 2018, "animacao", "aranhaverso", "Direção: Bob Persichetti, Peter Ramsey e Rodney Rothman", [
    ("miles-morales", "Shameik Moore", "pro"), ("homem-aranha", "Jake Johnson", "coa", {"obs": "Peter B. Parker"}),
    ("gwen-stacy", "Hailee Steinfeld", "coa", {"obs": "Spider-Gwen"}), ("rei-do-crime", "Liev Schreiber", "ant")])
O("homem-aranha-atraves-do-aranhaverso-2023", "Homem-Aranha: Através do Aranhaverso", "Spider-Man: Across the Spider-Verse", 2023, "animacao", "aranhaverso", "Direção: Joaquim Dos Santos, Kemp Powers e Justin K. Thompson", [
    ("miles-morales", "Shameik Moore", "pro"), ("gwen-stacy", "Hailee Steinfeld", "pro", {"obs": "Spider-Gwen"}),
    ("homem-aranha", "Jake Johnson", "coa", {"obs": "Peter B. Parker"})])
O("venom-2018", "Venom", "Venom", 2018, "filme", "sony-spider", "Direção: Ruben Fleischer", [("venom", "Tom Hardy", "pro")])
O("venom-tempo-de-carnificina-2021", "Venom: Tempo de Carnificina", "Venom: Let There Be Carnage", 2021, "filme", "sony-spider", "Direção: Andy Serkis", [
    ("venom", "Tom Hardy", "pro"), ("carnificina", "Woody Harrelson", "ant")])
O("venom-a-ultima-rodada-2024", "Venom: A Última Rodada", "Venom: The Last Dance", 2024, "filme", "sony-spider", "Direção: Kelly Marcel", [("venom", "Tom Hardy", "pro")])
XM = [("professor-x", "Patrick Stewart", "coa"), ("magneto", "Ian McKellen", "ant"), ("tempestade", "Halle Berry", "coa"),
      ("jean-grey", "Famke Janssen", "coa"), ("ciclope", "James Marsden", "coa"), ("mistica", "Rebecca Romijn", "ant")]
O("x-men-o-filme-2000", "X-Men: O Filme", "X-Men", 2000, "filme", "fox-xmen", "Direção: Bryan Singer", [("wolverine", "Hugh Jackman", "pro", IB)] + XM)
O("x-men-2-2003", "X-Men 2", "X2", 2003, "filme", "fox-xmen", "Direção: Bryan Singer", [("wolverine", "Hugh Jackman", "pro", IB)] + XM)
O("x-men-o-confronto-final-2006", "X-Men: O Confronto Final", "X-Men: The Last Stand", 2006, "filme", "fox-xmen", "Direção: Brett Ratner", [
    ("wolverine", "Hugh Jackman", "pro", IB), ("jean-grey", "Famke Janssen", "ant", {"obs": "como Fênix"}), ("magneto", "Ian McKellen", "ant"),
    ("professor-x", "Patrick Stewart", "coa"), ("tempestade", "Halle Berry", "coa"), ("mistica", "Rebecca Romijn", "coa"),
    ("ciclope", "James Marsden", "par")])
O("x-men-origens-wolverine-2009", "X-Men Origens: Wolverine", "X-Men Origins: Wolverine", 2009, "filme", "fox-xmen", "Direção: Gavin Hood", [
    ("wolverine", "Hugh Jackman", "pro", IB), ("deadpool", "Ryan Reynolds", "coa", {"obs": "Wade Wilson / Arma XI"})])
O("x-men-dias-de-um-futuro-esquecido-2014", "X-Men: Dias de um Futuro Esquecido", "X-Men: Days of Future Past", 2014, "filme", "fox-xmen", "Direção: Bryan Singer", [
    ("wolverine", "Hugh Jackman", "pro", IB), ("professor-x", "James McAvoy", "coa", {"obs": "jovem"}), ("professor-x", "Patrick Stewart", "coa"),
    ("magneto", "Michael Fassbender", "ant", {"obs": "jovem"}), ("magneto", "Ian McKellen", "coa"), ("mistica", "Jennifer Lawrence", "coa"),
    ("tempestade", "Halle Berry", "par")])
O("logan-2017", "Logan", "Logan", 2017, "filme", "fox-xmen", "Direção: James Mangold", [
    ("wolverine", "Hugh Jackman", "pro", IB), ("professor-x", "Patrick Stewart", "coa")])
O("deadpool-2016", "Deadpool", "Deadpool", 2016, "filme", "fox-xmen", "Direção: Tim Miller", [("deadpool", "Ryan Reynolds", "pro")])
O("deadpool-2-2018", "Deadpool 2", "Deadpool 2", 2018, "filme", "fox-xmen", "Direção: David Leitch", [
    ("deadpool", "Ryan Reynolds", "pro"), ("cable", "Josh Brolin", "coa")])
QF5 = [("senhor-fantastico", "Ioan Gruffudd", "pro"), ("mulher-invisivel", "Jessica Alba", "pro"), ("tocha-humana", "Chris Evans", "pro"),
       ("coisa", "Michael Chiklis", "pro"), ("doutor-destino", "Julian McMahon", "ant")]
O("quarteto-fantastico-2005", "Quarteto Fantástico", "Fantastic Four", 2005, "filme", "qf-2005", "Direção: Tim Story", QF5)
O("quarteto-fantastico-e-o-surfista-prateado-2007", "Quarteto Fantástico e o Surfista Prateado", "Fantastic Four: Rise of the Silver Surfer", 2007, "filme", "qf-2005", "Direção: Tim Story", QF5)
O("quarteto-fantastico-2015", "Quarteto Fantástico", "Fantastic Four", 2015, "filme", "qf-2015", "Direção: Josh Trank", [
    ("senhor-fantastico", "Miles Teller", "pro"), ("mulher-invisivel", "Kate Mara", "pro"), ("tocha-humana", "Michael B. Jordan", "pro"),
    ("coisa", "Jamie Bell", "pro"), ("doutor-destino", "Toby Kebbell", "ant")])
O("hulk-2003", "Hulk", "Hulk", 2003, "filme", "hulk-2003", "Direção: Ang Lee", [("hulk", "Eric Bana", "pro")])
O("o-incrivel-hulk-1977", "O Incrível Hulk", "The Incredible Hulk", 1977, "serie", "hulk-tv", "Desenvolvimento: Kenneth Johnson", [
    ("hulk", "Bill Bixby", "pro", {"obs": "como David Banner"}), ("hulk", "Lou Ferrigno", "pro", {"obs": "como Hulk"})],
    temporadas=[{"n": i} for i in range(1, 6)], periodo="1977–1982")
O("x-men-a-serie-animada", "X-Men: A Série Animada", "X-Men: The Animated Series", 1992, "desenho", "xmen-tas", None, [
    ("wolverine", "Cal Dodd", "pro", IB), ("ciclope", "Norm Spencer", "pro"), ("tempestade", "Alison Sealy-Smith", "pro"),
    ("jean-grey", "Catherine Disher", "coa"), ("professor-x", "Cedric Smith", "coa"), ("magneto", "David Hemblen", "ant")],
    temporadas=[13, 13, 19, 21, 10], periodo="1992–1997")
O("x-men-97", "X-Men '97", "X-Men '97", 2024, "desenho", "xmen-tas", "Criação: Beau DeMayo", [
    ("wolverine", "Cal Dodd", "pro", {"dub": "Luiz Feier Motta"}), ("ciclope", "Ray Chase", "pro"), ("tempestade", "Alison Sealy-Smith", "pro"),
    ("jean-grey", "Jennifer Hale", "pro"), ("magneto", "Matthew Waterson", "coa"), ("professor-x", "Ross Marquand", "par")],
    temporadas=[10], periodo="2024–")

# ===== Marvel: HQs
O("a-ultima-cacada-de-kraven", "A Última Caçada de Kraven", "Kraven's Last Hunt", 1987, "hq", "marvel-616", "Roteiro: J. M. DeMatteis · Arte: Mike Zeck", [
    ("homem-aranha", None, "pro"), ("kraven", None, "ant"), ("mary-jane", None, "coa")],
    edicoes=["Web of Spider-Man #31", "The Amazing Spider-Man #293", "The Spectacular Spider-Man #131",
             "Web of Spider-Man #32", "The Amazing Spider-Man #294", "The Spectacular Spider-Man #132"])
O("a-noite-em-que-gwen-stacy-morreu", "A Noite em que Gwen Stacy Morreu", "The Night Gwen Stacy Died", 1973, "hq", "marvel-616", "Roteiro: Gerry Conway · Arte: Gil Kane e John Romita", [
    ("homem-aranha", None, "pro"), ("gwen-stacy", None, "coa"), ("duende-verde", None, "ant"), ("mary-jane", None, "coa")],
    edicoes=ED("The Amazing Spider-Man", 121, 122))
O("guerra-civil-hq", "Guerra Civil", "Civil War", 2006, "hq", "marvel-616", "Roteiro: Mark Millar · Arte: Steve McNiven", [
    ("homem-de-ferro", None, "pro"), ("capitao-america", None, "pro"), ("homem-aranha", None, "coa")],
    edicoes=ED("Civil War", 1, 7), periodo="2006–2007")
O("guerras-secretas-1984", "Guerras Secretas", "Secret Wars", 1984, "hq", "marvel-616", "Roteiro: Jim Shooter · Arte: Mike Zeck e Bob Layton", [
    ("capitao-america", None, "pro"), ("doutor-destino", None, "ant"), ("homem-aranha", None, "coa"), ("thor", None, "coa"),
    ("hulk", None, "coa"), ("wolverine", None, "coa"), ("magneto", None, "coa"), ("senhor-fantastico", None, "coa"), ("coisa", None, "coa")],
    edicoes=ED("Marvel Super Heroes Secret Wars", 1, 12), periodo="1984–1985")
O("guerras-secretas-2015", "Guerras Secretas", "Secret Wars", 2015, "hq", "marvel-616", "Roteiro: Jonathan Hickman · Arte: Esad Ribić", [
    ("doutor-destino", None, "pro"), ("senhor-fantastico", None, "pro"), ("miles-morales", None, "coa"), ("thanos", None, "par")],
    edicoes=ED("Secret Wars", 1, 9), periodo="2015–2016")
O("desafio-infinito", "Desafio Infinito", "The Infinity Gauntlet", 1991, "hq", "marvel-616", "Roteiro: Jim Starlin · Arte: George Pérez e Ron Lim", [
    ("thanos", None, "pro"), ("capitao-america", None, "coa"), ("thor", None, "coa"), ("hulk", None, "coa"),
    ("homem-de-ferro", None, "coa"), ("homem-aranha", None, "coa"), ("doutor-estranho", None, "coa")],
    edicoes=ED("The Infinity Gauntlet", 1, 6))
O("o-velho-logan", "O Velho Logan", "Old Man Logan", 2008, "hq", "marvel-alt", "Roteiro: Mark Millar · Arte: Steve McNiven", [
    ("wolverine", None, "pro"), ("gaviao-arqueiro", None, "coa"), ("hulk", None, "ant")],
    edicoes=ED("Wolverine", 66, 72) + ["Giant-Size Old Man Logan"], periodo="2008–2009")
O("arma-x", "Arma X", "Weapon X", 1991, "hq", "marvel-616", "Roteiro e arte: Barry Windsor-Smith", [("wolverine", None, "pro")],
  edicoes=ED("Marvel Comics Presents", 72, 84))
O("a-saga-da-fenix-negra", "A Saga da Fênix Negra", "The Dark Phoenix Saga", 1980, "hq", "marvel-616", "Roteiro: Chris Claremont · Arte: John Byrne", [
    ("jean-grey", None, "pro"), ("ciclope", None, "coa"), ("wolverine", None, "coa"), ("tempestade", None, "coa"), ("professor-x", None, "coa")],
    edicoes=ED("X-Men", 129, 137))
O("dias-de-um-futuro-esquecido-hq", "Dias de um Futuro Esquecido", "Days of Future Past", 1981, "hq", "marvel-616", "Roteiro: Chris Claremont · Arte: John Byrne", [
    ("wolverine", None, "coa"), ("tempestade", None, "coa"), ("mistica", None, "ant"), ("professor-x", None, "par")],
    edicoes=["X-Men #141", "The Uncanny X-Men #142"])
O("o-demonio-na-garrafa", "O Demônio na Garrafa", "Demon in a Bottle", 1979, "hq", "marvel-616", "Roteiro: David Michelinie e Bob Layton · Arte: John Romita Jr. e Bob Layton", [
    ("homem-de-ferro", None, "pro")], edicoes=ED("Iron Man", 120, 128))
O("o-soldado-invernal-hq", "O Soldado Invernal", "Winter Soldier", 2005, "hq", "marvel-616", "Roteiro: Ed Brubaker · Arte: Steve Epting e Michael Lark", [
    ("capitao-america", None, "pro"), ("soldado-invernal", None, "ant"), ("caveira-vermelha", None, "par")],
    edicoes=ED("Captain America", 1, 14, exceto=(10,)), periodo="2005–2006")
O("planeta-hulk", "Planeta Hulk", "Planet Hulk", 2006, "hq", "marvel-616", "Roteiro: Greg Pak · Arte: Carlo Pagulayan e Aaron Lopresti", [
    ("hulk", None, "pro")], edicoes=ED("The Incredible Hulk", 92, 105), periodo="2006–2007")
O("uma-nacao-sob-nossos-pes", "Pantera Negra: Uma Nação Sob Nossos Pés", "Black Panther: A Nation Under Our Feet", 2016, "hq", "marvel-616", "Roteiro: Ta-Nehisi Coates · Arte: Brian Stelfreeze e Chris Sprouse", [
    ("pantera-negra", None, "pro"), ("shuri", None, "coa")], edicoes=ED("Black Panther", 1, 12), periodo="2016–2017")
O("deadpool-mata-o-universo-marvel", "Deadpool Mata o Universo Marvel", "Deadpool Kills the Marvel Universe", 2012, "hq", "marvel-alt", "Roteiro: Cullen Bunn · Arte: Dalibor Talajić", [
    ("deadpool", None, "pro"), ("homem-aranha", None, "par"), ("wolverine", None, "par")], edicoes=ED("Deadpool Kills the Marvel Universe", 1, 4))
O("ultimate-homem-aranha-miles", "Ultimate Homem-Aranha: Miles Morales", "Ultimate Comics: Spider-Man", 2011, "hq", "ultimate", "Roteiro: Brian Michael Bendis · Arte: Sara Pichelli", [
    ("miles-morales", None, "pro")], edicoes=ED("Ultimate Comics: Spider-Man", 1, 28), periodo="2011–2013")
O("venom-protetor-letal", "Venom: Protetor Letal", "Venom: Lethal Protector", 1993, "hq", "marvel-616", "Roteiro: David Michelinie · Arte: Mark Bagley", [
    ("venom", None, "pro"), ("homem-aranha", None, "coa")], edicoes=ED("Venom: Lethal Protector", 1, 6))

# ===== Outras editoras
O("invencivel-serie", "Invencível", "Invincible", 2021, "desenho", "invencivel-serie", "Baseado na HQ de Robert Kirkman, Cory Walker e Ryan Ottley", [
    ("invencivel", "Steven Yeun", "pro"), ("omni-man", "J.K. Simmons", "ant")], temporadas=[8, 8, 8], periodo="2021–")
O("invencivel-hq", "Invencível", "Invincible", 2003, "hq", "invencivel-hq", "Roteiro: Robert Kirkman · Arte: Cory Walker e Ryan Ottley", [
    ("invencivel", None, "pro"), ("omni-man", None, "ant")], edicoes=ED("Invincible", 1, 144), periodo="2003–2018")
O("tartarugas-ninja-1987", "As Tartarugas Ninja", "Teenage Mutant Ninja Turtles", 1987, "desenho", "tmnt-1987", None, [
    ("leonardo", "Cam Clarke", "pro"), ("michelangelo", "Townsend Coleman", "pro"), ("raphael", "Rob Paulsen", "pro"),
    ("donatello", "Barry Gordon", "pro"), ("destruidor", "James Avery", "ant")], episodios=193, periodo="1987–1996")
O("caos-mutante-2023", "As Tartarugas Ninja: Caos Mutante", "Teenage Mutant Ninja Turtles: Mutant Mayhem", 2023, "animacao", "tmnt-2023", "Direção: Jeff Rowe", [
    ("leonardo", "Nicolas Cantu", "pro"), ("michelangelo", "Shamon Brown Jr.", "pro"), ("raphael", "Brady Noon", "pro"),
    ("donatello", "Micah Abbey", "pro")])
O("tmnt-1-1984", "Tartarugas Ninja #1", "Teenage Mutant Ninja Turtles #1", 1984, "hq", "tmnt-hq", "Roteiro e arte: Kevin Eastman e Peter Laird", [
    ("leonardo", None, "pro"), ("michelangelo", None, "pro"), ("raphael", None, "pro"), ("donatello", None, "pro"),
    ("destruidor", None, "ant")])
O("ben-10-2005", "Ben 10", "Ben 10", 2005, "desenho", "ben10", "Criação: Man of Action", [
    ("ben-10", "Tara Strong", "pro"), ("vilgax", "Steven Blum", "ant")], temporadas=[13, 13, 13, 10], periodo="2005–2008")
O("ben-10-forca-alienigena", "Ben 10: Força Alienígena", "Ben 10: Alien Force", 2008, "desenho", "ben10", "Criação: Man of Action", [
    ("ben-10", "Yuri Lowenthal", "pro"), ("vilgax", "James Remar", "ant")], temporadas=[13, 13, 20], periodo="2008–2010")

# ===== Mais DC
O("batman-eternamente-1995", "Batman Eternamente", "Batman Forever", 1995, "filme", "burton", "Direção: Joel Schumacher", [
    ("batman", "Val Kilmer", "pro"), ("charada", "Jim Carrey", "ant"), ("duas-caras", "Tommy Lee Jones", "ant"),
    ("robin", "Chris O'Donnell", "coa"), ("alfred", "Michael Gough", "coa"), ("gordon", "Pat Hingle", "par")])
O("batman-e-robin-1997", "Batman & Robin", "Batman & Robin", 1997, "filme", "burton", "Direção: Joel Schumacher", [
    ("batman", "George Clooney", "pro"), ("robin", "Chris O'Donnell", "pro"), ("sr-frio", "Arnold Schwarzenegger", "ant"),
    ("hera-venenosa", "Uma Thurman", "ant"), ("bane", "Jeep Swenson", "coa"), ("alfred", "Michael Gough", "coa"),
    ("gordon", "Pat Hingle", "par")])
O("os-jovens-titas-2003", "Os Jovens Titãs", "Teen Titans", 2003, "desenho", "titas-2003", "Desenvolvimento: Glen Murakami", [
    ("robin", "Scott Menville", "pro", {"dub": "Manolo Rey"}), ("estelar", "Hynden Walch", "pro"), ("ravena", "Tara Strong", "pro"),
    ("mutano", "Greg Cipes", "pro"), ("ciborgue", "Khary Payton", "pro"), ("exterminador", "Ron Perlman", "ant", {"obs": "como Slade"})],
    temporadas=[13, 13, 13, 13, 13], periodo="2003–2006")
O("liga-da-justica-sem-limites", "Liga da Justiça Sem Limites", "Justice League Unlimited", 2004, "desenho", "dcau", "Produção: Bruce Timm", [
    ("superman", "George Newbern", "pro"), ("batman", "Kevin Conroy", "pro"), ("mulher-maravilha", "Susan Eisenberg", "pro"),
    ("cacador-de-marte", "Carl Lumbly", "pro"), ("arqueiro-verde", "Kin Shriner", "coa"), ("zatanna", "Jennifer Hale", "par"),
    ("lex-luthor", "Clancy Brown", "ant"), ("darkseid", "Michael Ironside", "ant")], temporadas=[13, 13, 13], periodo="2004–2006")
O("smallville", "Smallville: As Aventuras do Superboy", "Smallville", 2001, "serie", "smallville", "Criação: Alfred Gough e Miles Millar", [
    ("superman", "Tom Welling", "pro", {"obs": "como Clark Kent"}), ("lex-luthor", "Michael Rosenbaum", "ant"), ("lois-lane", "Erica Durance", "coa"),
    ("arqueiro-verde", "Justin Hartley", "coa"), ("supergirl", "Laura Vandervoort", "coa"), ("brainiac", "James Marsters", "ant"),
    ("zod", "Callum Blue", "ant"), ("aquaman", "Alan Ritchson", "par"), ("ciborgue", "Lee Thompson Young", "par"),
    ("zatanna", "Serinda Swan", "par"), ("jor-el", "Terence Stamp", "par", VOZ)],
    temporadas=[21, 23, 22, 22, 22, 22, 20, 22, 21, 22], periodo="2001–2011")
O("arrow-2012", "Arrow", "Arrow", 2012, "serie", "arrowverso", "Criação: Greg Berlanti, Marc Guggenheim e Andrew Kreisberg", [
    ("arqueiro-verde", "Stephen Amell", "pro"), ("exterminador", "Manu Bennett", "ant", {"obs": "como Slade Wilson"}),
    ("flash", "Grant Gustin", "par")], temporadas=[23, 23, 23, 23, 23, 23, 22, 10], periodo="2012–2020")
O("the-flash-2014", "The Flash", "The Flash", 2014, "serie", "arrowverso", "Criação: Greg Berlanti, Andrew Kreisberg e Geoff Johns", [
    ("flash", "Grant Gustin", "pro"), ("arqueiro-verde", "Stephen Amell", "par")],
    temporadas=[23, 23, 23, 23, 22, 19, 18, 20, 13], periodo="2014–2023")
O("supergirl-2015", "Supergirl", "Supergirl", 2015, "serie", "arrowverso", "Criação: Greg Berlanti, Ali Adler e Andrew Kreisberg", [
    ("supergirl", "Melissa Benoist", "pro"), ("superman", "Tyler Hoechlin", "par", {"dub": "Philippe Maia"}), ("flash", "Grant Gustin", "par")],
    temporadas=[20, 22, 23, 22, 19, 20], periodo="2015–2021")
O("aquaman-2018", "Aquaman", "Aquaman", 2018, "filme", "dceu", "Direção: James Wan", [("aquaman", "Jason Momoa", "pro")])
O("mulher-maravilha-1984-2020", "Mulher-Maravilha 1984", "Wonder Woman 1984", 2020, "filme", "dceu", "Direção: Patty Jenkins", [
    ("mulher-maravilha", "Gal Gadot", "pro")])
O("shazam-2019", "Shazam!", "Shazam!", 2019, "filme", "dceu", "Direção: David F. Sandberg", [
    ("shazam", "Zachary Levi", "pro", {"obs": "Shazam adulto"}), ("shazam", "Asher Angel", "pro", {"obs": "Billy Batson"})])
O("shazam-furia-dos-deuses-2023", "Shazam! Fúria dos Deuses", "Shazam! Fury of the Gods", 2023, "filme", "dceu", "Direção: David F. Sandberg", [
    ("shazam", "Zachary Levi", "pro", {"obs": "Shazam adulto"}), ("shazam", "Asher Angel", "pro", {"obs": "Billy Batson"}),
    ("mulher-maravilha", "Gal Gadot", "par")])
O("besouro-azul-2023", "Besouro Azul", "Blue Beetle", 2023, "filme", "dceu", "Direção: Angel Manuel Soto", [("besouro-azul", "Xolo Maridueña", "pro")])
O("lanterna-verde-2011", "Lanterna Verde", "Green Lantern", 2011, "filme", "lanterna-2011", "Direção: Martin Campbell", [
    ("lanterna-verde", "Ryan Reynolds", "pro")])
O("constantine-2005", "Constantine", "Constantine", 2005, "filme", "constantine-2005", "Direção: Francis Lawrence", [
    ("constantine", "Keanu Reeves", "pro")])
O("lanterna-verde-renascimento", "Lanterna Verde: Renascimento", "Green Lantern: Rebirth", 2004, "hq", "dc-hq", "Roteiro: Geoff Johns · Arte: Ethan Van Sciver", [
    ("lanterna-verde", None, "pro"), ("batman", None, "par")], edicoes=ED("Green Lantern: Rebirth", 1, 6), periodo="2004–2005")
O("a-noite-mais-densa", "A Noite Mais Densa", "Blackest Night", 2009, "hq", "dc-hq", "Roteiro: Geoff Johns · Arte: Ivan Reis", [
    ("lanterna-verde", None, "pro"), ("flash", None, "coa"), ("lex-luthor", None, "par")], edicoes=ED("Blackest Night", 1, 8), periodo="2009–2010")

# ===== Mais Marvel
O("capita-marvel-2019", "Capitã Marvel", "Captain Marvel", 2019, "filme", "mcu", "Direção: Anna Boden e Ryan Fleck", [
    ("capita-marvel", "Brie Larson", "pro"), ("nick-fury", "Samuel L. Jackson", "coa")])
O("guardioes-da-galaxia-vol-2-2017", "Guardiões da Galáxia Vol. 2", "Guardians of the Galaxy Vol. 2", 2017, "filme", "mcu", "Direção: James Gunn", [
    ("senhor-das-estrelas", "Chris Pratt", "pro"), ("gamora", "Zoe Saldaña", "pro"), ("rocket", "Bradley Cooper", "pro", VOZ),
    ("groot", "Vin Diesel", "pro", VOZ)])
O("guardioes-da-galaxia-vol-3-2023", "Guardiões da Galáxia Vol. 3", "Guardians of the Galaxy Vol. 3", 2023, "filme", "mcu", "Direção: James Gunn", [
    ("rocket", "Bradley Cooper", "pro", VOZ), ("senhor-das-estrelas", "Chris Pratt", "pro"), ("gamora", "Zoe Saldaña", "coa"),
    ("groot", "Vin Diesel", "coa", VOZ)])
O("doutor-estranho-multiverso-da-loucura-2022", "Doutor Estranho no Multiverso da Loucura", "Doctor Strange in the Multiverse of Madness", 2022, "filme", "mcu", "Direção: Sam Raimi", [
    ("doutor-estranho", "Benedict Cumberbatch", "pro"), ("feiticeira-escarlate", "Elizabeth Olsen", "ant"),
    ("professor-x", "Patrick Stewart", "par", {"obs": "Terra-838"}), ("senhor-fantastico", "John Krasinski", "par", {"obs": "Terra-838"})])
O("wandavision-2021", "WandaVision", "WandaVision", 2021, "serie", "mcu", "Criação: Jac Schaeffer", [
    ("feiticeira-escarlate", "Elizabeth Olsen", "pro")], temporadas=[9], periodo="2021")
O("loki-2021", "Loki", "Loki", 2021, "serie", "mcu", "Criação: Michael Waldron", [("loki", "Tom Hiddleston", "pro")],
  temporadas=[6, 6], periodo="2021–2023")
O("gaviao-arqueiro-2021", "Gavião Arqueiro", "Hawkeye", 2021, "serie", "mcu", "Criação: Jonathan Igla", [
    ("gaviao-arqueiro", "Jeremy Renner", "pro"), ("rei-do-crime", "Vincent D'Onofrio", "ant")], temporadas=[6], periodo="2021")
O("falcao-e-o-soldado-invernal-2021", "Falcão e o Soldado Invernal", "The Falcon and the Winter Soldier", 2021, "serie", "mcu", "Criação: Malcolm Spellman", [
    ("falcao", "Anthony Mackie", "pro"), ("soldado-invernal", "Sebastian Stan", "pro")], temporadas=[6], periodo="2021")
O("capitao-america-admiravel-mundo-novo-2025", "Capitão América: Admirável Mundo Novo", "Captain America: Brave New World", 2025, "filme", "mcu", "Direção: Julius Onah", [
    ("falcao", "Anthony Mackie", "pro", {"obs": "agora como Capitão América"})])
O("quarteto-fantastico-primeiros-passos-2025", "Quarteto Fantástico: Primeiros Passos", "The Fantastic Four: First Steps", 2025, "filme", "mcu", "Direção: Matt Shakman", [
    ("senhor-fantastico", "Pedro Pascal", "pro"), ("mulher-invisivel", "Vanessa Kirby", "pro"), ("tocha-humana", "Joseph Quinn", "pro"),
    ("coisa", "Ebon Moss-Bachrach", "pro")], nota="Se passa na Terra-828, outro universo dentro do MCU.")
O("demolidor-2015", "Demolidor", "Daredevil", 2015, "serie", "marvel-netflix", "Criação: Drew Goddard", [
    ("demolidor", "Charlie Cox", "pro"), ("rei-do-crime", "Vincent D'Onofrio", "ant"), ("justiceiro", "Jon Bernthal", "coa", {"obs": "2ª temporada"})],
    temporadas=[13, 13, 13], periodo="2015–2018")
O("o-justiceiro-2017", "O Justiceiro", "The Punisher", 2017, "serie", "marvel-netflix", "Criação: Steve Lightfoot", [
    ("justiceiro", "Jon Bernthal", "pro")], temporadas=[13, 13], periodo="2017–2019")
O("blade-1998", "Blade: O Caçador de Vampiros", "Blade", 1998, "filme", "blade-snipes", "Direção: Stephen Norrington", [("blade", "Wesley Snipes", "pro")])
O("blade-2-2002", "Blade II: O Caçador de Vampiros", "Blade II", 2002, "filme", "blade-snipes", "Direção: Guillermo del Toro", [("blade", "Wesley Snipes", "pro")])
O("motoqueiro-fantasma-2007", "Motoqueiro Fantasma", "Ghost Rider", 2007, "filme", "motoqueiro-2007", "Direção: Mark Steven Johnson", [
    ("motoqueiro-fantasma", "Nicolas Cage", "pro")])

# ===== Mais de outras editoras
O("spawn-1992", "Spawn", "Spawn", 1992, "hq", "spawn-hq", "Criação: Todd McFarlane", [("spawn", None, "pro")], nota="Série mensal publicada desde 1992.")
O("spawn-1997", "Spawn: O Soldado do Inferno", "Spawn", 1997, "filme", "spawn-1997", "Direção: Mark A.Z. Dippé", [("spawn", "Michael Jai White", "pro")])
O("hellboy-semente-da-destruicao", "Hellboy: Semente da Destruição", "Hellboy: Seed of Destruction", 1994, "hq", "hellboy-hq", "História e arte: Mike Mignola · Roteiro: John Byrne", [
    ("hellboy", None, "pro")], edicoes=ED("Hellboy: Seed of Destruction", 1, 4))
O("hellboy-2004", "Hellboy", "Hellboy", 2004, "filme", "hellboy-del-toro", "Direção: Guillermo del Toro", [("hellboy", "Ron Perlman", "pro")])
O("hellboy-2-2008", "Hellboy II: O Exército Dourado", "Hellboy II: The Golden Army", 2008, "filme", "hellboy-del-toro", "Direção: Guillermo del Toro", [
    ("hellboy", "Ron Perlman", "pro")])

# ---------------------------------------------------------------- listas oficiais
LISTAS = []


def L(id, titulo, descricao, itens):
    LISTAS.append(dict(tipo="lista", id=id, titulo=titulo, descricao=descricao, itens=itens, oficial=True))


L("comecar-batman", "Por onde começar: Batman", "Uma HQ de origem, o desenho clássico e os filmes que definiram o personagem, numa ordem boa pra quem está chegando.", [
    "batman-ano-um", "batman-a-serie-animada", "batman-begins-2005", "cavaleiro-das-trevas-2008", "o-longo-dia-das-bruxas",
    "a-piada-mortal", "the-batman-2022"])
L("comecar-aranha", "Por onde começar: Homem-Aranha", "Os filmes que todo mundo lembra, as duas HQs mais citadas pelos fãs e o Aranhaverso.", [
    "homem-aranha-2002", "homem-aranha-2-2004", "a-noite-em-que-gwen-stacy-morreu", "homem-aranha-no-aranhaverso-2018",
    "homem-aranha-de-volta-ao-lar-2017", "a-ultima-cacada-de-kraven", "homem-aranha-sem-volta-para-casa-2021"])
L("antes-doutor-destino", "O que ver antes de Vingadores: Doutor Destino", "Seleção da Heroteca com o essencial do MCU, o multiverso e as HQs de onde vem o Destino. Estreia no Brasil em 17 de dezembro de 2026.", [
    "homem-de-ferro-2008", "capitao-america-primeiro-vingador-2011", "os-vingadores-2012", "capitao-america-guerra-civil-2016",
    "vingadores-guerra-infinita-2018", "vingadores-ultimato-2019", "homem-aranha-sem-volta-para-casa-2021", "deadpool-e-wolverine-2024",
    "quarteto-fantastico-2005", "guerras-secretas-1984", "guerras-secretas-2015", "vingadores-doutor-destino-2026"])
L("multiverso-aranha", "O multiverso do Homem-Aranha", "Todos os Homens-Aranha do cinema, em ordem de lançamento.", [
    "homem-aranha-2002", "homem-aranha-2-2004", "homem-aranha-3-2007", "o-espetacular-homem-aranha-2012",
    "o-espetacular-homem-aranha-2-2014", "capitao-america-guerra-civil-2016", "homem-aranha-de-volta-ao-lar-2017",
    "homem-aranha-no-aranhaverso-2018", "homem-aranha-longe-de-casa-2019", "homem-aranha-sem-volta-para-casa-2021",
    "homem-aranha-atraves-do-aranhaverso-2023"])
L("todos-os-coringas", "Todos os Coringas", "Do Coringa de Cesar Romero ao de Joaquin Phoenix: um de cada versão.", [
    "batman-1966", "batman-1989", "batman-a-serie-animada", "a-piada-mortal", "cavaleiro-das-trevas-2008",
    "esquadrao-suicida-2016", "coringa-2019"])
L("ordem-dcau", "Universo Animado DC na ordem", "O DCAU do começo, na ordem em que foi lançado.", [
    "batman-a-serie-animada", "batman-mascara-do-fantasma-1993", "amor-louco", "superman-a-serie-animada", "super-choque",
    "liga-da-justica-2001", "liga-da-justica-sem-limites"])
L("todos-os-batmans", "Todos os Batmans do cinema", "Adam West, Keaton, Kilmer, Clooney, Bale, Affleck e Pattinson: um filme de cada.", [
    "batman-1966", "batman-1989", "batman-eternamente-1995", "batman-e-robin-1997", "batman-begins-2005",
    "batman-vs-superman-2016", "the-batman-2022"])
L("x-men-essencial", "X-Men: o essencial", "As duas sagas mais adaptadas, o desenho dos anos 90 e os filmes que importam.", [
    "a-saga-da-fenix-negra", "dias-de-um-futuro-esquecido-hq", "x-men-a-serie-animada", "x-men-o-filme-2000", "x-men-2-2003",
    "x-men-dias-de-um-futuro-esquecido-2014", "logan-2017", "x-men-97"])

# ---------------------------------------------------------------- validação
erros = []
ids_u = {u["id"] for u in UNIVERSOS}
ids_o = [o["id"] for o in OBRAS]
if len(ids_o) != len(set(ids_o)):
    erros.append("ids de obra repetidos")
ids_o = set(ids_o)
for o in OBRAS:
    if o["universo"] not in ids_u:
        erros.append(f"{o['id']}: universo {o['universo']}")
    if not re.fullmatch(r"[a-z0-9-]+", o["id"]):
        erros.append(f"id inválido {o['id']}")
    for e in o["elenco"]:
        if e["p"] not in PERS:
            erros.append(f"{o['id']}: personagem {e['p']}")
        if "u" in e and e["u"] not in ids_u:
            erros.append(f"{o['id']}: universo do elenco {e['u']}")
        if o["formato"] == "hq" and "a" in e:
            erros.append(f"{o['id']}: HQ com ator")
        if o["formato"] != "hq" and "a" not in e:
            erros.append(f"{o['id']}: {e['p']} sem ator")
for l in LISTAS:
    for it in l["itens"]:
        if it not in ids_o:
            erros.append(f"lista {l['id']}: {it}")
for pid in PERS:
    if not re.fullmatch(r"[a-z0-9-]+", pid):
        erros.append(f"id inválido {pid}")
usados = {e["p"] for o in OBRAS for e in o["elenco"]}
sem_obra = sorted(p for p in PERS if p not in usados)
if erros:
    print("ERROS:\n" + "\n".join(erros))
    sys.exit(1)

with open(SAIDA, "w", encoding="utf-8") as f:
    regs = UNIVERSOS + list(PERS.values()) + OBRAS + LISTAS
    f.write("[\n" + ",\n".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in regs) + "\n]\n")

from collections import Counter
print(f"universos: {len(UNIVERSOS)} | personagens: {len(PERS)} (no jogo: {sum(1 for p in PERS.values() if 'jogo' in p)}) | obras: {len(OBRAS)} | listas: {len(LISTAS)}")
print("obras por formato:", dict(Counter(o["formato"] for o in OBRAS)))
print("obras por franquia:", dict(Counter(o["franquia"] for o in OBRAS)))
print("aparições:", sum(len(o["elenco"]) for o in OBRAS), "| com dublagem BR:", sum(1 for o in OBRAS for e in o["elenco"] if "dub" in e))
print("personagens ainda sem obra:", len(sem_obra))
import os
print("tamanho:", os.path.getsize(SAIDA), "bytes")
