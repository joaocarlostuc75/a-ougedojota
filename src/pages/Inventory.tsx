import React, { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, AlertTriangle, ArrowDown, ArrowUp, History, X, Check, Package } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

interface Product {
  id: number;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  category_name: string;
}

interface InventoryLog {
  id: number;
  product_name: string;
  user_name: string;
  quantity_change: number;
  type: 'entry' | 'exit' | 'adjustment' | 'sale';
  reason: string;
  created_at: string;
}

export default function Inventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<InventoryLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustment, setAdjustment] = useState({
    quantity: '',
    type: 'entry' as 'entry' | 'exit' | 'adjustment',
    reason: ''
  });

  useEffect(() => {
    if (user?.tenant_id) {
      fetchProducts();
      fetchHistory();
    }
  }, [user]);

  const fetchProducts = () => {
    const headers = { 'x-tenant-id': user!.tenant_id.toString() };
    fetch('/api/products', { headers })
      .then(res => res.json())
      .then(setProducts);
  };

  const fetchHistory = () => {
    const headers = { 'x-tenant-id': user!.tenant_id.toString() };
    fetch('/api/inventory/history', { headers })
      .then(res => res.json())
      .then(setHistory);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;

    const quantityChange = adjustment.type === 'exit' ? -Number(adjustment.quantity) : Number(adjustment.quantity);

    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenant_id.toString()
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantityChange,
          type: adjustment.type,
          reason: adjustment.reason,
          userId: user.id
        })
      });

      if (res.ok) {
        setSelectedProduct(null);
        setAdjustment({ quantity: '', type: 'entry', reason: '' });
        fetchProducts();
        fetchHistory();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.stock_quantity <= p.min_stock_level);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-500">Monitoramento e ajuste de quantidades</p>
        </div>
        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
          <button 
            onClick={() => setActiveTab('stock')}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'stock' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700")}
          >
            Estoque Atual
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", activeTab === 'history' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700")}
          >
            <History className="w-4 h-4" />
            Histórico
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'low' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Estoque Baixo
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Estoque Atual</th>
                  <th className="px-6 py-4">Mínimo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 text-slate-600">{product.category_name}</td>
                    <td className="px-6 py-4 font-mono text-slate-900 font-bold text-base">
                      {product.stock_quantity} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {product.min_stock_level} {product.unit}
                    </td>
                    <td className="px-6 py-4">
                      {product.stock_quantity <= product.min_stock_level ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3" />
                          Crítico
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="text-slate-900 font-bold hover:underline"
                      >
                        Ajustar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4">Motivo</th>
                <th className="px-6 py-4">Usuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{log.product_name}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase",
                      log.type === 'entry' ? "bg-emerald-100 text-emerald-800" :
                      log.type === 'exit' ? "bg-red-100 text-red-800" :
                      log.type === 'sale' ? "bg-blue-100 text-blue-800" :
                      "bg-slate-100 text-slate-800"
                    )}>
                      {log.type === 'entry' ? 'Entrada' : 
                       log.type === 'exit' ? 'Saída' : 
                       log.type === 'sale' ? 'Venda' : 'Ajuste'}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 font-mono font-bold",
                    log.quantity_change > 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                  </td>
                  <td className="px-6 py-4 text-slate-600 italic">{log.reason || '-'}</td>
                  <td className="px-6 py-4 text-slate-500">{log.user_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjustment Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 text-white rounded-lg">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Ajustar Estoque</h3>
                    <p className="text-xs text-slate-500">{selectedProduct.name}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-slate-200 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjust} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Movimentação</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustment({...adjustment, type: 'entry'})}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold border transition-all",
                        adjustment.type === 'entry' ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-500"
                      )}
                    >
                      Entrada
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustment({...adjustment, type: 'exit'})}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold border transition-all",
                        adjustment.type === 'exit' ? "bg-red-50 border-red-200 text-red-700 shadow-sm" : "bg-white border-slate-200 text-slate-500"
                      )}
                    >
                      Saída
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustment({...adjustment, type: 'adjustment'})}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold border transition-all",
                        adjustment.type === 'adjustment' ? "bg-slate-100 border-slate-300 text-slate-900 shadow-sm" : "bg-white border-slate-200 text-slate-500"
                      )}
                    >
                      Ajuste
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade ({selectedProduct.unit})</label>
                  <input 
                    required
                    type="number" 
                    step="0.001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                    placeholder="0.000"
                    value={adjustment.quantity}
                    onChange={e => setAdjustment({...adjustment, quantity: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Observação</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none resize-none"
                    rows={3}
                    placeholder="Ex: Recebimento de fornecedor, quebra, etc..."
                    value={adjustment.reason}
                    onChange={e => setAdjustment({...adjustment, reason: e.target.value})}
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Confirmar Ajuste
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
