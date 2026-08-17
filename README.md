# Pixel's Realm

Protótipo jogável de um mini MMORPG 2D em pixel art, com sistema de nível, stats, loot, combate por proximidade e árvore de skills.

## Como jogar

Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor).

Controles:
- `W A S D` ou setas: mover o personagem
- `1`: equipar Espada Curta (corpo a corpo)
- `2`: equipar Arco Curto (à distância)

Os ataques agora são **automáticos por proximidade**: se um inimigo entrar no raio de alcance da arma equipada, o personagem ataca sozinho, sem precisar apertar um botão de ataque.

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
src/game.js              -> lógica principal: movimento, armas, combate por proximidade, XP, skills e loot
src/main.js              -> lógica da tela inicial (título animado)
```

## Próximos passos sugeridos

- Trocar os retângulos por sprites reais em pixel art, incluindo animações de ataque por arma.
- Adicionar inventário visual e equipamento de itens obtidos como loot.
- Conectar a tela de criação de personagem para definir a arma e a classe inicial do jogador.
- Adicionar sons e efeitos visuais de combate (corte, disparo de flecha, acerto crítico).
