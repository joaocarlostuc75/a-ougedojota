import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthenticationStatus, useUserData, useNhostClient, useSignOut } from '@nhost/react';

// Adaptando a interface para suportar UUID do Nhost
export interface User {
  id: string | number; // Nhost usa UUID
  tenant_id: number;
  username: string;
  name: string;
  role: 'super_admin' | 'admin' | 'cashier' | 'stock_manager';
  tenant?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void; // Mantido para compatibilidade, mas não faz nada com Nhost
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthenticationStatus();
  const nhostUser = useUserData();
  const { signOut } = useSignOut();
  const nhost = useNhostClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Busca o perfil completo no banco de dados quando o usuário autentica
  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (!isAuthenticated || !nhostUser) {
        if (isMounted) setUser(null);
        return;
      }

      setIsProfileLoading(true);
      try {
        // Query alternativa usando 'profiles' (lista) caso 'profiles_by_pk' não esteja disponível
        const query = `
          query GetUserProfile($id: uuid!) {
            profiles(where: {id: {_eq: $id}}) {
              id
              username
              name
              role
              tenant_id
              tenant {
                id
                name
                slug
              }
            }
          }
        `;

        const { data, error } = await nhost.graphql.request(query, { id: nhostUser.id });
        
        if (error) {
          console.error('AuthContext: Erro ao buscar perfil:', error);
        } else {
          console.log('AuthContext: Perfil carregado com sucesso:', data);
        }

        const profileData = data?.profiles?.[0];

        if (error || !profileData) {
          console.warn('Perfil não encontrado no banco (ou erro de permissão). Usando fallback.');
          
          // Fallback se não tiver perfil criado ainda (usa metadados do Auth)
          if (isMounted) {
             setUser({
               id: nhostUser.id,
               tenant_id: Number(nhostUser.metadata?.tenant_id || 0),
               username: nhostUser.metadata?.username as string || nhostUser.email?.split('@')[0] || 'user',
               name: nhostUser.displayName,
               role: (nhostUser.metadata?.role as any) || 'cashier',
               tenant: {
                 id: Number(nhostUser.metadata?.tenant_id || 0),
                 name: nhostUser.metadata?.tenantName as string || 'Minha Loja',
                 slug: nhostUser.metadata?.tenantSlug as string || 'loja'
               }
             });
          }
        } else {
          if (isMounted) {
            setUser({
              id: profileData.id,
              tenant_id: profileData.tenant_id || 0, // Garante que não quebre se for null
              username: profileData.username,
              name: profileData.name,
              role: profileData.role as any,
              tenant: profileData.tenant ? {
                id: profileData.tenant.id,
                name: profileData.tenant.name,
                slug: profileData.tenant.slug
              } : undefined
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsProfileLoading(false);
      }
    }

    fetchProfile();

    return () => { isMounted = false; };
  }, [isAuthenticated, nhostUser, nhost]);

  const login = (userData: User) => {
    // Com Nhost, o login é gerenciado pelo hook useSignInEmailPassword nos componentes
    // Essa função fica apenas para compatibilidade se algum componente chamar manualmente
    console.warn('AuthContext.login() chamado manualmente. O estado é gerenciado pelo Nhost.');
  };

  const logout = () => {
    signOut();
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    // Idealmente, isso deveria atualizar no backend também
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const isLoading = isAuthLoading || isProfileLoading;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
