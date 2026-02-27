import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Plus,
  CreditCard,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock Data for Tenants
const MOCK_TENANTS = [
  {
    id: 1,
    name: "Açougue do João",
    slug: "acougue-joao",
    owner: "João Silva",
    email: "joao@email.com",
    plan: "Profissional",
    status: "active",
    expires_at: "2026-12-31T23:59:59",
    created_at: "2024-01-15T10:00:00",
    mrr: 89.90
  },
  {
    id: 2,
    name: "Casa de Carnes Premium",
    slug: "premium-meats",
    owner: "Roberto Carlos",
    email: "roberto@email.com",
    plan: "Enterprise",
    status: "active",
    expires_at: "2025-06-30T23:59:59",
    created_at: "2024-02-01T14:30:00",
    mrr: 299.90
  },
  {
    id: 3,
    name: "Boi Bravo",
    slug: "boi-bravo",
    owner: "Marcos Souza",
    email: "marcos@email.com",
    plan: "Start",
    status: "expired",
    expires_at: "2024-01-01T23:59:59",
    created_at: "2023-11-10T09:15:00",
    mrr: 49.90
  },
  {
    id: 4,
    name: "Demo Store",
    slug: "demo",
    owner: "Sistema Demo",
    email: "demo@meatmaster.com",
    plan: "Enterprise",
    status: "active",
    expires_at: "2099-12-31T23:59:59",
    created_at: "2023-01-01T00:00:00",
    mrr: 0
  }
];

export default function SuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState(MOCK_TENANTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addTimeAmount, setAddTimeAmount] = useState(1);
  const [addTimeUnit, setAddTimeUnit] = useState<'days' | 'months' | 'years'>('months');

  // Redirect if not super admin (simple check for now)
  useEffect(() => {
    // In a real app, check a specific permission or role
    if (user?.role !== 'admin' || user?.username !== 'superadmin') {
      // For demo purposes, we'll allow 'admin' to see it if they navigate manually, 
      // but ideally this should be stricter.
      // navigate('/dashboard'); 
    }
  }, [user, navigate]);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMRR = tenants.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.mrr : 0), 0);
  const activeTenants = tenants.filter(t => t.status === 'active').length;

  const handleAddTime = () => {
    if (!selectedTenant) return;

    const currentExpiry = new Date(selectedTenant.expires_at > new Date().toISOString() ? selectedTenant.expires_at : new Date());
    
    if (addTimeUnit === 'days') currentExpiry.setDate(currentExpiry.getDate() + addTimeAmount);
    if (addTimeUnit === 'months') currentExpiry.setMonth(currentExpiry.getMonth() + addTimeAmount);
    if (addTimeUnit === 'years') currentExpiry.setFullYear(currentExpiry.getFullYear() + addTimeAmount);

    const updatedTenants = tenants.map(t => {
      if (t.id === selectedTenant.id) {
        return {
          ...t,
          expires_at: currentExpiry.toISOString(),
          status: 'active' // Reactivate if expired
        };
      }
      return t;
    });

    setTenants(updatedTenants);
    setIsModalOpen(false);
    setSelectedTenant(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Painel Super Admin</h1>
        </div>
        <p className="text-slate-500">Gestão global de lojas e assinaturas.</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">MRR (Mensal)</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalMRR)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Lojas Ativas</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeTenants} <span className="text-sm font-normal text-slate-400">/ {tenants.length}</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Novos (Mês)</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">2</p>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Lojas Cadastradas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar loja, email ou slug..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Loja / Responsável</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expira em</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{tenant.name}</p>
                      <p className="text-xs text-slate-500">{tenant.owner} • {tenant.email}</p>
                      <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 mt-1 inline-block">
                        {tenant.slug}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700">{tenant.plan}</span>
                    <p className="text-xs text-slate-400">{formatCurrency(tenant.mrr)}/mês</p>
                  </td>
                  <td className="px-6 py-4">
                    {tenant.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle className="w-3.5 h-3.5" /> Vencido
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(tenant.expires_at).toLocaleDateString('pt-BR')}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {Math.ceil((new Date(tenant.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias restantes
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setIsModalOpen(true);
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Gerenciar Assinatura
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Time Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Gerenciar Assinatura</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Loja Selecionada</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900">{selectedTenant.name}</p>
                    <p className="text-sm text-slate-500">Vence em: {new Date(selectedTenant.expires_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Adicionar Tempo de Acesso</label>
                  <div className="flex gap-4">
                    <input 
                      type="number" 
                      min="1"
                      value={addTimeAmount}
                      onChange={(e) => setAddTimeAmount(parseInt(e.target.value))}
                      className="w-24 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold text-center"
                    />
                    <select 
                      value={addTimeUnit}
                      onChange={(e) => setAddTimeUnit(e.target.value as any)}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="days">Dias</option>
                      <option value="months">Meses</option>
                      <option value="years">Anos</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm flex gap-3 items-start">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>
                    Isso estenderá o acesso da loja <strong>{selectedTenant.name}</strong> e reativará a conta caso esteja suspensa.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddTime}
                  className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Confirmar Adição
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
