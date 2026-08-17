# Pixel's Realm

Protótipo jogável de um mini MMORPG 2D em pixel art, com sistema de nível, stats, loot, combate por proximidade, árvore de skills e personagens desenhados como sprites animados.

## Como jogar

Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor).

Controles:
- `W A S D` ou setas: mover o personagem
- `1`: equipar Espada Curta (corpo a corpo)
- `2`: equipar Arco Curto (à distância)

Os ataques são **automáticos por proximidade**: se um inimigo entrar no raio de alcance da arma equipada, o personagem ataca sozinho, sem precisar apertar um botão de ataque.

## Sprites e animações

Os personagens não são mais blocos estáticos. O jogador e os inimigos são desenhados por partes (cabeça, tronco, braços, pernas) diretamente no canvas e animados em tempo real:

- **Ciclo de andar**: as pernas alternam e o corpo balança levemente enquanto o personagem se move.
- **Golpe de espada**: o braço da frente gira segurando a espada durante o ataque corpo a corpo.
- **Disparo de arco**: a corda do arco é puxada e solta de forma sincronizada com o disparo do projétil.
- **Inimigos**: têm um leve "squash and stretch" ao se mover, olhos que acompanham o movimento, piscam em branco ao serem atingidos e encolhem/desaparecem com uma animação de morte antes de reaparecer.

Como o projeto ainda não tem uma folha de sprites (spritesheet) própria em arte pixel, essas animações foram construídas processualmente em canvas (desenhando e transformando formas a cada frame). Isso já entrega personagens com jogabilidade e animação reais; o próximo passo natural é substituir esse desenho processual por sprites desenhados à mão ou gerados em pixel art, caso vocês queiram trazer arte própria para o projeto.

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
src/game.js              -> lógica principal: movimento, armas, combate por proximidade, XP, skills, loot e sprites animados
src/main.js              -> lógica da tela inicial (título animado)
```

## Próximos passos sugeridos

- Substituir o desenho processual por spritesheets reais em pixel art (idle, andar, ataque, morte, por direção).
- Adicionar inventário visual e equipamento de itens obtidos como loot.
- Conectar a tela de criação de personagem para definir a arma e a classe inicial do jogador.
- Adicionar sons e efeitos visuais de combate (corte, disparo de flecha, acerto crítico).
