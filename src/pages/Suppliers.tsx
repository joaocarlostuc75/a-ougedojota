import { useEffect, useState, FormEvent } from "react";
import { Search, Plus, Truck, Phone, Mail, MapPin, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface Supplier {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export default function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '', document: '', email: '', phone: '', address: '', notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user]);

  const fetchSuppliers = () => {
    if (!user?.tenant_id) return;
    const headers = { 'x-tenant-id': user.tenant_id.toString() };

    fetch('/api/suppliers', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSuppliers(data);
        else setSuppliers([]);
      })
      .catch(console.error);
  };

  const handleCreateSupplier = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenant_id.toString()
        },
        body: JSON.stringify(newSupplier)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewSupplier({ name: '', document: '', email: '', phone: '', address: '', notes: '' });
        fetchSuppliers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.document && s.document.includes(search))
  );

  return (
    <div className="p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fornecedores</h1>
          <p className="text-slate-500">Gestão de parceiros e abastecimento</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou documento..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Fornecedor</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Endereço</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{supplier.name}</p>
                      {supplier.notes && (
                        <p className="text-xs text-slate-500 max-w-[200px] truncate">{supplier.notes}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                  {supplier.document || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3 h-3" /> {supplier.email || '-'}
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3 h-3" /> {supplier.phone || '-'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{supplier.address || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600 font-medium">Editar</button>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhum fornecedor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg">Novo Fornecedor</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateSupplier} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social / Nome</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newSupplier.name}
                        onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ / CPF</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newSupplier.document}
                        onChange={e => setNewSupplier({...newSupplier, document: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <input 
                        type="tel" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newSupplier.phone}
                        onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newSupplier.email}
                        onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={newSupplier.address}
                        onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        rows={2}
                        value={newSupplier.notes}
                        onChange={e => setNewSupplier({...newSupplier, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800">
                    Salvar Fornecedor
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
