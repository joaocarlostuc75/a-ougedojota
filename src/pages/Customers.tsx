import { useEffect, useState, FormEvent } from "react";
import { Search, UserPlus, Mail, Phone, MapPin, Star, History, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  total_spent: number;
  last_visit: string;
}

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || '',
        email: editingCustomer.email || '',
        phone: editingCustomer.phone || '',
        address: editingCustomer.address || '',
        street: editingCustomer.street || '',
        number: editingCustomer.number || '',
        neighborhood: editingCustomer.neighborhood || '',
        city: editingCustomer.city || '',
        state: editingCustomer.state || ''
      });
    } else {
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: ''
      });
    }
  }, [editingCustomer]);

  const fetchCustomers = () => {
    if (!user?.tenant_id) return;
    const headers = { 'x-tenant-id': user.tenant_id.toString() };

    fetch('/api/customers', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        else setCustomers([]);
      })
      .catch(console.error);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenant_id.toString()
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingCustomer(null);
        fetchCustomers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500">Gestão de relacionamento e fidelidade</p>
        </div>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Total Gasto</th>
              <th className="px-6 py-4">Última Visita</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {customer.street ? `${customer.street}, ${customer.number} - ${customer.neighborhood}` : customer.address || 'Sem endereço'}
                      </p>
                      {customer.city && (
                        <p className="text-[10px] text-slate-400 ml-4">
                          {customer.city} - {customer.state}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3 h-3" /> {customer.email || '-'}
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3 h-3" /> {customer.phone || '-'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {formatCurrency(customer.total_spent || 0)}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="px-6 py-4">
                  {(customer.total_spent || 0) > 1000 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Star className="w-3 h-3 fill-purple-800" />
                      VIP
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Regular
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600 mr-3">
                    <History className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(customer)}
                    className="text-slate-400 hover:text-red-600 font-medium"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
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
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <input 
                        type="tel" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 border-t border-slate-100 pt-2 mt-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Endereço</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Rua</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={formData.street}
                        onChange={e => setFormData({...formData, street: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={formData.number}
                        onChange={e => setFormData({...formData, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={formData.neighborhood}
                        onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                      <input 
                        type="text" 
                        maxLength={2}
                        placeholder="Ex: SP"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none uppercase"
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800">
                    {editingCustomer ? 'Salvar Alterações' : 'Salvar Cliente'}
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
