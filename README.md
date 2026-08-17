# Pixel's Realm

Protótipo jogável de um mini MMORPG 2D em pixel art, com sistema de nível, stats, loot, combate por proximidade, árvore de skills e sprites reais animados para o jogador e para várias variações de inimigos.

## Como jogar

Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor, mas precisa de internet para carregar os sprites).

Controles:
- `W A S D` ou setas: mover o personagem
- `1`: equipar Espada Curta (corpo a corpo)
- `2`: equipar Arco Curto (à distância)

Os ataques são **automáticos por proximidade**: se um inimigo entrar no raio de alcance da arma equipada, o personagem ataca sozinho, sem precisar apertar um botão de ataque.

## Sprite real do jogador

O jogador usa um spritesheet real em pixel art, carregado do projeto open source **Universal LPC Spritesheet Character Generator** (Liberated Pixel Cup), com animações de:

- **Andar** (9 quadros por direção),
- **Golpe de espada** (6 quadros por direção),
- **Disparo de arco** (13 quadros por direção),

recortadas do spritesheet oficial em tempo real, por direção (cima, baixo, esquerda, direita).

## Variações de inimigos com sprites reais

Os inimigos agora usam o mesmo tipo de spritesheet real (layout Universal LPC), com 5 variações diferentes, cada uma com estatísticas próprias:

| Inimigo | HP | Força | Velocidade | XP | Ouro |
|---|---|---|---|---|---|
| Esqueleto | 18 | 3 | 70 | 12 | 2–6 |
| Esqueleto Sombrio | 26 | 4 | 62 | 18 | 4–9 |
| Esqueleto Gélido | 20 | 3 | 82 | 16 | 3–8 |
| Zumbi | 34 | 2 | 45 | 20 | 3–7 |
| Zumbi Tóxico | 24 | 5 | 55 | 22 | 5–10 |

Cada inimigo sorteia seu tipo ao nascer e novamente ao reaparecer após ser derrotado, então o mundo tem variedade constante. Todos usam animação real de andar, viram na direção do movimento e mostram flash de dano e encolhimento ao morrer.

Se o sprite de um tipo específico não carregar, o jogo usa automaticamente uma versão processual em canvas como alternativa, para nunca deixar a tela em branco.

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

Ao derrotar um inimigo, há chance de ganhar ouro e itens com raridades diferentes (comum, raro, épico). A skill "Sorte do Aventureiro" aumenta a chance de itens melhores. O log de loot também mostra qual tipo de inimigo foi derrotado.

## Estrutura do projeto

```
index.html              -> tela principal do protótipo jogável, com HUD e modal de nível
assets/ui/style.css      -> estilos do HUD, HUD de skills e modal de escolha de habilidade
assets/backgrounds/      -> imagens de fundo usadas em outras telas do projeto
screens/                 -> telas adicionais (criação de personagem, etc.)
src/game.js              -> lógica principal: movimento, armas, combate por proximidade, XP, skills, loot e sprites reais
src/main.js              -> lógica da tela inicial (título animado)
```

## Próximos passos sugeridos

- Baixar os spritesheets e hospedá-los dentro do próprio repositório, em vez de carregá-los de uma URL externa.
- Adicionar mais variações de inimigo (ex.: bandido, orc, morcego) usando outros corpos do mesmo projeto LPC.
- Adicionar inventário visual e equipamento de itens obtidos como loot.
- Conectar a tela de criação de personagem para definir a arma e a classe inicial do jogador.
- Adicionar sons e efeitos visuais de combate (corte, disparo de flecha, acerto crítico).
