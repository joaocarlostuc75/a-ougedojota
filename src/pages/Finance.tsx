import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Calendar, Download, Filter } from "lucide-react";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'completed' | 'pending';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, description: "Venda #1023 - Balcão", amount: 156.90, type: 'income', category: 'Vendas', date: '2023-10-26', status: 'completed' },
  { id: 2, description: "Fornecedor de Carnes LTDA", amount: 2500.00, type: 'expense', category: 'Fornecedores', date: '2023-10-25', status: 'completed' },
  { id: 3, description: "Venda #1022 - Online", amount: 89.90, type: 'income', category: 'Vendas', date: '2023-10-25', status: 'completed' },
  { id: 4, description: "Conta de Energia (Enel)", amount: 450.00, type: 'expense', category: 'Utilidades', date: '2023-10-20', status: 'pending' },
  { id: 5, description: "Manutenção Freezer", amount: 150.00, type: 'expense', category: 'Manutenção', date: '2023-10-18', status: 'completed' },
];

export default function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">Fluxo de caixa e contas a pagar/receber</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Calendar className="w-4 h-4" />
            Outubro 2023
          </button>
          <button className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">Receitas (Mês)</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</span>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">Despesas (Mês)</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</span>
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowDownLeft className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">Saldo Atual</p>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </span>
            <div className="p-2 bg-slate-100 rounded-lg">
              <Filter className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Transações Recentes</h3>
          <button className="text-sm text-red-600 font-medium hover:underline">Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs">{t.category}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4">
                  {t.status === 'completed' ? (
                    <span className="text-emerald-600 text-xs font-bold uppercase">Pago</span>
                  ) : (
                    <span className="text-amber-600 text-xs font-bold uppercase">Pendente</span>
                  )}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
