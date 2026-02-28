# Guia de Solução de Problemas (Troubleshooting)

Se você está vendo erros como `field 'profiles_by_pk' not found` ou tela branca, siga estes passos.

## 1. O Erro "profiles_by_pk not found"

Este erro acontece porque o Hasura (motor do Nhost) não está "rastreando" a tabela `profiles` ou as permissões estão bloqueadas.

**Solução:**

1. Vá para o painel do Nhost > **Database** > **SQL Editor**.
2. Cole e execute este comando para garantir que a tabela existe e está correta:

```sql
-- Recriar tabela profiles se necessário e garantir permissões
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  tenant_id bigint,
  username text,
  name text,
  role text DEFAULT 'cashier',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Garantir que o Hasura rastreie a tabela (isso geralmente é automático, mas permissões são chave)
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.profiles TO public;
```

3. **IMPORTANTE:** Vá para a aba **Hasura** (botão "Hasura" no topo ou link direto se disponível, geralmente é `https://seu-subdominio.hasura.app`).
   - Se não tiver acesso direto ao Hasura Console, use o **Nhost Dashboard** > **Database** > **Permissions**.
   - Verifique se a role `public` ou `user` tem permissão de `SELECT` na tabela `profiles`.

## 2. Rodar o Script de Correção de Permissões (RLS)

Se você ainda não rodou, **é obrigatório** rodar o script `nhost_rls_fix.sql` que criei na raiz do projeto.

1. Copie o conteúdo de `nhost_rls_fix.sql`.
2. Cole no SQL Editor do Nhost.
3. Clique em **Run**.

Isso corrige o "loop infinito" de permissões que impede o carregamento do perfil.

## 3. Erro de Tela Branca / Loading Infinito

Se o dashboard fica carregando para sempre:
- Isso acontecia porque o código estava tentando buscar dados de `/api/stats` (que não existe mais, pois migramos para Nhost).
- **Eu já corrigi isso no código.** Agora o Dashboard busca dados diretamente do Nhost via GraphQL.
- **Recarregue a página** para pegar a nova versão.
