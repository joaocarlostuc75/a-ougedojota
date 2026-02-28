-- CORREÇÃO CRÍTICA DE PERMISSÕES (RLS)
-- Execute este script no SQL Editor do Nhost para corrigir o erro de carregamento do perfil

-- 1. Remover políticas antigas que podem estar causando loop infinito ou bloqueio
DROP POLICY IF EXISTS "Users can view profiles in same tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view tenant colleagues" ON public.profiles;
DROP POLICY IF EXISTS "Super Admin view all" ON public.profiles;

-- 2. Política simplificada: O usuário SEMPRE pode ver seu próprio perfil
-- Isso quebra o ciclo de dependência do get_auth_tenant_id()
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    id = get_current_user_id()
  );

-- 3. Política para ver outros perfis do mesmo tenant (para listar funcionários)
-- Só aplica se o usuário já tiver acesso ao seu próprio tenant_id
CREATE POLICY "Users can view tenant colleagues" ON public.profiles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = get_current_user_id()
    )
    OR is_admin()
  );

-- 4. Garantir permissão de INSERT para o Trigger funcionar (se necessário)
GRANT ALL ON public.profiles TO public;

-- 5. Correção para Super Admin ver tudo
CREATE POLICY "Super Admin view all" ON public.profiles
  FOR SELECT USING (
    is_admin() OR (SELECT role FROM public.profiles WHERE id = get_current_user_id()) = 'super_admin'
  );
