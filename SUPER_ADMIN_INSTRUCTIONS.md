# Como Tornar um Usuário Super Admin

Para transformar um usuário comum em **Super Admin** (com acesso total ao sistema e ao painel de gerenciamento), você precisa alterar a função (role) dele diretamente no banco de dados do Nhost.

## Passo a Passo

1. **Acesse o Painel do Nhost:**
   - Vá para [app.nhost.io](https://app.nhost.io) e entre no seu projeto.

2. **Abra o Editor SQL:**
   - No menu lateral, clique em **Database**.
   - Selecione a aba **SQL Editor**.

3. **Execute o Comando de Atualização:**
   - Copie e cole o código abaixo, substituindo `seu_email@exemplo.com` pelo e-mail do usuário que você quer promover.

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'seu_email@exemplo.com'
);
```

4. **Clique em "Run SQL"**.

## Verificação
Peça para o usuário fazer logout e login novamente. Ele verá o item **Super Admin** no menu lateral e terá acesso irrestrito a todas as rotas.
