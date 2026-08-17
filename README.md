# Pixel's Realm

Protótipo jogável de um mini MMORPG 2D em pixel art, com sistema de nível, stats, loot, combate por proximidade, árvore de skills, sprites reais animados e zonas do mapa com dificuldade crescente e agora diferenciação visual do chão por região.

## Como jogar

Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor, mas precisa de internet para carregar os sprites).

Controles:
- `W A S D` ou setas: mover o personagem
- `1`: equipar Espada Curta (corpo a corpo)
- `2`: equipar Arco Curto (à distância)

Os ataques são **automáticos por proximidade**: se um inimigo entrar no raio de alcance da arma equipada, o personagem ataca sozinho, sem precisar apertar um botão de ataque.

## Zonas do mapa, dificuldade e visual

O mapa é dividido em 4 zonas concêntricas, a partir do ponto onde o jogador nasce. Quanto mais longe do centro, mais forte fica a região — e agora isso também aparece visualmente no chão:

| Zona | Distância do centro | Nível recomendado | Dificuldade | Cor do chão | Inimigos |
|---|---|---|---|---|---|
| Vila Pacífica | 0–260 | 1–3 | x1.0 | Verde suave | Esqueleto |
| Floresta Sombria | 260–480 | 3–6 | x1.7 | Verde-azulado escuro | Esqueleto, Esqueleto Gélido |
| Pântano Amaldiçoado | 480–700 | 6–9 | x2.6 | Verde-oliva pantanoso | Esqueleto Sombrio, Zumbi |
| Covil Esquecido | 700+ | 9+ | x3.8 | Vermelho-escuro sombrio | Zumbi Tóxico, Esqueleto Sombrio, Zumbi |

O multiplicador de dificuldade aumenta o HP, a força e as recompensas (XP e ouro) dos inimigos daquela zona.

### Diferenciação visual das zonas

Cada zona agora tem sua própria cor de chão, desenhada como um círculo concêntrico ao redor do ponto de nascimento do jogador, com uma névoa colorida sutil perto da borda de cada região e uma linha pontilhada marcando a transição para a próxima zona. Isso permite ao jogador perceber visualmente que está mudando de área, além do banner e do chip de texto que já indicam o nome e o nível recomendado.

### Indicador de zona na tela

Assim que o jogador entra em uma nova zona, um **banner central** aparece por alguns segundos mostrando o nome da região e o nível recomendado (ex.: "Pântano Amaldiçoado · Nível recomendado: 6–9"). Além disso, um **chip fixo no canto superior direito** sempre mostra a zona atual.

## Sprite real do jogador

O jogador usa um spritesheet real em pixel art, carregado do projeto open source **Universal LPC Spritesheet Character Generator** (Liberated Pixel Cup), com animações de:

- **Andar** (9 quadros por direção),
- **Golpe de espada** (6 quadros por direção),
- **Disparo de arco** (13 quadros por direção),

recortadas do spritesheet oficial em tempo real, por direção (cima, baixo, esquerda, direita).

## Variações de inimigos com sprites reais

Os inimigos usam o mesmo tipo de spritesheet real (layout Universal LPC), com 5 variações diferentes. As estatísticas base de cada tipo são multiplicadas pela zona em que o inimigo nasce. Cada inimigo sorteia seu tipo dentro do conjunto permitido pela sua zona, tanto ao nascer quanto ao reaparecer após ser derrotado.

Se um sprite não carregar, o jogo usa automaticamente uma versão processual em canvas como alternativa, para nunca deixar a tela em branco.

### Créditos e licença dos sprites

O corpo do jogador (`body/bodies/male/light.png`) e os sprites de inimigos (`body/bodies/skeleton/universal/*.png`) vêm do projeto **Liberated Pixel Cup / Universal LPC Spritesheet**, licenciado sob **CC-BY-SA 3.0 e GPL 3.0**. Autores contribuintes desse conjunto de arte: bluecarrot16, Benjamin K. Smith (BenCreating), Evert, Eliza Wyatt (ElizaWy), TheraHedwig, MuffinElZangano, Durrani, Johannes Sjölund (wulax), Stephen Challener (Redshrike).

Fonte do projeto: [Universal-LPC-Spritesheet-Character-Generator](https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator) · [OpenGameArt - LPC Character Bases](https://opengameart.org/content/lpc-character-bases)

Se este projeto for distribuído publicamente, mantenha esta seção de créditos, conforme exigido pela licença CC-BY-SA / GPL.

## Sistema de combate por arma

- **Corpo a corpo (Espada Curta)**: alcance curto, atinge todos os inimigos dentro do raio ao redor do personagem.
- **À distância (Arco Curto)**: alcance bem maior, dispara um projétil em direção ao inimigo mais próximo dentro do alcance.

Cada arma tem seu próprio tempo de recarga, reduzido pela skill "Foco de Combate".

## Sistema de nível e skills

Ao subir de nível, um **modal de escolha de habilidade** é aberto automaticamente, mostrando 3 opções sorteadas entre:

- Força Bruta (+dano)
- Vigor (+HP máximo)
- Agilidade (+velocidade de movimento)
- Foco de Combate (-tempo de recarga de ataque)
- Sorte do Aventureiro (+chance de loot melhor)
- Guarda de Ferro (+defesa)

O jogador pode escolher uma habilidade nova (começa no nível 1) ou uma já possuída (sobe de nível, até o nível máximo de 5). É possível **trocar as 3 opções sorteadas até 2 vezes** por nível, usando o botão "Trocar opções", antes de confirmar a escolha.

## Sistema de loot

Ao derrotar um inimigo, há chance de ganhar ouro e itens com raridades diferentes (comum, raro, épico), com valores escalados pela zona. A skill "Sorte do Aventureiro" aumenta a chance de itens melhores. O log de loot mostra o tipo de inimigo e a zona em que ele foi derrotado.

## Estrutura do projeto

```
index.html              -> tela principal do protótipo jogável, com HUD, indicador de zona e modal de nível
assets/ui/style.css      -> estilos do HUD, indicador de zona, HUD de skills e modal de escolha de habilidade
assets/backgrounds/      -> imagens de fundo usadas em outras telas do projeto
screens/                 -> telas adicionais (criação de personagem, etc.)
src/game.js              -> lógica principal: movimento, armas, combate por proximidade, XP, skills, loot, zonas do mapa (com visual) e sprites reais
src/main.js              -> lógica da tela inicial (título animado)
```

## Próximos passos sugeridos

- Baixar os spritesheets e hospedá-los dentro do próprio repositório, em vez de carregá-los de uma URL externa.
- Adicionar mais variações de inimigo por zona (ex.: bandido, orc, morcego) usando outros corpos do mesmo projeto LPC.
- Adicionar elementos de cenário próprios de cada zona (árvores na floresta, lama no pântano, ossos no covil).
- Adicionar inventário visual e equipamento de itens obtidos como loot.
- Conectar a tela de criação de personagem para definir a arma e a classe inicial do jogador.
