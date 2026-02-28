import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Calendar, Download, Filter, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNhostClient, useUserData } from "@nhost/react";
import { format, startOfMonth, endOfMonth, parseISO, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // Data de competência/vencimento
  status: 'completed' | 'pending' | 'cancelled';
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
}

export default function Finance() {
  const nhost = useNhostClient();
  const user = useUserData();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'payable' | 'receivable'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filtros de data
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // Novo formulário de transação
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Outros',
    date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'pending',
    payment_method: 'Dinheiro'
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = `
        query GetTransactions($start: date!, $end: date!) {
          transactions(where: {
            _or: [
              {date: {_gte: $start, _lte: $end}},
              {due_date: {_gte: $start, _lte: $end}}
            ]
          }, order_by: {date: desc}) {
            id
            description
            amount
            type
            category
            date
            status
            due_date
            payment_method
          }
        }
      `;
      
      const { data, error } = await nhost.graphql.request(query, {
        start: dateRange.start,
        end: dateRange.end
      });

      if (error) {
        console.error('Erro ao buscar transações:', error);
      } else {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, dateRange]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mutation = `
        mutation InsertTransaction($object: transactions_insert_input!) {
          insert_transactions_one(object: $object) {
            id
          }
        }
      `;
      
      const { error } = await nhost.graphql.request(mutation, {
        object: {
          description: newTransaction.description,
          amount: parseFloat(newTransaction.amount),
          type: newTransaction.type,
          category: newTransaction.category,
          date: newTransaction.date,
          due_date: newTransaction.due_date,
          status: newTransaction.status,
          payment_method: newTransaction.payment_method,
          tenant_id: user?.metadata?.tenant_id // Assumindo que o tenant_id está nos metadados ou o backend resolve via RLS
        }
      });

      if (error) {
        console.error('Erro ao adicionar transação:', error);
        alert('Erro ao adicionar transação. Verifique o console para mais detalhes.');
      } else {
        setShowAddModal(false);
        setNewTransaction({
          description: '',
          amount: '',
          type: 'expense',
          category: 'Outros',
          date: format(new Date(), 'yyyy-MM-dd'),
          due_date: format(new Date(), 'yyyy-MM-dd'),
          status: 'pending',
          payment_method: 'Dinheiro'
        });
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const mutation = `
        mutation MarkAsPaid($id: bigint!, $paid_at: timestamptz!) {
          update_transactions_by_pk(pk_columns: {id: $id}, _set: {status: "completed", paid_at: $paid_at}) {
            id
          }
        }
      `;
      
      await nhost.graphql.request(mutation, {
        id,
        paid_at: new Date().toISOString()
      });
      
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  // Cálculos
  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'payable') return t.type === 'expense' && t.status === 'pending';
    if (activeTab === 'receivable') return t.type === 'income' && t.status === 'pending';
    return true;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const balance = totalIncome - totalExpense;

  const pendingPayable = transactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const pendingReceivable = transactions
    .filter(t => t.type === 'income' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro Detalhado</h1>
          <p className="text-slate-500">Fluxo de caixa, contas a pagar e receber</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="date" 
            value={dateRange.start}
            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm"
          />
          <input 
            type="date" 
            value={dateRange.end}
            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm"
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
          >
            <Plus className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">Saldo em Caixa</p>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </span>
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-slate-100' : 'bg-red-100'}`}>
              <ArrowUpRight className={`w-5 h-5 ${balance >= 0 ? 'text-slate-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">A Receber (Pendente)</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(pendingReceivable)}</span>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">A Pagar (Pendente)</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-red-600">{formatCurrency(pendingPayable)}</span>
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">Resultado Realizado</p>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </span>
            <div className="p-2 bg-slate-100 rounded-lg">
              <Filter className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Fluxo de Caixa
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('payable')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'payable' ? 'text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Contas a Pagar
          {activeTab === 'payable' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('receivable')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'receivable' ? 'text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Contas a Receber
          {activeTab === 'receivable' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />}
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Carregando...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Nenhuma transação encontrada.</td></tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {t.description}
                      <div className="text-xs text-slate-400 font-normal">{t.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">{t.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {t.due_date ? format(parseISO(t.due_date), 'dd/MM/yyyy') : '-'}
                      {t.status === 'pending' && t.due_date && isBefore(parseISO(t.due_date), new Date()) && (
                        <span className="ml-2 text-xs text-red-600 font-bold">(Atrasado)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {t.status === 'completed' ? (
                        <span className="text-emerald-600 text-xs font-bold uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Pago
                        </span>
                      ) : t.status === 'cancelled' ? (
                        <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Cancelado
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs font-bold uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {t.status === 'pending' && (
                        <button 
                          onClick={() => handleMarkAsPaid(t.id)}
                          className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-colors"
                          title="Marcar como Pago/Recebido"
                        >
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Nova Transação</h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${newTransaction.type === 'expense' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Despesa (Saída)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${newTransaction.type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}
                  >
                    Receita (Entrada)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Ex: Fornecedor de Carnes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={newTransaction.amount}
                    onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={newTransaction.category}
                    onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                  >
                    <option value="Vendas">Vendas</option>
                    <option value="Fornecedores">Fornecedores</option>
                    <option value="Utilidades">Utilidades (Luz/Água)</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Salários">Salários</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Impostos">Impostos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vencimento</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={newTransaction.due_date}
                    onChange={e => setNewTransaction({...newTransaction, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={newTransaction.status}
                    onChange={e => setNewTransaction({...newTransaction, status: e.target.value as any})}
                  >
                    <option value="pending">Pendente</option>
                    <option value="completed">Pago/Recebido</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
