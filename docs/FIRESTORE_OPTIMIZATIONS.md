# Otimizações Firestore

Resumo das otimizações aplicadas e o que cada uma faz.

---

## 1. Paginação

**Onde:** `lib/animals.ts`, `app/page.tsx`

**O que foi feito:**
- A lista de animais não carrega tudo de uma vez. A primeira carga usa `limit(ANIMALS_PAGE_SIZE)` (20 documentos).
- Um cursor é guardado (`lastDoc`) e o botão "Carregar mais" chama `fetchAnimalsNextPage(lastDoc)`, que usa `startAfter(lastDoc)` para buscar os próximos 20.

**Por quê:**
- Reduz leituras por carregamento e tempo de resposta.
- Quem só vê a primeira tela não paga leitura dos demais documentos.
- A paginação por cursor evita pular ou duplicar itens quando a base muda.

---

## 2. Limitar queries

**Onde:** `lib/animals.ts` (`limit(ANIMALS_PAGE_SIZE)`), `lib/helps.ts` (`limit(HELPS_READ_LIMIT)`)

**O que foi feito:**
- **Animals:** toda query de lista usa `limit(20)`. Nunca traz mais que uma página.
- **Helps:** a query que busca os animais que o usuário ajudou usa `limit(500)`. Quem tem mais de 500 ajudas continua com contador certo no perfil; só não marcamos "Ajudado" além desse limite.

**Por quê:**
- Cada documento lido é cobrado e consome banda. Limitar garante teto de leituras por operação e evita queries pesadas.

---

## 3. Indexes

**Onde:** `firestore.indexes.json`

**O que foi feito:**
- Índice composto na coleção `animals`: `status` (ASC) + `createdAt` (DESC), usado na query da home (animais abertos, mais recentes primeiro).

**Por quê:**
- Queries com `where` + `orderBy` em campos diferentes precisam de índice composto. Sem ele o Firestore retorna erro e indica o índice no console.
- Com o índice, a query roda no servidor de forma eficiente em vez de varrer a coleção inteira.

**Como aplicar:**  
No Firebase Console → Firestore → Indexes, ou com CLI:  
`firebase deploy --only firestore:indexes`

---

## 4. Regras de segurança

**Onde:** `firestore.rules`

**O que foi feito:**
- **animals:** leitura aberta; criação só autenticado e com `createdBy == auth.uid`; atualização só dono ou apenas campos `reportCount`/`status` (fluxo de denúncia).
- **reports:** só criação, autenticado e com `reportedBy == auth.uid`; sem leitura/update/delete no app.
- **helps:** leitura/escrita só quando `userId` do documento é o usuário autenticado.
- **users:** leitura/escrita só no próprio documento (`userId == auth.uid`).

**Por quê:**
- Garante que usuários só alterem seus dados e que denúncias não possam ser forjadas (só criar com `reportedBy` do auth).
- Reduz risco de leitura/escrita indevida por cliente manipulado.

---

## 5. Evitar leituras desnecessárias

**Onde:** paginação, limite em helps, cache local

**O que foi feito:**
- Carregar animais em páginas de 20 e "Carregar mais" sob demanda: só lê o que o usuário pode ver.
- Limite de 500 em helps: evita ler milhares de documentos para um único usuário muito ativo.
- Cache local (item 6) faz com que novas visitas/abas usem dados em disco quando possível, reduzindo leituras na rede.

**Por quê:**
- Menos documentos lidos = menor custo e menos tempo de resposta. Só buscar o necessário e reutilizar o que já está em cache.

---

## 6. Cache local

**Onde:** `lib/firebase.ts`

**O que foi feito:**
- No **browser**, o Firestore é inicializado com `initializeFirestore(..., { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`.
- No **SSR (Node)**, usa `getFirestore(app)` sem persistência (não há IndexedDB).

**Por quê:**
- O SDK grava resultados no IndexedDB e reutiliza em novas queries e abas.
- Leituras repetidas (ex.: mesma lista, mesmo perfil) podem ser atendidas pelo cache, sem nova leitura na rede.
- Várias abas compartilham o mesmo cache (multi-tab), mantendo consistência e menos tráfego.
- Em modo offline, as leituras já em cache continuam funcionando.

---

## Resumo

| Otimização           | Objetivo principal                          |
|----------------------|---------------------------------------------|
| Paginação            | Menos leituras e resposta mais rápida      |
| Limitar queries      | Teto de leituras por operação               |
| Indexes              | Queries compostas eficientes no servidor    |
| Regras de segurança  | Acesso só ao permitido por usuário         |
| Evitar leituras      | Buscar só o necessário e reusar cache      |
| Cache local          | Reuso em disco e entre abas, menos rede    |
