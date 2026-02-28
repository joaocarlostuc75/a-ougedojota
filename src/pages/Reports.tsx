import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Users, FileText, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const COLORS = ['#DC2626', '#EA580C', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];

type ReportType = 'sales' | 'finance' | 'inventory';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching report data based on type
    setTimeout(() => {
      if (reportType === 'sales') {
        setReportData({
          kpi: [
            { label: 'Faturamento Total', value: 125400, change: '+15%', icon: DollarSign, color: 'emerald' },
            { label: 'Total de Pedidos', value: 1245, change: '+8%', icon: ShoppingBag, color: 'blue' },
            { label: 'Ticket Médio', value: 100.72, change: '+5%', icon: TrendingUp, color: 'purple' },
            { label: 'Novos Clientes', value: 128, change: '-2%', icon: Users, color: 'orange' },
          ],
          charts: {
            main: [
              { date: 'Seg', value: 4200 }, { date: 'Ter', value: 3800 }, { date: 'Qua', value: 5100 },
              { date: 'Qui', value: 4900 }, { date: 'Sex', value: 6500 }, { date: 'Sáb', value: 8200 }, { date: 'Dom', value: 7400 },
            ],
            secondary: [
              { name: 'Bovinos', value: 45 }, { name: 'Suínos', value: 20 }, { name: 'Aves', value: 15 },
              { name: 'Bebidas', value: 10 }, { name: 'Outros', value: 10 },
            ]
          },
          list: [
            { name: 'Picanha Angus', quantity: 120, revenue: 14400 },
            { name: 'Costela Minga', quantity: 85, revenue: 4250 },
            { name: 'Linguiça Toscana', quantity: 200, revenue: 3800 },
            { name: 'Contra Filé', quantity: 95, revenue: 5700 },
            { name: 'Carvão 5kg', quantity: 150, revenue: 2250 },
          ]
        });
      } else if (reportType === 'finance') {
        setReportData({
          kpi: [
            { label: 'Receita Líquida', value: 98500, change: '+12%', icon: DollarSign, color: 'emerald' },
            { label: 'Despesas Totais', value: 45200, change: '-5%', icon: ArrowDownLeft, color: 'red' },
            { label: 'Lucro Operacional', value: 53300, change: '+22%', icon: TrendingUp, color: 'blue' },
            { label: 'Margem de Lucro', value: '54%', change: '+4%', icon: PieChartIcon, color: 'purple' },
          ],
          charts: {
            main: [
              { date: 'Jan', income: 45000, expense: 32000 }, { date: 'Fev', income: 52000, expense: 34000 },
              { date: 'Mar', income: 48000, expense: 31000 }, { date: 'Abr', income: 61000, expense: 38000 },
              { date: 'Mai', income: 55000, expense: 35000 }, { date: 'Jun', income: 67000, expense: 40000 },
            ],
            secondary: [
              { name: 'Fornecedores', value: 60 }, { name: 'Pessoal', value: 20 },
              { name: 'Impostos', value: 10 }, { name: 'Outros', value: 10 },
            ]
          },
          list: [
            { name: 'Fornecedor de Carnes A', category: 'Fornecedores', value: 15000 },
            { name: 'Aluguel', category: 'Custos Fixos', value: 3500 },
            { name: 'Energia Elétrica', category: 'Utilidades', value: 1200 },
            { name: 'Folha de Pagamento', category: 'Pessoal', value: 12000 },
            { name: 'Marketing', category: 'Serviços', value: 800 },
          ]
        });
      } else { // Inventory
        setReportData({
          kpi: [
            { label: 'Valor em Estoque', value: 45000, change: '+2%', icon: DollarSign, color: 'blue' },
            { label: 'Itens em Baixa', value: 12, change: '+5', icon: AlertCircle, color: 'red' },
            { label: 'Giro de Estoque', value: '4.5x', change: '+0.2', icon: TrendingUp, color: 'emerald' },
            { label: 'Perdas/Quebras', value: 350, change: '-10%', icon: ArrowDownLeft, color: 'orange' },
          ],
          charts: {
            main: [
              { date: 'Sem 1', value: 45000 }, { date: 'Sem 2', value: 42000 },
              { date: 'Sem 3', value: 48000 }, { date: 'Sem 4', value: 46000 },
            ],
            secondary: [
              { name: 'Carnes Nobres', value: 50 }, { name: 'Bebidas', value: 15 },
              { name: 'Mercearia', value: 20 }, { name: 'Limpeza', value: 15 },
            ]
          },
          list: [
            { name: 'Picanha Nacional', stock: 5, min: 10, status: 'Crítico' },
            { name: 'Cerveja Heineken', stock: 12, min: 24, status: 'Baixo' },
            { name: 'Sal Grosso', stock: 8, min: 10, status: 'Baixo' },
            { name: 'Carvão 3kg', stock: 4, min: 20, status: 'Crítico' },
            { name: 'Linguiça Apimentada', stock: 15, min: 15, status: 'Alerta' },
          ]
        });
      }
      setLoading(false);
    }, 800);
  }, [reportType, dateRange]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Helper icons
  const ArrowDownLeft = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="17" x2="7" y1="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>
  );
  const AlertCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  );

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios & Análises</h1>
          <p className="text-slate-500">Visão estratégica do seu negócio</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="1y">Este Ano</option>
          </select>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </header>

      {/* Report Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setReportType('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${reportType === 'sales' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Vendas
        </button>
        <button 
          onClick={() => setReportType('finance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${reportType === 'finance' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <DollarSign className="w-4 h-4" /> Financeiro
        </button>
        <button 
          onClick={() => setReportType('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${reportType === 'inventory' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <BarChart3 className="w-4 h-4" /> Estoque
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportData.kpi.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase">{kpi.label}</h3>
              <div className={`p-2 bg-${kpi.color}-100 text-${kpi.color}-600 rounded-lg`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {typeof kpi.value === 'number' && kpi.label !== 'Total de Pedidos' && kpi.label !== 'Novos Clientes' && kpi.label !== 'Itens em Baixa' ? formatCurrency(kpi.value) : kpi.value}
            </p>
            <span className={`text-xs font-bold px-2 py-1 rounded-full mt-2 inline-block ${kpi.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              {kpi.change} vs período anterior
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            {reportType === 'sales' ? 'Evolução de Vendas' : reportType === 'finance' ? 'Receitas vs Despesas' : 'Valor em Estoque'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {reportType === 'finance' ? (
                <BarChart data={reportData.charts.main}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={reportData.charts.main}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="value" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            {reportType === 'sales' ? 'Vendas por Categoria' : reportType === 'finance' ? 'Despesas por Categoria' : 'Estoque por Categoria'}
          </h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.charts.secondary}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.charts.secondary.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {reportType === 'sales' ? 'Produtos Mais Vendidos' : reportType === 'finance' ? 'Maiores Despesas' : 'Itens com Estoque Baixo'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3">Item</th>
                {reportType === 'inventory' ? (
                  <>
                    <th className="px-6 py-3 text-right">Estoque Atual</th>
                    <th className="px-6 py-3 text-right">Mínimo</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-right">{reportType === 'sales' ? 'Qtd. Vendida' : 'Categoria'}</th>
                    <th className="px-6 py-3 text-right">Valor Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.list.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                  {reportType === 'inventory' ? (
                    <>
                      <td className="px-6 py-4 text-right text-slate-600">{item.stock} un</td>
                      <td className="px-6 py-4 text-right text-slate-600">{item.min} un</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'Crítico' ? 'bg-red-100 text-red-700' : item.status === 'Baixo' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {item.status}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {reportType === 'sales' ? `${item.quantity} un` : item.category}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(item.revenue || item.value)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
