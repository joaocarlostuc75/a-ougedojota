# Instruções de Migração do Módulo Financeiro

Para ativar as novas funcionalidades de **Contas a Pagar/Receber** e **Fluxo de Caixa Detalhado**, você precisa atualizar a estrutura do banco de dados no Nhost.

## Passo a Passo

1. **Acesse o Painel do Nhost:**
   - Vá para [app.nhost.io](https://app.nhost.io) e entre no seu projeto.

2. **Abra o Editor SQL:**
   - No menu lateral, clique em **Database**.
   - Selecione a aba **SQL Editor**.

3. **Execute o Script de Migração:**
   - Copie todo o conteúdo do arquivo `nhost_finance_migration.sql` que está na raiz do seu projeto.
   - Cole no editor SQL do Nhost.
   - Clique em **Run SQL**.

4. **Verifique se deu certo:**
   - Se não houver erros, a tabela `transactions` agora terá colunas como `status`, `due_date` e `paid_at`.

## O que mudou?
- Agora você pode lançar contas futuras (agendamentos).
- Pode controlar o que já foi pago e o que está pendente.
- O painel financeiro mostra alertas de contas atrasadas.
