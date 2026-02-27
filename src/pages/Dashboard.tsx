import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag 
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface Stats {
  dailyRevenue: number;
  lowStockCount: number;
  recentSales: any[];
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  unit: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenant_id) return;

    const headers = { 'x-tenant-id': user.tenant_id.toString() };

    Promise.all([
      fetch('/api/stats', { headers }).then(res => res.json()),
      fetch('/api/products', { headers }).then(res => res.json())
    ]).then(([statsData, productsData]) => {
      setStats(statsData);
      setProducts(productsData);
      setLoading(false);
    }).catch(err => console.error(err));
  }, [user]);

  if (loading) return <div className="p-8">Carregando dashboard...</div>;

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-slate-500">Bem-vindo ao {user?.tenant?.name || 'Sistema'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Vendas Hoje" 
          value={formatCurrency(stats?.dailyRevenue || 0)} 
          icon={DollarSign}
          color="bg-emerald-500"
          trend="+12% vs ontem"
        />
        <StatCard 
          title="Estoque Baixo" 
          value={(stats?.lowStockCount || 0).toString()} 
          label="Produtos em alerta"
          icon={AlertTriangle}
          color="bg-amber-500"
          alert
        />
        <StatCard 
          title="Ticket Médio" 
          value={formatCurrency(85.50)} 
          label="Média por venda"
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard 
          title="Pedidos Online" 
          value="12" 
          label="Aguardando entrega"
          icon={ShoppingBag}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Vendas Recentes</h2>
            <button className="text-sm text-red-600 font-medium hover:text-red-700">Ver todas</button>
          </div>
          <div className="space-y-4">
            {stats?.recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm">
                    #{sale.id}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Venda Balcão</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(sale.total_amount)}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                    {sale.payment_method}
                  </span>
                </div>
              </div>
            ))}
            {stats?.recentSales.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">Nenhuma venda registrada hoje.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 gap-3">
              <QuickAction 
                title="Novo Produto" 
                desc="Cadastrar item"
                color="bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                onClick={() => navigate('/products', { state: { openNewModal: true } })}
              />
              <QuickAction 
                title="Relatório Fiscal" 
                desc="Exportar notas"
                color="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                onClick={() => alert('Relatório Fiscal gerado com sucesso!')}
              />
              <QuickAction 
                title="Inventário" 
                desc="Ajuste de contagem"
                color="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                onClick={() => navigate('/inventory')}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Tabela de Preços</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Exportar PDF
              </button>
              <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Imprimir
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 bg-slate-50/50">Produto</th>
                  <th className="px-6 py-4 bg-slate-50/50">Preço Original</th>
                  <th className="px-6 py-4 bg-slate-50/50">Preço Promocional</th>
                  <th className="px-6 py-4 bg-slate-50/50 text-right">Unidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 relative">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-red-500 transition-colors"></span>
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="absolute left-6 top-full mt-1 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                          <p className="font-medium mb-1 text-slate-300">Descrição:</p>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      <span className={product.promotional_price ? "line-through text-slate-400 decoration-slate-400/50" : ""}>
                        {formatCurrency(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold font-mono">
                      {product.promotional_price ? (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">
                          {formatCurrency(product.promotional_price)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-right font-medium">{product.unit}</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-500">
                      <p>Nenhum produto cadastrado.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, label, icon: Icon, color, trend, alert }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover-card relative overflow-hidden group"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
          <div className={cn("p-2.5 rounded-xl text-white shadow-md transition-transform group-hover:scale-110", color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
          {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
        </div>
        {label && (
          <p className={cn("text-xs font-medium mt-2", alert ? "text-amber-600" : "text-slate-400")}>
            {label}
          </p>
        )}
      </div>
      {/* Decorative background circle */}
      <div className={cn("absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150", color)} />
    </motion.div>
  );
}

function QuickAction({ title, desc, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn("w-full p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-md", color)}
    >
      <span className="block font-bold mb-0.5">{title}</span>
      <span className="text-xs opacity-80">{desc}</span>
    </button>
  );
}
