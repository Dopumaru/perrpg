# Ambiente por zona

Este módulo adiciona partículas e áudio procedural sem substituir a lógica principal do jogo.

## Partículas

- Vila Pacífica: poeira dourada suave.
- Floresta Sombria: vagalumes verdes.
- Pântano Amaldiçoado: bolhas/luzes amareladas.
- Covil Esquecido: cinzas rosadas mais densas.

## Áudio

O botão `Som: desligado` ativa o ambiente procedural criado com Web Audio API. A frequência muda por zona e uma transição sonora ocorre ao entrar em uma nova área.

O som começa desligado porque navegadores exigem interação explícita do usuário.

## Ativação

Para ativar na página principal, adicione ao HTML:

```html
<link rel="stylesheet" href="./assets/ui/environment.css">
<script src="./src/environment.js"></script>
```
