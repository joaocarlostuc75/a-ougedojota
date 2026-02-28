-- Migração para Melhorias no Módulo Financeiro
-- Adiciona suporte a Contas a Pagar/Receber e Status de Transação

-- 1. Alterar tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'paid', -- 'pending', 'paid', 'cancelled'
ADD COLUMN IF NOT EXISTS due_date date DEFAULT current_date, -- Data de vencimento
ADD COLUMN IF NOT EXISTS paid_at timestamptz, -- Data do pagamento efetivo
ADD COLUMN IF NOT EXISTS customer_id bigint REFERENCES public.customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS supplier_id bigint REFERENCES public.suppliers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recurring boolean DEFAULT false, -- Se é recorrente (opcional futuro)
ADD COLUMN IF NOT EXISTS notes text;

-- Atualizar registros antigos para ter status 'paid' e due_date igual a date
UPDATE public.transactions 
SET status = 'paid', due_date = date, paid_at = created_at 
WHERE status IS NULL;

-- 2. Criar índices para performance em filtros de data e status
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON public.transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- 3. Policy update (se necessário, mas a existente 'Manage transactions same tenant' já cobre UPDATE/INSERT)
