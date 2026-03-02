# Deploy em produção (cadastro, login e postar animal)

Se **localmente funciona** mas **em produção não** (nem cadastro, nem login, nem postar animal), siga este checklist.

---

## 1. Variáveis de ambiente no provedor de hospedagem

O arquivo `.env.local` **não é enviado** no deploy (está no `.gitignore`). Em produção você precisa configurar as **mesmas variáveis** no painel do serviço onde o app está hospedado.

### Onde configurar

- **Vercel:** Project → Settings → Environment Variables  
- **Netlify:** Site → Site configuration → Environment variables  
- **Outros:** procure por "Environment Variables" ou "Variáveis de ambiente"

### Variáveis obrigatórias (copie os valores do seu `.env.local`)

| Nome | Exemplo |
|------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | AIzaSy... |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | resgata-208ef.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | resgata-208ef |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | resgata-208ef.firebasestorage.app |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 906655893845 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:906655893845:web:... |

Marque para **Production** (e opcionalmente Preview se usar). Depois do primeiro deploy com as variáveis, faça um **novo deploy** (Redeploy) para garantir que o build use os valores corretos.

---

## 2. Domínios autorizados no Firebase (Authentication)

O domínio onde o app está em produção precisa estar autorizado no Firebase.

1. Acesse [Firebase Console](https://console.firebase.google.com) → seu projeto.
2. **Authentication** → aba **Settings** → **Authorized domains**.
3. Adicione:
   - O domínio do seu site (ex: `peteradar.com.br`, `www.peteradar.com.br`).
   - Se usar Vercel, também o domínio do projeto (ex: `seu-projeto.vercel.app`).

Sem isso, login e cadastro falham em produção (e podem dar erro de domínio não autorizado no console do navegador).

---

## 3. CORS do Storage (postar animal com fotos)

Se o cadastro de animal com fotos falhar em produção (upload para o Firebase Storage):

1. No arquivo `storage.cors.json` do projeto, a lista `origin` deve incluir a URL do site em produção (ex: `https://peteradar.com.br`, `https://www.peteradar.com.br`).
2. Aplique de novo:  
   `gsutil cors set storage.cors.json gs://resgata-208ef.firebasestorage.app`

Detalhes: veja **STORAGE-CORS.md**.

---

## Resumo rápido

| O que não funciona | O que verificar |
|--------------------|------------------|
| Login / Cadastro   | 1. Env vars no host + 2. Domínio em Firebase Auth → Authorized domains |
| Postar animal (fotos) | 3. CORS do Storage com a URL de produção |

Depois de alterar variáveis de ambiente, **sempre fazer um novo deploy** para o build usar os valores atualizados.
