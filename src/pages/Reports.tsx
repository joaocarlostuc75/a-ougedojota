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
  Cell 
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

const COLORS = ['#DC2626', '#EA580C', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    // Simulate fetching report data
    setTimeout(() => {
      setReportData({
        salesOverTime: [
          { date: 'Seg', sales: 4200, orders: 45 },
          { date: 'Ter', sales: 3800, orders: 38 },
          { date: 'Qua', sales: 5100, orders: 52 },
          { date: 'Qui', sales: 4900, orders: 48 },
          { date: 'Sex', sales: 6500, orders: 68 },
          { date: 'Sáb', sales: 8200, orders: 85 },
          { date: 'Dom', sales: 7400, orders: 72 },
        ],
        salesByCategory: [
          { name: 'Bovinos', value: 45 },
          { name: 'Suínos', value: 20 },
          { name: 'Aves', value: 15 },
          { name: 'Bebidas', value: 10 },
          { name: 'Outros', value: 10 },
        ],
        topProducts: [
          { name: 'Picanha Angus', quantity: 120, revenue: 14400 },
          { name: 'Costela Minga', quantity: 85, revenue: 4250 },
          { name: 'Linguiça Toscana', quantity: 200, revenue: 3800 },
          { name: 'Contra Filé', quantity: 95, revenue: 5700 },
          { name: 'Carvão 5kg', quantity: 150, revenue: 2250 },
        ],
        paymentMethods: [
          { name: 'Crédito', value: 45000 },
          { name: 'Débito', value: 25000 },
          { name: 'Dinheiro', value: 15000 },
          { name: 'PIX', value: 35000 },
        ]
      });
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios Avançados</h1>
          <p className="text-slate-500">Análise detalhada de desempenho do seu negócio</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 3 meses</option>
          </select>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Faturamento Total</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(125400)}</p>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mt-2 inline-block">+15% vs período anterior</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Total de Pedidos</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">1,245</p>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-2 inline-block">+8% vs período anterior</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Ticket Médio</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(100.72)}</p>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mt-2 inline-block">+5% vs período anterior</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Novos Clientes</h3>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">128</p>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full mt-2 inline-block">-2% vs período anterior</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Vendas por Dia</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.salesOverTime}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Vendas por Categoria</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.salesByCategory.map((entry: any, index: number) => (
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top 5 Produtos Mais Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Produto</th>
                  <th className="px-6 py-3 text-right">Qtd. Vendida</th>
                  <th className="px-6 py-3 text-right rounded-r-lg">Receita Gerada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.topProducts.map((product: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {idx + 1}
                      </span>
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">{product.quantity} un</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Formas de Pagamento</h3>
          <div className="space-y-4">
            {reportData.paymentMethods.map((method: any, idx: number) => {
              const total = reportData.paymentMethods.reduce((acc: number, curr: any) => acc + curr.value, 0);
              const percentage = Math.round((method.value / total) * 100);
              
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{method.name}</span>
                    <span className="text-slate-500">{percentage}% ({formatCurrency(method.value)})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ width: `${percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for AreaChart since it wasn't imported directly but used in code
import { AreaChart, Area } from 'recharts';
