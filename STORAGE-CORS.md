# CORS no Firebase Storage

Se o formulário de **novo animal** ficar travado em "Salvando..." e no DevTools (aba Rede) aparecer **"CORS Preflight Did Not Succeed"** para `firebasestorage.googleapis.com`, o bucket do Storage não está permitindo requisições do navegador a partir do seu ambiente (ex.: localhost).

## Solução: configurar CORS no bucket

### 1. Instalar Google Cloud SDK (inclui `gsutil`)

- **Windows:** https://cloud.google.com/sdk/docs/install  
- Ou com Chocolatey: `choco install gcloudsdk`

### 2. Fazer login e definir o projeto

```bash
gcloud auth login
gcloud config set project SEU_PROJECT_ID
```

(O `SEU_PROJECT_ID` é o mesmo do Firebase, ex.: valor de `NEXT_PUBLIC_FIREBASE_PROJECT_ID` no `.env.local`. O bucket costuma ser `SEU_PROJECT_ID.appspot.com`.)

### 3. Aplicar o CORS no bucket do Storage

Na pasta do projeto (onde está o arquivo `storage.cors.json`):

```bash
gsutil cors set storage.cors.json gs://SEU_STORAGE_BUCKET
```

Substitua `SEU_STORAGE_BUCKET` pelo valor de **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET** do seu `.env.local` (ex.: `meu-projeto.appspot.com`).

Exemplo completo:

```bash
gsutil cors set storage.cors.json gs://resgata-animais-xxxxx.appspot.com
```

### 4. Testar de novo

Recarregue a página `/novo`, preencha o formulário e envie. O upload deve concluir sem erro de CORS.

---

**Produção:** quando fizer deploy (ex.: Vercel), adicione a URL do site em `storage.cors.json` na lista `"origin"` e rode o `gsutil cors set` de novo.
