import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, User, Lock, AlertCircle, Building2, ArrowLeft, UserPlus, KeyRound, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSignInEmailPassword, useSignUpEmailPassword, useNhostClient } from '@nhost/react';

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function Login() {
  const { login, user } = useAuth(); // Keeping this for legacy compatibility or if AuthContext is adapted
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Nhost Hooks
  const { signInEmailPassword, isLoading: isLoginLoading, isSuccess: isLoginSuccess, error: loginError } = useSignInEmailPassword();
  const { signUpEmailPassword, isLoading: isRegisterLoading, isSuccess: isRegisterSuccess, error: registerError } = useSignUpEmailPassword();
  const nhost = useNhostClient();

  // Form States
  const [username, setUsername] = useState(''); // Used as email in login for now, or display name
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If Nhost user is authenticated, redirect
    if (nhost.auth.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [nhost.auth.isAuthenticated(), navigate]);

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // Nhost Login
        // We use 'username' state as email for login if user entered email there
        // Or we should enforce email field. Let's assume username field contains email for Nhost login.
        const loginEmail = email || username; // Prefer email field if visible, else username field
        
        const res = await signInEmailPassword(loginEmail, password);
        
        if (res.isError) {
          setError(res.error?.message || 'Erro ao fazer login');
        } else {
          // Success handled by useEffect
        }

      } else if (mode === 'register') {
        // Nhost Register
        const slug = tenantName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        
        const res = await signUpEmailPassword(email, password, {
          displayName: name,
          metadata: {
            username: username,
            tenantName: tenantName,
            tenantSlug: slug
          }
        });

        if (res.isError) {
          setError(res.error?.message || 'Erro ao criar conta');
        } else {
          // If auto-login is enabled in Nhost, we might be logged in.
          // If email verification is required, we show message.
          if (res.needsEmailVerification) {
            setSuccess('Conta criada! Verifique seu email para ativar.');
            setMode('login');
          } else {
            // User is created and logged in. Now we need to create the Tenant.
            // We use GraphQL to insert the tenant.
            // Note: This requires the user to have permission to insert into 'tenants'.
            // See nhost_permissions_fix.sql
            try {
              const createTenantMutation = `
                mutation CreateTenant($name: String!, $slug: String!) {
                  insert_tenants_one(object: {name: $name, slug: $slug}) {
                    id
                  }
                }
              `;
              
              const tenantRes = await nhost.graphql.request(createTenantMutation, {
                name: tenantName,
                slug: slug
              });

              if (tenantRes.error) {
                console.error('Error creating tenant:', tenantRes.error);
                setError('Conta criada, mas erro ao configurar empresa. Contate suporte.');
              } else {
                 const tenantId = tenantRes.data.insert_tenants_one.id;
                 
                 // Update user profile with tenant_id
                 // Note: The trigger handle_new_nhost_user might have created a profile already with null tenant_id
                 // We need to update it.
                 const userId = res.user?.id;
                 const updateProfileMutation = `
                    mutation UpdateProfile($userId: uuid!, $tenantId: bigint!) {
                      update_profiles_by_pk(pk_columns: {id: $userId}, _set: {tenant_id: $tenantId, role: "admin"}) {
                        id
                      }
                    }
                 `;
                 
                 await nhost.graphql.request(updateProfileMutation, {
                    userId: userId,
                    tenantId: tenantId
                 });

                 setSuccess('Empresa cadastrada com sucesso! Você ganhou 7 dias de acesso grátis ao plano Profissional.');
                 // Redirect handled by auth state change
              }
            } catch (tenantErr) {
              console.error('Tenant creation error:', tenantErr);
              // Even if tenant creation fails here, user is created. 
              // Ideally we should handle this better (transaction or cloud function).
              setError('Erro ao configurar dados da empresa.');
            }
          }
        }

      } else if (mode === 'forgot-password') {
        await nhost.auth.resetPassword({ email });
        setSuccess('Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#1a1a1a] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-xl shadow-red-900/20 mb-4">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white">MeatMaster Pro</h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'login' && 'Acesse o sistema de gestão'}
            {mode === 'register' && 'Crie sua conta multi-tenant'}
            {mode === 'forgot-password' && 'Recupere sua senha'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-500 text-sm overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3 text-emerald-500 text-sm overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Ex: Açougue do João"
                  value={tenantName}
                  onChange={e => setTenantName(e.target.value)}
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'forgot-password') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">ID da Empresa (Slug)</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Ex: meatmaster"
                  value={tenantSlug}
                  onChange={e => setTenantSlug(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email Field - Required for Register and Forgot Password. Optional/Alternative for Login */}
          {(mode === 'register' || mode === 'forgot-password' || mode === 'login') && (
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                 {mode === 'login' ? 'E-mail' : 'Seu E-mail'}
               </label>
               <div className="relative group">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                 <input 
                   type="email" 
                   required={mode !== 'login'} // Optional in login if username is used, but we prefer email
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                   placeholder="seu@email.com"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
               </div>
             </div>
          )}

          {mode === 'register' && (
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuário (Opcional)</label>
               <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                 <input 
                   type="text" 
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                   placeholder="Ex: admin"
                   value={username}
                   onChange={e => setUsername(e.target.value)}
                 />
               </div>
             </div>
          )}

          {mode !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' && <LogIn className="w-5 h-5" />}
                {mode === 'register' && <UserPlus className="w-5 h-5" />}
                {mode === 'forgot-password' && <KeyRound className="w-5 h-5" />}
                {mode === 'login' ? 'Entrar no Sistema' : mode === 'register' ? 'Criar Minha Empresa' : 'Recuperar Senha'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
          {mode === 'login' ? (
            <div className="text-center">
              <span className="text-slate-500 text-sm">Não tem uma conta? </span>
              <button 
                onClick={() => setMode('register')}
                className="text-red-500 font-bold text-sm hover:text-red-400 transition-colors"
              >
                Cadastre sua empresa
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setMode('login')}
              className="flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Login
            </button>
          )}
          
          <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold text-center">
            MeatMaster Pro System v2.0 • Multi-Tenant
          </p>
        </div>
      </motion.div>
    </div>
  );
}
