# Configuração do Nhost

Siga este passo a passo para conectar o seu site ao Nhost.

## 1. Crie um Projeto no Nhost
1. Acesse [nhost.io](https://nhost.io) e faça login.
2. Clique em **Create Project**.
3. Dê um nome ao projeto (ex: `meatmaster-pro`) e escolha uma região próxima (ex: `sa-east-1` para São Paulo).
4. Aguarde a criação do projeto.

## 2. Obtenha as Chaves de Conexão
1. No painel do seu projeto no Nhost, vá para **Settings** > **General**.
2. Copie o **Subdomain** (ex: `abcdefghijklmnop`) e a **Region** (ex: `sa-east-1`).

## 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example`) e adicione as chaves copiadas:

```env
VITE_NHOST_SUBDOMAIN=seu-subdomain-aqui
VITE_NHOST_REGION=sua-regiao-aqui
```

> **Nota:** Não é necessário API Key para o frontend. O Nhost usa JWTs gerados no login para autenticar as requisições. Apenas o backend (se houver scripts rodando fora do navegador) precisaria de uma `NHOST_ADMIN_SECRET`.

## 4. Configuração do Banco de Dados
1. No painel do Nhost, vá para a aba **Database** > **SQL Editor**.
2. Copie o conteúdo do arquivo `nhost_schema.sql` gerado anteriormente.
3. Cole no editor e clique em **Run SQL**.
   - Isso criará todas as tabelas e políticas de segurança necessárias.

## 5. Configuração de Autenticação (Opcional)
Se desejar login social (Google, Facebook), vá para **Settings** > **Sign-In Methods** e configure os provedores desejados.

## 6. Testando a Conexão
O projeto já está configurado para usar o Nhost.
- O arquivo `src/lib/nhost.ts` inicializa o cliente.
- O `src/main.tsx` envolve a aplicação com o `NhostProvider`.
- Você pode usar hooks como `useSignInEmailPassword`, `useSignOut`, `useUserData` em qualquer componente.

Exemplo de uso em um componente:
```tsx
import { useSignInEmailPassword } from '@nhost/react';

const { signInEmailPassword } = useSignInEmailPassword();

const handleLogin = async () => {
  await signInEmailPassword(email, password);
};
```
