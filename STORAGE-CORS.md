# CORS no Firebase Storage

Se aparecer **"CORS Preflight Did Not Succeed"** para `firebasestorage.googleapis.com` no DevTools (aba Rede), o bucket do Storage não está permitindo requisições do seu domínio. Isso afeta:

- **Cadastro (criar conta)** ao enviar foto de perfil (avatar)
- **Adicionar animal** ao enviar fotos do pet

## Solução: configurar CORS no bucket

### 1. Instalar Google Cloud SDK (inclui `gsutil`)

- **Windows:** https://cloud.google.com/sdk/docs/install  
- Ou com Chocolatey: `choco install gcloudsdk`

### 2. Fazer login e definir o projeto

```bash
gcloud auth login
gcloud config set project resgata-208ef
```

### 3. Aplicar o CORS nos dois buckets

O Firebase pode usar **`resgata-208ef.firebasestorage.app`** ou **`resgata-208ef.appspot.com`**. Aplique o CORS nos dois para garantir:

```bash
gsutil cors set storage.cors.json gs://resgata-208ef.firebasestorage.app
gsutil cors set storage.cors.json gs://resgata-208ef.appspot.com
```

### 4. Conferir

```bash
gsutil cors get gs://resgata-208ef.firebasestorage.app
gsutil cors get gs://resgata-208ef.appspot.com
```

Ambos devem listar as origens (localhost, peteradar.com.br, www.peteradar.com.br).

### 5. Testar de novo

Recarregue o site em produção, tente criar conta (com foto) ou adicionar animal. O upload não deve mais dar erro de CORS.

---

**Se você acessar pelo domínio da Vercel** (ex.: `seu-projeto.vercel.app`): adicione essa URL exata na lista `"origin"` do `storage.cors.json` e rode o `gsutil cors set` de novo. Cada origem deve estar explícita (não há suporte a wildcard).
