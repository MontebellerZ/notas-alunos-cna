# Frontend Desktop (Electron + React + Vite)

Este frontend roda como app desktop com Electron e usa Vite no modo desenvolvimento.

## Scripts

- `npm run dev`: sobe Vite e abre o Electron apontando para `http://localhost:5173`
- `npm run dev:web`: sobe apenas o frontend web (Vite)
- `npm run build`: gera build de produção do frontend em `dist/`
- `npm run start`: abre o Electron em modo produção (carrega `dist/index.html`)
- `npm run dist`: gera instalador Windows via electron-builder em `release/`

## Fluxo recomendado

1. Desenvolvimento desktop: `npm run dev`
2. Build de produção: `npm run build`
3. Teste local da build desktop: `npm run start`
4. Geração de instalador: `npm run dist`

## Estrutura Electron

- `electron/main.js`: processo principal (criação da janela e ciclo de vida do app)
- `electron/preload.js`: camada segura para expor APIs ao renderer

## Observações

- A porta do Vite é fixa (`5173`) para sincronizar com o Electron.
- `contextIsolation` está habilitado e `nodeIntegration` está desabilitado por segurança.
