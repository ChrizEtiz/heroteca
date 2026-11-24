-- Capas de HQ: vêm do Comic Vine e ficam guardadas na tabela public.capas_hq.
-- O site só LÊ essa tabela. Quem fala com o Comic Vine é esta função, rodada à mão
-- quando entram HQs novas no catálogo (o limite deles é 200 pedidos por hora).
-- A chave fica em public.segredos, que ninguém de fora consegue ler.
--
-- Como cadastrar uma HQ nova (revista, ano em que a revista começou, número da edição):
--   select privado.capa_do_comicvine('id-da-obra', 'Batman', 1940, '404');
--
-- Dica: no Comic Vine o nome da revista nem sempre é o do título brasileiro.
-- A Saga da Fênix Negra, por exemplo, está em "The X-Men" (1963), não em "Uncanny X-Men".

select v.obra, privado.capa_do_comicvine(v.obra, v.vol, v.ano, v.num) as url
from (values
  ('batman-ano-um',                   'Batman',                             1940, '404'),
  ('o-cavaleiro-das-trevas-hq',       'Batman: The Dark Knight Returns',    1986, '1'),
  ('a-piada-mortal',                  'Batman: The Killing Joke',           1988, '1'),
  ('o-longo-dia-das-bruxas',          'Batman: The Long Halloween',         1996, '1'),
  ('a-morte-do-superman',             'Superman',                           1987, '75'),
  ('grandes-astros-superman',         'All-Star Superman',                  2005, '1'),
  ('entre-a-foice-e-o-martelo',       'Superman: Red Son',                  2003, '1'),
  ('amor-louco',                      'The Batman Adventures: Mad Love',    1994, '1'),
  ('mulher-maravilha-deuses-e-mortais','Wonder Woman',                      1987, '1'),
  ('lanterna-verde-renascimento',     'Green Lantern: Rebirth',             2004, '1'),
  ('a-noite-mais-densa',              'Blackest Night',                     2009, '1'),
  ('a-ultima-cacada-de-kraven',       'Web of Spider-Man',                  1985, '31'),
  ('a-noite-em-que-gwen-stacy-morreu','The Amazing Spider-Man',             1963, '121'),
  ('guerra-civil-hq',                 'Civil War',                          2006, '1'),
  ('guerras-secretas-1984',           'Marvel Super Heroes Secret Wars',    1984, '1'),
  ('guerras-secretas-2015',           'Secret Wars',                        2015, '1'),
  ('desafio-infinito',                'The Infinity Gauntlet',              1991, '1'),
  ('o-velho-logan',                   'Wolverine',                          2003, '66'),
  ('arma-x',                          'Marvel Comics Presents',             1988, '72'),
  ('a-saga-da-fenix-negra',           'The X-Men',                          1963, '129'),
  ('dias-de-um-futuro-esquecido-hq',  'The X-Men',                          1963, '141'),
  ('o-demonio-na-garrafa',            'Iron Man',                           1968, '120'),
  ('o-soldado-invernal-hq',           'Captain America',                    2004, '1'),
  ('planeta-hulk',                    'Incredible Hulk',                    1999, '92'),
  ('uma-nacao-sob-nossos-pes',        'Black Panther',                      2016, '1'),
  ('deadpool-mata-o-universo-marvel', 'Deadpool Kills the Marvel Universe', 2012, '1'),
  ('ultimate-homem-aranha-miles',     'Ultimate Comics: Spider-Man',        2011, '1'),
  ('venom-protetor-letal',            'Venom: Lethal Protector',            1993, '1'),
  ('invencivel-hq',                   'Invincible',                         2003, '1'),
  ('tmnt-1-1984',                     'Teenage Mutant Ninja Turtles',       1984, '1'),
  ('spawn-1992',                      'Spawn',                              1992, '1'),
  ('hellboy-semente-da-destruicao',   'Hellboy: Seed of Destruction',       1994, '1')
) as v(obra, vol, ano, num);
