# Pixel's Realm

Protótipo jogável de um mini MMORPG 2D em pixel art, com sistema de nível, stats, loot, combate por proximidade, árvore de skills e um sprite real animado para o jogador.

## Como jogar

Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor, mas precisa de internet para carregar o sprite do jogador).

Controles:
- `W A S D` ou setas: mover o personagem
- `1`: equipar Espada Curta (corpo a corpo)
- `2`: equipar Arco Curto (à distância)

Os ataques são **automáticos por proximidade**: se um inimigo entrar no raio de alcance da arma equipada, o personagem ataca sozinho, sem precisar apertar um botão de ataque.

## Sprite real do jogador

O jogador agora usa um spritesheet real em pixel art, carregado diretamente do projeto open source **Universal LPC Spritesheet Character Generator** (Liberated Pixel Cup), com animações de:

- **Andar** (9 quadros por direção),
- **Golpe de espada** (6 quadros por direção),
- **Disparo de arco** (13 quadros por direção),

tudo recortado do spritesheet oficial em tempo real, por direção (cima, baixo, esquerda, direita).

Caso o sprite não carregue (por exemplo, sem conexão à internet), o jogo usa automaticamente um personagem desenhado processualmente em canvas como alternativa, para nunca deixar a tela em branco.

### Créditos e licença do sprite

O corpo do jogador (`body/bodies/male/light.png`) vem do projeto **Liberated Pixel Cup / Universal LPC Spritesheet**, licenciado sob **CC-BY-SA 3.0 e GPL 3.0**. Autores contribuintes desse conjunto de arte: bluecarrot16, Benjamin K. Smith (BenCreating), Evert, Eliza Wyatt (ElizaWy), TheraHedwig, MuffinElZangano, Durrani, Johannes Sjölund (wulax), Stephen Challener (Redshrike).

Fonte do projeto: [Universal-LPC-Spritesheet-Character-Generator](https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator) · [OpenGameArt - LPC Character Bases](https://opengameart.org/content/lpc-character-bases)

Se este projeto for distribuído publicamente, mantenha esta seção de créditos, conforme exigido pela licença CC-BY-SA / GPL.

Os **inimigos** ainda são desenhados processualmente em canvas (não usam spritesheet), com squash-and-stretch ao se mover, flash de dano e animação de morte. Substituí-los por um sprite real (por exemplo, o esqueleto do mesmo projeto LPC) é um próximo passo natural.

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

Ao derrotar um inimigo, há chance de ganhar ouro e itens com raridades diferentes (comum, raro, épico). A skill "Sorte do Aventureiro" aumenta a chance de itens melhores.

## Estrutura do projeto

```
index.html              -> tela principal do protótipo jogável, com HUD e modal de nível
assets/ui/style.css      -> estilos do HUD, HUD de skills e modal de escolha de habilidade
assets/backgrounds/      -> imagens de fundo usadas em outras telas do projeto
screens/                 -> telas adicionais (criação de personagem, etc.)
src/game.js              -> lógica principal: movimento, armas, combate por proximidade, XP, skills, loot e sprite real do jogador
src/main.js              -> lógica da tela inicial (título animado)
```

## Próximos passos sugeridos

- Substituir o monstro processual por um sprite real de inimigo (ex.: esqueleto do mesmo projeto LPC).
- Baixar o spritesheet e hospedá-lo dentro do próprio repositório, em vez de carregá-lo de uma URL externa.
- Adicionar inventário visual e equipamento de itens obtidos como loot.
- Conectar a tela de criação de personagem para definir a arma e a classe inicial do jogador.
- Adicionar sons e efeitos visuais de combate (corte, disparo de flecha, acerto crítico).
