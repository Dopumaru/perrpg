# Pixel's Realm

Protótipo jogável inicial de um mini MMORPG 2D em pixel art, com sistema básico de nível, stats e loot.

## Como jogar

Abra o arquivo `index.html` diretamente no navegador (não precisa de servidor).

Controles:
- `W A S D` ou setas: mover o personagem
- `Espaço`: atacar inimigos próximos

## O que já funciona nesta versão

- Movimentação livre em um mapa 2D com grid.
- Inimigos que perseguem o jogador dentro de um raio e causam dano por contato.
- Sistema de ataque simples com alcance e cooldown.
- Sistema de nível e XP: inimigos derrotados dão XP, e ao subir de nível o jogador ganha HP, Força e Defesa.
- Sistema de loot básico: ao derrotar um inimigo, há chance de ganhar ouro e itens com raridades diferentes (comum, raro, épico).
- HUD com nome, nível, barra de HP, barra de XP, stats e log de loot.
- Inimigos derrotados reaparecem após alguns segundos.

## Estrutura do projeto

```
index.html              -> tela principal do protótipo jogável
assets/ui/style.css      -> estilos do HUD e da interface
assets/backgrounds/      -> imagens de fundo usadas em outras telas do projeto
screens/                 -> telas adicionais (criação de personagem, etc.)
src/game.js              -> lógica principal do jogo (movimento, combate, XP, loot)
src/main.js              -> lógica da tela inicial (título animado)
```

## Próximos passos sugeridos

- Trocar os retângulos por sprites reais em pixel art.
- Adicionar inventário visual e equipamento.
- Conectar a tela de criação de personagem com os stats iniciais do jogador.
- Adicionar sons e efeitos visuais de combate.
