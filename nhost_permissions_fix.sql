-- PERMISSÕES ADICIONAIS PARA O FRONTEND CRIAR TENANTS
-- Execute isso no SQL Editor do Nhost/Hasura

-- 1. Permitir que usuários autenticados criem uma empresa (Tenant)
create policy "Authenticated users can create tenant" on public.tenants
  for insert with check (true);

-- 2. Garantir que o usuário possa atualizar seu próprio perfil (já deve existir, mas reforçando)
-- A policy "Users can update own profile" já foi criada no script anterior.

-- 3. Ajuste na policy de SELECT do Tenant para permitir ver o tenant que acabou de criar
-- (A policy anterior usava get_auth_tenant_id(), que depende do perfil estar atualizado)
-- Vamos permitir ver tenants onde o usuário é 'owner' (precisamos adicionar owner_id na tabela tenants ou confiar no fluxo)
-- Por enquanto, vamos manter a policy de select como está, pois após o update do profile, o usuário verá o tenant.

-- 4. Adicionar coluna owner_id em tenants para facilitar permissões (Opcional mas recomendado)
alter table public.tenants add column if not exists owner_id uuid references auth.users(id);

-- Atualizar policy de tenants para incluir owner
drop policy if exists "Users can view own tenant" on public.tenants;
create policy "Users can view own tenant" on public.tenants
  for select using (
    id = get_auth_tenant_id() 
    or owner_id = get_current_user_id()
    or is_admin()
  );

create policy "Users can update own tenant" on public.tenants
  for update using (
    owner_id = get_current_user_id()
    or is_admin()
  );
