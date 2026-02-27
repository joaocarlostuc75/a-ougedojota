import React, { useEffect, useState, FormEvent, useRef } from "react";
import { useLocation } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Filter, Tag, Layers, X, Barcode, Upload, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface Product {
  id: number;
  name: string;
  code: string;
  description: string;
  price: number;
  promotional_price?: number;
  unit: string;
  stock_quantity: number;
  category_name: string;
  image_url: string;
  is_kit: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Supplier {
  id: number;
  name: string;
}

export default function Products() {
  const { user } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Forms
  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    code: "",
    description: "",
    price: "",
    promotional_price: "",
    unit: "kg",
    category_id: "",
    supplier_id: "",
    image_url: "",
    is_kit: false
  });

  useEffect(() => {
    if (location.state?.openNewModal) {
      setShowProductModal(true);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.tenant_id) return;
    const headers = { 'x-tenant-id': user.tenant_id.toString() };

    const [prodRes, catRes, supRes] = await Promise.all([
      fetch('/api/products', { headers }),
      fetch('/api/categories', { headers }),
      fetch('/api/suppliers', { headers })
    ]);
    const prodData = await prodRes.json();
    const catData = await catRes.json();
    const supData = await supRes.json();
    
    if (Array.isArray(prodData)) setProducts(prodData);
    if (Array.isArray(catData)) setCategories(catData);
    if (Array.isArray(supData)) setSuppliers(supData);
    
    setLoading(false);
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': user.tenant_id.toString()
      },
      body: JSON.stringify({ name: newCategory })
    });
    setNewCategory("");
    setShowCategoryModal(false);
    fetchData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-tenant-id': user.tenant_id.toString()
      },
      body: JSON.stringify({
        ...newProduct,
        price: Number(newProduct.price),
        promotional_price: newProduct.promotional_price ? Number(newProduct.promotional_price) : null,
        category_id: Number(newProduct.category_id),
        supplier_id: newProduct.supplier_id ? Number(newProduct.supplier_id) : null
      })
    });
    setShowProductModal(false);
    setNewProduct({
      name: "", code: "", description: "", price: "", promotional_price: "", 
      unit: "kg", category_id: "", supplier_id: "", image_url: "", is_kit: false
    });
    fetchData();
  };

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Produtos</h1>
          <p className="text-slate-500">Gerencie o catálogo e estoque</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Layers className="w-4 h-4" />
            Categorias
          </button>
          <button 
            onClick={() => setShowProductModal(true)}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Preço</th>
              <th className="px-6 py-4">Estoque</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                      <img src={product.image_url || "https://picsum.photos/seed/meat/200/200"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{product.code || '-'}</td>
                <td className="px-6 py-4 text-slate-600">{product.category_name}</td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {product.promotional_price ? (
                    <div className="flex flex-col">
                      <span className="text-red-600 font-bold">{formatCurrency(product.promotional_price)}</span>
                      <span className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>
                    </div>
                  ) : (
                    <span>{formatCurrency(product.price)}/{product.unit}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {product.stock_quantity} {product.unit}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {product.is_kit === 1 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Kit
                      </span>
                    )}
                    {product.promotional_price && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Promo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-red-600 font-medium">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowCategoryModal(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg">Nova Categoria</h3>
                  <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-slate-200 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Categoria</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800">
                    Salvar
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg">Novo Produto</h3>
                  <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-slate-200 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all overflow-hidden group relative"
                    >
                      {newProduct.image_url ? (
                        <>
                          <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Upload Foto</span>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Clique para enviar imagem</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Código (SKU)</label>
                      <div className="relative">
                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                          type="text" 
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                          value={newProduct.code}
                          onChange={e => setNewProduct({...newProduct, code: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                      <select 
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newProduct.category_id}
                        onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                      <input 
                        required
                        type="number" step="0.01"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preço Promo (Opcional)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newProduct.promotional_price}
                        onChange={e => setNewProduct({...newProduct, promotional_price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newProduct.unit}
                        onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                      >
                        <option value="kg">Quilo (kg)</option>
                        <option value="un">Unidade (un)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newProduct.supplier_id}
                        onChange={e => setNewProduct({...newProduct, supplier_id: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="is_kit"
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-500"
                      checked={newProduct.is_kit}
                      onChange={e => setNewProduct({...newProduct, is_kit: e.target.checked})}
                    />
                    <label htmlFor="is_kit" className="text-sm font-medium text-slate-700">Este produto é um Kit/Combo?</label>
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700">
                    Salvar Produto
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

