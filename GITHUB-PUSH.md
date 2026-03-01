# Subir o PetRadar para o GitHub

Siga estes passos **no terminal** (PowerShell ou CMD), na pasta do projeto.

## 1. Ir para a pasta do projeto

```powershell
cd E:\resgataAnimais
```

## 2. Inicializar o Git (se ainda não for um repositório)

```powershell
git init
```

## 3. Adicionar o remote do GitHub

```powershell
git remote add origin https://github.com/josealexandro/PetRadar.git
```

Se já existir um `origin` e você quiser trocar:

```powershell
git remote set-url origin https://github.com/josealexandro/PetRadar.git
```

## 4. Adicionar todos os arquivos

```powershell
git add .
```

(O `.gitignore` já evita enviar `.env.local`, `node_modules`, `.next`, etc.)

## 5. Fazer o primeiro commit

```powershell
git commit -m "feat: app PetRadar - resgate de animais com mapa e filtros"
```

## 6. Nomear o branch principal como main

```powershell
git branch -M main
```

## 7. Enviar para o GitHub

```powershell
git push -u origin main
```

Se o repositório no GitHub pedir autenticação, use seu usuário e um **Personal Access Token** (em vez da senha) ou configure o GitHub CLI (`gh auth login`).

---

**Resumo em sequência:**

```powershell
cd E:\resgataAnimais
git init
git remote add origin https://github.com/josealexandro/PetRadar.git
git add .
git commit -m "feat: app PetRadar - resgate de animais com mapa e filtros"
git branch -M main
git push -u origin main
```

Depois disso, o código estará em: https://github.com/josealexandro/PetRadar
