# Scratch Academy — MVP 0.1

Plataforma web para ensino de programação com **Scratch/TurboWarp**, baseada em missões.

> O princípio pedagógico: **o aluno nunca começa com uma tela em branco.**
> Toda aprendizagem ocorre a partir da modificação de um jogo já funcional.

Cada missão carrega um jogo `.sb3` pronto. O aluno joga, abre o editor, modifica o
mesmo projeto, executa novamente e retorna ao curso.

## Funcionalidades

- Página inicial com a missão atual e todas as lições disponíveis.
- **▶ Jogar** — player TurboWarp carregando o jogo da lição automaticamente.
- **Modificar** — editor TurboWarp carregando **exatamente o mesmo** projeto.
- **Voltar ao Curso** — retorno à home a partir do player/editor.
- Instruções da missão (markdown) e dicas progressivas (colapsáveis).
- Estrutura de lições abstraída em pastas — o projeto já nasce com a base de um
  **LMS para Scratch** (ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).

## Requisitos

- Node.js ≥ 20
- npm (incluído com o Node)

## Instalar e executar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/` no navegador.

- `npm run build` — build de produção em `dist/` (estático, qualquer host).
- `npm run preview` — serve o build localmente para teste.
- `npm run make:demo-game` — regenera os jogos demo (`game.sb3` e `solution.sb3`
  da lição 1) a partir do script zero-dependência em `scripts/make_demo_game.mjs`.

## Estrutura do projeto

```
jogos_scratch_embended/
├── index.html                  # entrada (monta #app)
├── package.json                # scripts: dev, build, preview, make:demo-game
├── vite.config.js              # base './' + CORS para iframes TurboWarp
├── scripts/
│   └── make_demo_game.mjs      # gerador do jogo demo (PNG+ZIP minimalistas)
├── lessons/                    # ← todas as lições vivem aqui
│   └── lesson1/
│       ├── lesson.json         # definição da lição (id, ordem, arquivos)
│       ├── metadata.json       # título, dificuldade, objetivos, tags
│       ├── game.sb3            # projeto inicial (o aluno modifica)
│       ├── solution.sb3        # solução de referência (uso futuro)
│       ├── instructions.md     # texto da missão
│       └── hints.md            # dicas progressivas
├── src/
│   ├── main.js                 # entry point
│   ├── App.js                  # monta views a partir da rota
│   ├── core/
│   │   ├── router.js           # roteamento por hash (#/play/:id, #/edit/:id)
│   │   └── state.js            # store de estado + event bus
│   ├── services/               # camada de serviços (LMS futuro)
│   │   ├── lessons.js          # registro de lições (import.meta.glob)
│   │   ├── storage.js          # persistência local (localStorage)
│   │   ├── tracker.js          # rastreio de eventos (analytics futuro)
│   │   └── api.js              # cliente HTTP (backend futuro)
│   ├── lib/
│   │   └── markdown.js         # renderizador markdown minimalista
│   ├── components/
│   │   ├── Header.js           # barra superior + "Voltar ao Curso"
│   │   ├── Button.js           # botão padrão (primary/secondary/ghost)
│   │   └── MissionPanel.js     # card da missão (instruções + dicas + ações)
│   ├── views/
│   │   ├── HomeView.js         # página inicial (hero + lições)
│   │   ├── PlayerView.js       # player TurboWarp (embed + autoplay)
│   │   └── EditorView.js       # editor TurboWarp (mesmo projeto)
│   └── styles/
│       └── main.css            # design system (Material + Scratch)
└── docs/
    ├── ARCHITECTURE.md         # arquitetura + diagrama + roadmap LMS
    └── PLAN.md                 # plano de implementação do MVP
```

## Como adicionar um jogo (substituir o demo)

1. Gere ou exporte um projeto Scratch/TurboWarp como `.sb3`.
2. Copie-o para `lessons/<id>/game.sb3` (ex.: `lessons/lesson1/game.sb3`).
3. `npm run dev` — o build e o dev server redescobrem os arquivos sozinhos
   (`import.meta.glob`); nenhum código muda.

## Como criar uma nova missão

1. Crie a pasta `lessons/lesson2/`.
2. Coloque o jogo inicial em `game.sb3`.
3. Escreva `lesson.json`:

```json
{
  "id": "lesson2",
  "title": "Missão 2",
  "order": 2,
  "game": "game.sb3",
  "solution": "solution.sb3",
  "instructions": "instructions.md",
  "hints": "hints.md"
}
```

4. Preencha `metadata.json` (título, subtítulo, dificuldade, objetivos, tags).
5. Escreva o texto da missão em `instructions.md` e as dicas em `hints.md`
   (markdown simples: títulos, listas, código).
6. Se houver, adicione `solution.sb3` (solução de referência).

A nova lição aparece na home automaticamente, ordenada pelo campo `order`.

## Stack e decisões

- **Vite 7** (dev server + build) — sem frameworks de UI.
- **TurboWarp Player/Editor via iframe** — não embutimos scratch-gui/scratch-vm
  (React pesado); o player e o editor rodam na origem oficial do TurboWarp e
  carregam o `.sb3` da nossa origem via URL + CORS.
- **JavaScript ES6 puro** — componentes são funções que retornam HTML; o router
  usa hash (funciona em qualquer host estático); o estado usa um event bus.
- **Renderizador de markdown próprio** — zero dependências, cobre o subconjunto
  usado pelas lições (títulos, listas, ênfase, código, links).
- **Jogos demo gerados por script** — `scripts/make_demo_game.mjs` produz `.sb3`
  reais (codificador PNG e gravador ZIP minimalistas) sem nenhuma dependência.

## Documentação

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitetura, diagrama, fluxo do
  aluno e roadmap para LMS com IA (login, progresso, ranking, tutor).
- [docs/PLAN.md](docs/PLAN.md) — plano de implementação do MVP.

## Licença

MIT — veja `LICENSE`.
