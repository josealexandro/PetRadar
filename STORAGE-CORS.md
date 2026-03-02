# CORS no Firebase Storage

Se aparecer **"CORS Preflight Did Not Succeed"** para `firebasestorage.googleapis.com` no DevTools (aba Rede), o bucket do Storage não está permitindo requisições do seu domínio. Isso afeta:

- **Cadastro (criar conta)** ao enviar foto de perfil (avatar)
- **Adicionar animal** ao enviar fotos do pet

## Diagnóstico (averiguar com calma)

1. **Confirmar a URL e a origem**
   - No site em produção (ex.: www.peteradar.com.br), abra DevTools (F12) → aba **Rede**.
   - Tente criar conta com foto (ou adicionar animal com foto).
   - Clique na requisição que falhou (OPTIONS em vermelho) para `firebasestorage.googleapis.com`.
   - Veja **Cabeçalhos da solicitação** (Request Headers): qual é o valor de **Origin**? (ex.: `https://www.peteradar.com.br` — sem barra no final.)
   - Veja a **URL da requisição**: deve conter o bucket `resgata-208ef.firebasestorage.app`. Se aparecer outro bucket, o app em produção pode estar usando outra variável de ambiente.

2. **Conferir o CORS aplicado no bucket**
   ```bash
   gsutil cors get gs://resgata-208ef.firebasestorage.app
   ```
   A lista de `origin` deve conter **exatamente** a origem que o navegador envia (com `https://`, com ou sem `www`, conforme você acessa o site).

3. **Teste temporário com origem `*` (só para isolar o problema)**
   - No `storage.cors.json`, troque temporariamente `"origin"` por `["*"]`.
   - Rode de novo: `gsutil cors set storage.cors.json gs://resgata-208ef.firebasestorage.app`
   - Teste em produção (criar conta com foto). **Se funcionar**, o problema era a origem (ex.: falta `www`, ou você acessa por outro domínio). Volte então as origens específicas (`https://peteradar.com.br`, `https://www.peteradar.com.br`) e reaplique o CORS.

4. **Cache do navegador**
   - Teste em **aba anônima** ou com cache desativado (DevTools → Rede → “Desabilitar cache”) para não reutilizar uma resposta antiga do preflight.

## Solução: configurar CORS no bucket

### 1. Instalar Google Cloud SDK (inclui `gsutil`)

- **Windows:** https://cloud.google.com/sdk/docs/install  
- Ou com Chocolatey: `choco install gcloudsdk`

### 2. Fazer login e definir o projeto

```bash
gcloud auth login
gcloud config set project resgata-208ef
```

### 3. Aplicar o CORS no bucket

O bucket deste projeto é **`resgata-208ef.firebasestorage.app`**. (O bucket `.appspot.com` não existe neste projeto; ignore se aparecer 404.)

```bash
gsutil cors set storage.cors.json gs://resgata-208ef.firebasestorage.app
```

### 4. Conferir

```bash
gsutil cors get gs://resgata-208ef.firebasestorage.app
```

Deve listar as origens (localhost, peteradar.com.br, www.peteradar.com.br).

### 5. Testar de novo

Recarregue o site em produção, tente criar conta (com foto) ou adicionar animal. O upload não deve mais dar erro de CORS.

---

**Se você acessar pelo domínio da Vercel** (ex.: `seu-projeto.vercel.app`): adicione essa URL exata na lista `"origin"` do `storage.cors.json` e rode o `gsutil cors set` de novo. Cada origem deve estar explícita (não há suporte a wildcard).

---

## Se o CORS continuar falhando depois de aplicar

1. **Aplicar pelo Google Cloud Shell** (garante projeto e permissões corretos):
   - Abra [Google Cloud Console](https://console.cloud.google.com) → projeto **resgata-208ef** → ícone **>_** (Cloud Shell).
   - Crie o arquivo (ex.: `nano storage.cors.json` ou pelo editor) com o mesmo conteúdo do `storage.cors.json` do projeto.
   - Rode: `gsutil cors set storage.cors.json gs://resgata-208ef.firebasestorage.app`
   - Confira: `gsutil cors get gs://resgata-208ef.firebasestorage.app`

2. **Alternativa com gcloud** (em vez de gsutil):
   ```bash
   gcloud storage buckets update gs://resgata-208ef.firebasestorage.app --cors-file=storage.cors.json
   ```

3. **Confirmar o bucket que o app usa em produção**  
   No DevTools → Rede → clique na requisição OPTIONS que falhou. Veja a **URL completa**: deve conter `resgata-208ef.firebasestorage.app`. Se aparecer outro bucket (ex.: `resgata-208ef.appspot.com` ou algo diferente), a variável `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` na Vercel pode estar errada ou o deploy pode ter sido feito sem ela.

4. **Cache**  
   Marque "Desativar cache" na aba Rede do DevTools e teste em **aba anônima**.
