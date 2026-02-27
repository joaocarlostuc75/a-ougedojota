import { useEffect, useState, useRef } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, QrCode, ShoppingBasket, Truck, Store, User, X, CheckCircle2, Printer, ArrowRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface Product {
  id: number;
  name: string;
  price: number;
  promotional_price?: number;
  unit: 'kg' | 'un';
  category_name: string;
  image_url: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
}

interface OrderDetails {
  items: CartItem[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  deliveryType: string;
  paymentMethod: string;
  customerName?: string;
  cashReceived?: number;
  change?: number;
  date: string;
}

export default function POS() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [processing, setProcessing] = useState(false);
  
  // Order Details
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryFee, setDeliveryFee] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  
  // Delivery Identification (Mandatory for delivery)
  const [deliveryDetails, setDeliveryDetails] = useState({
    customerName: "",
    customerWhatsApp: "",
    address: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    receiverName: "",
    receiverContact: ""
  });

  // Modals
  const [showCashModal, setShowCashModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<string>("");
  
  // Payment Data
  const [cashReceived, setCashReceived] = useState("");
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const headers = { 'x-tenant-id': user.tenant_id.toString() };

    fetch('/api/products', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      })
      .catch(console.error);

    fetch('/api/customers', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        else setCustomers([]);
      })
      .catch(console.error);
  }, [user]);

  // Update delivery details when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const customer = customers.find(c => c.id === Number(selectedCustomer));
      if (customer) {
        setDeliveryDetails(prev => ({
          ...prev,
          customerName: customer.name,
          address: (customer as any).address || "",
          street: (customer as any).street || "",
          number: (customer as any).number || "",
          neighborhood: (customer as any).neighborhood || "",
          city: (customer as any).city || "",
          state: (customer as any).state || "",
          customerWhatsApp: (customer as any).phone || ""
        }));
      }
    }
  }, [selectedCustomer, customers]);

  const categories = ["Todos", ...new Set(products.map(p => p.category_name))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0.1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = item.promotional_price || item.price;
    return acc + (price * item.quantity);
  }, 0);

  const total = subtotal + (deliveryType === 'delivery' ? Number(deliveryFee) : 0);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=500,top=500,width=400,height=600');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom Não Fiscal</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 20px; width: 300px; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
              .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total-section { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 10px; }
              .bold { font-weight: bold; }
              .delivery-info { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; font-size: 10px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const validateDelivery = () => {
    if (deliveryType === 'delivery') {
      const { customerName, customerWhatsApp, street, number, neighborhood, city, state, receiverName, receiverContact } = deliveryDetails;
      if (!customerName || !customerWhatsApp || !street || !number || !neighborhood || !city || !state || !receiverName || !receiverContact) {
        setShowDeliveryModal(true);
        return false;
      }
    }
    return true;
  };

  const initiatePayment = (method: string) => {
    if (!validateDelivery()) return;

    if (method === 'cash') {
      setShowCashModal(true);
    } else {
      setPendingMethod(method);
      setShowConfirmModal(true);
    }
  };

  const handleCheckout = async (method: string, cashData?: { received: number, change: number }) => {
    if (!user) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenant_id.toString()
        },
        body: JSON.stringify({
          items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
          paymentMethod: method,
          deliveryType,
          deliveryFee: deliveryType === 'delivery' ? Number(deliveryFee) : 0,
          customerId: selectedCustomer ? Number(selectedCustomer) : null,
          deliveryDetails: deliveryType === 'delivery' ? deliveryDetails : null
        })
      });
      
      if (!res.ok) throw new Error('Falha na venda');
      
      const customer = customers.find(c => c.id === Number(selectedCustomer));
      
      setLastOrder({
        items: [...cart],
        total,
        subtotal,
        deliveryFee: deliveryType === 'delivery' ? Number(deliveryFee) : 0,
        deliveryType,
        paymentMethod: method,
        customerName: customer?.name || deliveryDetails.customerName,
        cashReceived: cashData?.received,
        change: cashData?.change,
        date: new Date().toLocaleString('pt-BR'),
        // @ts-ignore
        deliveryDetails: deliveryType === 'delivery' ? deliveryDetails : null
      });

      setCart([]);
      setDeliveryType('pickup');
      setDeliveryFee("");
      setSelectedCustomer("");
      setDeliveryDetails({
        customerName: "",
        customerWhatsApp: "",
        address: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        receiverName: "",
        receiverContact: ""
      });
      setShowSuccessModal(true);
    } catch (err) {
      alert('Erro ao processar venda');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden">
      {/* Product Grid */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar produtos (código, nome)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 max-w-md">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === cat 
                    ? "bg-slate-900 text-white" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <motion.button
              key={product.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex flex-col h-full relative overflow-hidden"
            >
              {product.promotional_price && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  Promo
                </div>
              )}
              <div className="aspect-video w-full bg-slate-100 rounded-lg mb-3 overflow-hidden">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">{product.name}</h3>
              <div className="mt-auto flex items-center justify-between">
                <div>
                  {product.promotional_price ? (
                    <div className="flex flex-col">
                      <span className="text-red-600 font-bold">{formatCurrency(product.promotional_price)}/{product.unit}</span>
                      <span className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>
                    </div>
                  ) : (
                    <span className="text-red-600 font-bold">{formatCurrency(product.price)}/{product.unit}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-10">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5" />
            Carrinho Atual
          </h2>
          
          {/* Customer Selection */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
            >
              <option value="">Cliente não identificado</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingBasket className="w-16 h-16 opacity-20" />
              <p>Nenhum item adicionado</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                  <p className="text-red-600 font-bold text-sm">
                    {formatCurrency((item.promotional_price || item.price) * item.quantity)}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.unit === 'kg' ? item.quantity.toFixed(3) : item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-400 hover:text-red-500 self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          {/* Delivery Options */}
          <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setDeliveryType('pickup')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                deliveryType === 'pickup' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Store className="w-4 h-4" /> Retirada
            </button>
            <button 
              onClick={() => setDeliveryType('delivery')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                deliveryType === 'delivery' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Truck className="w-4 h-4" /> Entrega
            </button>
          </div>

          {deliveryType === 'delivery' && (
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
              <span className="text-sm text-slate-600">Taxa de Entrega</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-sm">R$</span>
                <input 
                  type="number" 
                  className="w-16 text-right font-medium outline-none"
                  placeholder="0,00"
                  value={deliveryFee}
                  onChange={e => setDeliveryFee(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {deliveryType === 'delivery' && (
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Entrega</span>
                <span>{formatCurrency(Number(deliveryFee))}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-900 font-bold">Total a Pagar</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <PaymentButton 
              icon={CreditCard} 
              label="Cartão" 
              onClick={() => initiatePayment('card')} 
              disabled={cart.length === 0 || processing}
            />
            <PaymentButton 
              icon={Banknote} 
              label="Dinheiro" 
              onClick={() => initiatePayment('cash')} 
              disabled={cart.length === 0 || processing}
            />
            <PaymentButton 
              icon={QrCode} 
              label="PIX" 
              onClick={() => initiatePayment('pix')} 
              disabled={cart.length === 0 || processing}
            />
          </div>
        </div>
      </div>

      {/* Cash Payment Modal */}
      <AnimatePresence>
        {showCashModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowCashModal(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-slate-100"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">Pagamento em Dinheiro</h3>
                    <p className="text-sm text-slate-500">Informe o valor recebido do cliente</p>
                  </div>
                  <button 
                    onClick={() => setShowCashModal(false)} 
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <p className="text-slate-500 font-medium uppercase tracking-wider text-xs">Total a Pagar</p>
                    <div className="text-5xl font-bold text-slate-900 tracking-tight">
                      {formatCurrency(total)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Valor Recebido</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg group-focus-within:text-red-500 transition-colors">R$</span>
                      <input 
                        type="number" 
                        autoFocus
                        placeholder="0,00"
                        className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-600">Troco a devolver</span>
                      <span className={cn(
                        "text-2xl font-bold transition-colors",
                        Number(cashReceived) >= total ? "text-emerald-600" : "text-slate-300"
                      )}>
                        {Number(cashReceived) > 0 
                          ? formatCurrency(Math.max(0, Number(cashReceived) - total))
                          : "R$ 0,00"
                        }
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const received = Number(cashReceived);
                      const change = Math.max(0, received - total);
                      handleCheckout('cash', { received, change });
                      setShowCashModal(false);
                      setCashReceived("");
                    }}
                    disabled={!cashReceived || Number(cashReceived) < total}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
                  >
                    Confirmar Pagamento
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Manual Confirmation Modal (Pix/Card) */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-slate-100"
              >
                <div className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    {pendingMethod === 'pix' ? <QrCode className="w-10 h-10 text-red-600" /> : <CreditCard className="w-10 h-10 text-red-600" />}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">Aguardando Pagamento</h3>
                    <p className="text-slate-500">
                      {pendingMethod === 'pix' 
                        ? "O cliente deve escanear o QR Code na máquina." 
                        : "O cliente deve inserir ou aproximar o cartão."}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(total)}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        handleCheckout(pendingMethod);
                        setShowConfirmModal(false);
                      }}
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
                    >
                      Confirmar Manualmente
                    </button>
                    <button 
                      onClick={() => setShowConfirmModal(false)}
                      className="w-full bg-white text-slate-500 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal / Thank You Screen */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60] backdrop-blur-md"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-white/20"
              >
                <div className="p-12 text-center space-y-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Venda Concluída!</h2>
                    <p className="text-xl text-slate-500 font-medium italic">Obrigado, volte sempre!</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Forma de Pagamento</span>
                      <span className="font-bold text-slate-900 uppercase">{lastOrder?.paymentMethod === 'cash' ? 'Dinheiro' : lastOrder?.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Total Pago</span>
                      <span className="text-2xl font-bold text-red-600">{formatCurrency(lastOrder?.total || 0)}</span>
                    </div>
                    {lastOrder?.paymentMethod === 'cash' && (
                      <div className="flex justify-between items-center pt-2 text-emerald-600 font-bold">
                        <span>Troco</span>
                        <span>{formatCurrency(lastOrder?.change || 0)}</span>
                      </div>
                    )}
                    {lastOrder?.deliveryType === 'delivery' && (
                      <div className="pt-4 mt-4 border-t border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Informações de Entrega</p>
                        <p className="text-sm text-slate-700"><strong>Endereço:</strong> {lastOrder.deliveryDetails?.address}</p>
                        <p className="text-sm text-slate-700"><strong>Recebedor:</strong> {lastOrder.deliveryDetails?.receiverName}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handlePrint}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                      <Printer className="w-5 h-5" />
                      Imprimir Cupom
                    </button>
                    <button 
                      onClick={() => setShowSuccessModal(false)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-[0.98]"
                    >
                      Nova Venda
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delivery Details Modal */}
      <AnimatePresence>
        {showDeliveryModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeliveryModal(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-slate-100"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">Dados para Entrega</h3>
                    <p className="text-sm text-slate-500">Identificação obrigatória para entregas</p>
                  </div>
                  <button onClick={() => setShowDeliveryModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Cliente</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        value={deliveryDetails.customerName}
                        onChange={e => setDeliveryDetails({...deliveryDetails, customerName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        placeholder="(00) 00000-0000"
                        value={deliveryDetails.customerWhatsApp}
                        onChange={e => setDeliveryDetails({...deliveryDetails, customerWhatsApp: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rua</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        value={deliveryDetails.street}
                        onChange={e => setDeliveryDetails({...deliveryDetails, street: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Número</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        value={deliveryDetails.number}
                        onChange={e => setDeliveryDetails({...deliveryDetails, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bairro</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        value={deliveryDetails.neighborhood}
                        onChange={e => setDeliveryDetails({...deliveryDetails, neighborhood: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cidade</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        value={deliveryDetails.city}
                        onChange={e => setDeliveryDetails({...deliveryDetails, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estado (UF)</label>
                      <input 
                        type="text" 
                        maxLength={2}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500 uppercase"
                        value={deliveryDetails.state}
                        onChange={e => setDeliveryDetails({...deliveryDetails, state: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="border-t border-slate-100 col-span-2 pt-4 mt-2">
                      <p className="text-sm font-bold text-slate-900 mb-3">Dados do Recebedor</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Recebedor</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        value={deliveryDetails.receiverName}
                        onChange={e => setDeliveryDetails({...deliveryDetails, receiverName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contato do Recebedor</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                        value={deliveryDetails.receiverContact}
                        onChange={e => setDeliveryDetails({...deliveryDetails, receiverContact: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowDeliveryModal(false)}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all mt-4"
                  >
                    Confirmar Dados de Entrega
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <div ref={receiptRef}>
          <div className="header">
            <h2 className="bold">MEATMASTER PRO</h2>
            <p>Açougue & Boutique de Carnes</p>
            <p>CUPOM NÃO FISCAL</p>
            <p>${lastOrder?.date}</p>
          </div>
          
          <div className="items-list">
            <div className="item bold">
              <span>ITEM</span>
              <span>VALOR</span>
            </div>
            {lastOrder?.items.map((item, idx) => (
              <div key={idx} className="item">
                <span>${item.quantity}${item.unit} x ${item.name}</span>
                <span>${formatCurrency((item.promotional_price || item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="total-section">
            <div className="item">
              <span>Subtotal:</span>
              <span>${formatCurrency(lastOrder?.subtotal || 0)}</span>
            </div>
            {lastOrder?.deliveryFee && lastOrder.deliveryFee > 0 && (
              <div className="item">
                <span>Taxa de Entrega:</span>
                <span>${formatCurrency(lastOrder.deliveryFee)}</span>
              </div>
            )}
            <div className="item bold" style={{ fontSize: '14px', marginTop: '5px' }}>
              <span>TOTAL:</span>
              <span>${formatCurrency(lastOrder?.total || 0)}</span>
            </div>
          </div>

          <div className="payment-section" style={{ marginTop: '10px' }}>
            <div className="item">
              <span>Forma de Pagamento:</span>
              <span className="bold">${lastOrder?.paymentMethod.toUpperCase()}</span>
            </div>
            {lastOrder?.paymentMethod === 'cash' && (
              <>
                <div className="item">
                  <span>Valor Recebido:</span>
                  <span>${formatCurrency(lastOrder?.cashReceived || 0)}</span>
                </div>
                <div className="item">
                  <span>Troco:</span>
                  <span>${formatCurrency(lastOrder?.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          {lastOrder?.deliveryType === 'delivery' && (
            <div className="delivery-info">
              <p className="bold">DADOS DE ENTREGA</p>
              <p>Cliente: ${lastOrder.customerName}</p>
              <p>WhatsApp: ${lastOrder.deliveryDetails?.customerWhatsApp}</p>
              <p>Endereço: ${lastOrder.deliveryDetails?.street}, ${lastOrder.deliveryDetails?.number} - ${lastOrder.deliveryDetails?.neighborhood}, ${lastOrder.deliveryDetails?.city}/${lastOrder.deliveryDetails?.state}</p>
              <p>Recebedor: ${lastOrder.deliveryDetails?.receiverName}</p>
              <p>Contato Rec.: ${lastOrder.deliveryDetails?.receiverContact}</p>
            </div>
          )}

          {lastOrder?.customerName && lastOrder.deliveryType !== 'delivery' && (
            <div style={{ marginTop: '10px', borderTop: '1px dashed #000', paddingTop: '5px' }}>
              <p>Cliente: ${lastOrder.customerName}</p>
            </div>
          )}

          <div className="footer">
            <p className="bold">OBRIGADO PELA PREFERÊNCIA!</p>
            <p>Volte Sempre!</p>
            <p>MeatMaster Pro - Gestão Inteligente</p>
          </div>
        </div>
      </div>

    </div>
  );
}

function PaymentButton({ icon: Icon, label, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
