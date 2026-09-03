# Arquitetura — Scratch Academy MVP 0.1

## Visão geral

Scratch Academy é uma plataforma de ensino de programação por missões. O núcleo
pedagógico: **o aluno nunca começa com uma tela em branco** — cada missão parte
de um jogo `.sb3` funcional que o aluno joga e depois modifica.

A aplicação é **estática** (Vite) e não possui backend no MVP. O player e o
editor são o TurboWarp oficial, carregados via iframe. A camada de serviços já
existe como fronteira de arquitetura para a evolução para LMS (login, progresso,
ranking, tutor com IA) — os pontos de conexão estão definidos, a implementação
fica para as próximas versões.

## Diagrama da arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (cliente)                          │
│                                                                     │
│  ┌───────────────────────────────┐   ┌───────────────────────────┐  │
│  │  SPA — Scratch Academy (Vite)│   │  TurboWarp (origem externa)│  │
│  │                              │   │                           │  │
│  │  ┌─────────────────────────┐ │   │  ┌─────────────────────┐  │  │
│  │  │  Router (hash)          │ │   │  │  Player (embed.html)│  │  │
│  │  │  #/  #/play/:id #/edit  │ │   │  │  ▶ autoplay         │  │  │
│  │  └───────────┬─────────────┘ │   │  └──────────┬──────────┘  │  │
│  │              │               │   │  ┌──────────┴──────────┐  │  │
│  │  ┌───────────▼─────────────┐ │   │  │  Editor (/editor)   │  │  │
│  │  │  Views                  │ │   │  │  mesmo projeto      │  │  │
│  │  │  Home · Player · Editor │ │   │  └──────────┬──────────┘  │  │
│  │  └───────────┬─────────────┘ │   │             │             │  │
│  │              │               │   └─────────────┼─────────────┘  │
│  │  ┌───────────▼─────────────┐ │                 │               │
│  │  │  Components             │ │                 │               │
│  │  │  Header · Button ·      │ │                 │               │
│  │  │  MissionPanel           │ │                 │               │
│  │  └───────────┬─────────────┘ │                 │               │
│  │              │               │                 │               │
│  │  ┌───────────▼─────────────┐ │                 │               │
│  │  │  Services (fronteira)   │ │                 │               │
│  │  │  lessons · storage ·    │ │                 │               │
│  │  │  tracker · api          │ │                 │               │
│  │  └───────────┬─────────────┘ │                 │               │
│  └──────────────┼───────────────┘                 │               │
│                 │  import.meta.glob                │               │
│                 │  (dev: FS · build: bundle)      │  GET .sb3      │
│  ┌──────────────▼───────────────┐   CORS          │  (URL abs.)    │
│  │  lessons/ (conteúdo do curso)│◄────────────────┘               │
│  │  lesson1/{lesson.json,       │                                 │
│  │  metadata.json, game.sb3,    │                                 │
│  │  solution.sb3,               │                                 │
│  │  instructions.md, hints.md}  │                                 │
│  └──────────────────────────────┘                                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Futuro (fora do MVP — pontos de conexão já definidos)      │  │
│  │  API (REST) · Banco · Auth · Progresso · Ranking ·          │  │
│  │  Missões · Tutor IA/LLM · Analytics                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Componentes

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Entrada | `src/main.js` | Importa CSS, instancia `App` em `#app`. |
| App | `src/App.js` | Inicia o router, observa o estado e monta a view da rota. |
| Core | `src/core/router.js` | Roteamento por hash (`#/`, `#/play/:id`, `#/edit/:id`); funciona em qualquer host estático. |
| Core | `src/core/state.js` | Store de estado + event bus (publish/subscribe) — views reagem a mudanças. |
| Services | `src/services/lessons.js` | Registro de lições via `import.meta.glob`: descobre `lessons/*/` automaticamente, resolve URLs absolutas dos `.sb3`, entrega texto markdown das instruções/dicas. |
| Services | `src/services/storage.js` | Persistência local (localStorage) — hoje: preferências; amanhã: progresso offline. |
| Services | `src/services/tracker.js` | Rastreio de eventos (`track()`); no MVP registra no console/localStorage — amanhã: analytics. |
| Services | `src/services/api.js` | Cliente HTTP (`get/post`); hoje: stub sem servidor — amanhã: backend REST. |
| Lib | `src/lib/markdown.js` | Renderizador markdown minimalista (títulos, listas, ênfase, código, links) — zero dependências. |
| Components | `src/components/Header.js` | Barra superior com marca e ação "Voltar ao Curso". |
| Components | `src/components/Button.js` | Botão padrão (primary/secondary/ghost) com ícone. |
| Components | `src/components/MissionPanel.js` | Card da missão: instruções renderizadas, dicas colapsáveis, ações Jogar/Modificar. |
| Views | `src/views/HomeView.js` | Hero + missão atual + lista de lições. |
| Views | `src/views/PlayerView.js` | iframe `turbowarp.org/embed.html?project=<url>&autoplay` + toolbar com Voltar ao Curso. |
| Views | `src/views/EditorView.js` | iframe `turbowarp.org/editor?project=<url>` — o mesmo projeto do player. |
| Estilos | `src/styles/main.css` | Design system via custom properties (paleta Scratch + Material). |

## Fluxo do aluno

```
Home ──▶ [▶ Jogar] ──▶ Player (jogo original rodando, autoplay)
  ▲                          │
  │                          ▼
  └────── [Voltar ao Curso]  (fim da sessão de jogo)
  │
  ├──▶ [Modificar] ──▶ Editor TurboWarp com o MESMO game.sb3
  │                          │
  │                          ├──▶ aluno altera blocos (ex.: "mova 10" → "mova 20")
  │                          ├──▶ ▶ executa novamente dentro do editor
  │                          ├──▶ Arquivo → Salvar (download .sb3)
  │                          └──▶ [Voltar ao Curso]
  └── (loop: joga → modifica → testa → volta)
```

## Abstração de lição (base do LMS)

Uma lição é uma pasta com contrato fixo:

```
lessons/<id>/
├── lesson.json       # contrato: id, ordem, nomes dos arquivos
├── metadata.json     # título, subtítulo, dificuldade, duração, objetivos, tags
├── game.sb3          # projeto inicial — o que o aluno modifica
├── solution.sb3      # solução de referência (verificação automática futura)
├── instructions.md   # texto da missão (renderizado na home)
└── hints.md          # dicas progressivas (painel colapsável)
```

Adicionar uma missão = copiar uma pasta e preencher os arquivos. O código não
muda: `lessons.js` redescobre tudo em tempo de build/dev via `import.meta.glob`.

## Por que TurboWarp via iframe (e não scratch-gui embutido)

- `scratch-gui`/`scratch-vm` são aplicações React pesadas (~5 MB+); embuti-las
  contraria a restrição de simplicidade e a filosofia "sem frameworks
  desnecessários".
- TurboWarp é um player/editor Scratch moderno, rápido, com suporte a projetos
  remotos por URL.
- O iframe isola a complexidade: nossa SPA permanece leve (build ≈ 13 KB JS).
- Custo: o `.sb3` precisa ser servido com **CORS aberto** e URL absoluta
  (o iframe roda em outra origem) — já resolvido em `vite.config.js`
  (`server.cors: true`) e em `lessons.js` (`absoluteUrl`).

## Decisões e trade-offs

| Decisão | Alternativa rejeitada | Motivo |
|---|---|---|
| Vite + JS ES6 puro | React/Vue/Svelte | Simplicidade, zero runtime, build pequeno. |
| Router por hash | History API | Host estático genérico (GitHub Pages, subpastas). |
| Renderizador markdown próprio | marked/markdown-it | Subconjunto pequeno; zero dependências. |
| Jogos demo gerados por script | .sb3 fornecidos | Repo self-contained; PNG/ZIP minimalistas embutidos. |
| TurboWarp iframe | scratch-gui embutido | Peso; isolamento; manutenção. |

## Roadmap pós-MVP (arquitetura preparada, não implementada)

A camada `src/services/` já isola os pontos de conexão:

1. **Auth/login** → `services/api.js` (`POST /auth`) + `services/storage.js`
   (sessão); usuário entra com conta ou Google.
2. **Progresso** → `services/storage.js` local + sync via `api.js`; cada missão
   registra "iniciada / concluída" (campos já previstos no `tracker.js`).
3. **Ranking** → agregação server-side sobre o progresso (leaderboard global e
   por turma).
4. **Missões** → o contrato `lesson.json` já define arquivos; uma missão pode
   ganhar requisitos extras (ex.: `check.js` para validação automática da
   solução contra `solution.sb3`).
5. **Tutor IA / LLM** → `services/api.js` (`POST /assist`); o tutor recebe o
   histórico de eventos (tracker) e a missão atual, e responde com dicas
   contextuais sem dar a resposta pronta.
6. **Banco** → camada `api.js` oculta o backend; trocar SQLite/Postgres não
   afeta as views.
7. **Analytics** → `tracker.js` já concentra os eventos (ex.: `play_start`,
   `editor_open`, `mission_done`); basta ligar o transporte.

Regra de ouro do roadmap: **views nunca falam com banco/LLM diretamente** —
tudo passa pela camada de serviços.
