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
        // Query para buscar dados do perfil e do tenant
        const query = `
          query GetUserProfile($id: uuid!) {
            profiles_by_pk(id: $id) {
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
          // Check if it's a "field not found" error which is expected if permissions are missing
          const isFieldNotFoundError = error.some((e: any) => e.message?.includes("field 'profiles_by_pk' not found"));
          
          if (isFieldNotFoundError) {
            console.warn('AuthContext: Tabela de perfis não encontrada ou sem permissão no Hasura. Usando fallback.');
          } else {
            console.error('AuthContext: Erro ao buscar perfil:', error);
          }
        } else {
          console.log('AuthContext: Perfil carregado com sucesso:', data);
        }

        if (error || !data?.profiles_by_pk) {
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
          const profile = data.profiles_by_pk;
          if (isMounted) {
            setUser({
              id: profile.id,
              tenant_id: profile.tenant_id,
              username: profile.username,
              name: profile.name,
              role: profile.role as any,
              tenant: {
                id: profile.tenant?.id,
                name: profile.tenant?.name,
                slug: profile.tenant?.slug
              }
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
