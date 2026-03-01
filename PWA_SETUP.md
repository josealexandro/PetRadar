# PWA — Onde cada arquivo foi criado

Projeto configurado como **PWA** com **next-pwa** (`@ducanh2912/next-pwa`).

---

## 1. Manifest (manifest.json)

**Caminho:** `public/manifest.json`

Define nome, ícones, cores e comportamento de instalação (standalone, orientação, `theme_color`, `background_color`). O navegador usa esse arquivo para “Adicionar à tela inicial” no mobile e para a splash screen.

---

## 2. Service worker

**Caminho:** gerado em `public/` pelo next-pwa no **build**

- **`public/sw.js`** — Service worker principal (gerado em `npm run build`).
- **`public/workbox-*.js`** — Script do Workbox (também gerado no build).

O next-pwa gera esses arquivos em `next build` e os coloca em `public/` (configurado com `dest: "public"` em `next.config.ts`). O service worker faz cache das rotas e usa a página de fallback offline quando não houver rede.

---

## 3. Ícones

**Caminho:** `public/icons/`

- **`public/icons/icon-192x192.png`** — 192×192 (Android e uso geral).
- **`public/icons/icon-512x512.png`** — 512×512 (instalação e splash).

Referenciados em `public/manifest.json` e em `app/layout.tsx` (metadata `icons` e `apple`). Se ainda não existirem, copie os PNGs gerados de `C:\Users\nagui\.cursor\projects\e-resgataAnimais\assets\` para `public/icons/`.

---

## 4. Página offline (offline fallback)

**Caminho:** `app/~offline/page.tsx`

Página exibida quando a rede falha e a rota não está em cache. O next-pwa está configurado com `fallbacks.document: "/~offline"` em `next.config.ts`, então qualquer navegação que falhe (rede + cache) mostra essa página.

- **`app/~offline/layout.tsx`** — Layout mínimo da rota `/~offline` (sem Navbar).

---

## 5. Configuração do next-pwa

**Caminho:** `next.config.ts`

- Importa `withPWA` de `@ducanh2912/next-pwa`.
- **`dest: "public"`** — Service worker e workbox gerados em `public/`.
- **`disable` em development** — Service worker só é gerado em produção.
- **`register: true`** — Registro automático do SW no cliente.
- **`skipWaiting: true`** — Nova versão do SW ativa logo após o build.
- **`fallbacks.document: "/~offline"`** — Fallback de documento para a página offline.

---

## 6. Layout e metadata PWA

**Caminho:** `app/layout.tsx`

- **`metadata.manifest`** — `/manifest.json` (link do manifest).
- **`metadata.icons`** — Ícone padrão e `apple` (apple-touch-icon).
- **`metadata.appleWebApp`** — Modo “app” no iOS (capable, título, barra de status).
- **`viewport.themeColor`** — Cor da barra do navegador (e splash no Android).

Isso deixa o app **instalável no mobile** (Android e iOS) e com ícone e tema corretos.

---

## Resumo dos arquivos

| O quê              | Onde está                          |
|--------------------|-------------------------------------|
| Manifest           | `public/manifest.json`              |
| Service worker     | `public/sw.js` (+ workbox) no build |
| Ícones             | `public/icons/icon-192x192.png`, `icon-512x512.png` |
| Página offline     | `app/~offline/page.tsx` (+ layout)  |
| Config next-pwa    | `next.config.ts`                    |
| Metadata PWA       | `app/layout.tsx`                    |

---

## Como testar

1. **Instalar dependências** (se ainda não tiver):  
   `npm install`

2. **Build de produção:**  
   `npm run build`  
   (gera `public/sw.js` e `public/workbox-*.js`)

3. **Rodar em produção:**  
   `npm run start`

4. No **Chrome/Edge** (desktop ou mobile): abrir o site, menu (⋮) → “Instalar app” / “Adicionar à tela inicial”.

5. **Offline:** DevTools → Application → Service Workers → “Offline”; navegar para uma rota não visitada antes para ver a página `/~offline`.
