# CORREÇÃO OBRIGATÓRIA: Configurar Permissões no Hasura

O erro `field 'profiles_by_pk' not found` indica que o Hasura (o sistema que conecta o banco ao site) não está "vendo" a tabela de perfis ou não permite que o usuário a leia.

Você precisa configurar isso manualmente no painel do Nhost/Hasura. Siga estes passos exatos:

## Passo 1: Acessar o Hasura Console
1. Vá para o painel do seu projeto no **Nhost**.
2. No menu superior ou lateral, procure por um botão ou link chamado **Hasura** (às vezes fica dentro de "Database" -> "Hasura Console" ou um ícone de "H" roxo).
   - Se pedir senha (Admin Secret), você encontra ela no painel do Nhost em "Settings" -> "Secrets" -> `NHOST_ADMIN_SECRET`.

## Passo 2: Rastrear a Tabela (Track Table)
1. No Hasura Console, clique na aba **DATA** (no topo).
2. No menu lateral esquerdo, clique em **public**.
3. Procure a tabela `profiles`.
4. Se ela estiver na lista de "Untracked tables or views", clique no botão **Track** ao lado dela.
   - Se ela já estiver listada no menu lateral sob "public", pule para o Passo 3.

## Passo 3: Configurar Permissões (Permissions)
1. Clique na tabela `profiles` no menu lateral esquerdo.
2. Clique na aba **Permissions** (no topo, ao lado de Browse Rows).
3. Você verá uma grade de permissões. Procure a linha para a role **user** (se não existir, digite `user` na caixa "Enter new role").
4. Na coluna **select** (ícone de olho), clique no ícone (provavelmente está um "X").
5. Configure assim:
   - **Row select permissions:** Escolha **"Without any checks"** (para permitir ver tudo por enquanto) OU **"With custom check"** e use `{"id":{"_eq":"X-Hasura-User-Id"}}` (para ver apenas o próprio). *Recomendo "Without any checks" para testar o Super Admin agora.*
   - **Column select permissions:** Clique em **"Toggle All"** para selecionar todas as colunas (`id`, `username`, `role`, etc).
6. Clique em **Save Permissions**.

## Passo 4: Testar
1. Volte para o seu site.
2. Recarregue a página (F5).
3. O erro deve sumir e o sistema deve reconhecer seu usuário como **Super Admin**.
