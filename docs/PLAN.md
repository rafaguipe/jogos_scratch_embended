# Plano de implementação — Scratch Academy MVP 0.1

Status: **concluído** em 2026-08-07 (ver critérios de aceite abaixo).

## Etapas

| # | Etapa | Resultado | Status |
|---|---|---|---|
| 1 | Validar ambiente (Node/npm) e definir arquitetura | Node v20.19.2; Vite 7; TurboWarp via iframe | ✅ |
| 2 | Scaffold do projeto | `package.json`, `vite.config.js` (base `./` + CORS), `index.html`, `.gitignore` | ✅ |
| 3 | Sistema de lições (abstração `lesson/`) | `lessons/lesson1/` com `lesson.json`, `metadata.json`, `instructions.md`, `hints.md` | ✅ |
| 4 | Gerador do jogo demo | `scripts/make_demo_game.mjs` → `game.sb3` (mova 10) + `solution.sb3` (mova 20); zero dependências | ✅ |
| 5 | Core: router + state | `src/core/router.js` (hash) + `src/core/state.js` (event bus) | ✅ |
| 6 | Serviços | `src/services/{lessons,storage,tracker,api}.js` — fronteira para LMS futuro | ✅ |
| 7 | Componentes e views + CSS | `Header`, `Button`, `MissionPanel`, `HomeView`, `PlayerView`, `EditorView`, `main.css` | ✅ |
| 8 | Documentação | `README.md`, `docs/ARCHITECTURE.md` (diagrama), `docs/PLAN.md` | ✅ |
| 9 | Verificação | dev server, fluxo Jogar/Modificar no navegador, build de produção | ✅ |

## Verificação executada

1. `npm install` — 0 vulnerabilidades.
2. `npm run make:demo-game` — gerou os dois `.sb3` (23.5 KB cada); `unzip`
   confirmou `project.json` + PNGs + SVG válidos; `motion_movesteps` = 10 (game)
   e 20 (solution).
3. `npm run dev` — Vite 7.3.6 em `http://localhost:5173/`.
4. Teste no navegador:
   - Home renderiza "Scratch Academy / Missão 1 / Jogar / Modificar" + instruções.
   - **Jogar** → `#/play/lesson1` → iframe `turbowarp.org/embed.html?project=…/game.sb3&autoplay`.
   - **Voltar ao Curso** → home.
   - **Modificar** → `#/edit/lesson1` → iframe `turbowarp.org/editor?project=…/game.sb3`
     (mesmo projeto do player).
   - Console sem erros JS.
5. `npm run build` — 23 módulos, `dist/` ≈ 13.5 KB JS + 4.9 KB CSS + `.sb3`.

## Critérios de aceite (da especificação)

- [x] `npm install && npm run dev` abre a página inicial "Scratch Academy /
      Missão 1 / [JOGAR] [MODIFICAR]".
- [x] **Jogar** abre o jogo automaticamente (autoplay).
- [x] **Modificar** abre o editor carregando exatamente o mesmo projeto.
- [x] Fluxo do aluno completo: abrir curso → jogar → abrir editor → modificar o
      mesmo jogo → executar novamente → salvar → retornar ao curso.
- [x] Estrutura `lesson/` abstraída (LMS-ready): lesson.json, game.sb3,
      instructions.md, hints.md, solution.sb3, metadata.json.
- [x] Arquitetura prevê (sem implementar): login, progresso, ranking, missões,
      tutor IA/LLM, banco, analytics — via camada de serviços.
- [x] Entregáveis: arquitetura (docs/ARCHITECTURE.md), estrutura de diretórios
      (README), plano (este arquivo), código funcional, README, diagrama.

## Como executar

```bash
npm install
npm run dev        # http://localhost:5173/
npm run build      # dist/ estático
npm run make:demo-game   # regenera os jogos demo
```
