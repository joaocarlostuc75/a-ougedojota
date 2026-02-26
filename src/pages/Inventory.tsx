import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Search, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";

interface Product {
  id: number;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  category_name: string;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

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
        <div className="flex gap-2">
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
              <th className="px-6 py-4 text-right">Ajuste Rápido</th>
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
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 hover:bg-red-100 text-red-600 rounded">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-emerald-100 text-emerald-600 rounded">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
