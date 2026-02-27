import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  ShoppingBag, Star, Clock, MapPin, Search, Plus, Minus, X, Truck, Store, 
  Instagram, Facebook, MessageCircle, Share2, ShieldCheck, FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  promotional_price?: number;
  unit: string;
  category_name: string;
  image_url: string;
  is_kit: number;
}

interface StoreSettings {
  address?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  opening_hours?: string;
  logo_url?: string;
  cnpj?: string;
  delivery_fee?: number;
}

export default function OnlineStore() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [tenant, setTenant] = useState<{id: number, name: string} | null>(null);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [loading, setLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);

  useEffect(() => {
    const storeSlug = slug || 'meatmaster';

    if (storeSlug === 'demo') {
      // Mock Data for Demo Store
      setProducts([
        {
          id: 1,
          name: "Picanha Angus Premium",
          description: "Corte nobre, marmoreio intenso e sabor inigualável. Peça inteira maturada.",
          price: 129.90,
          promotional_price: 119.90,
          unit: "kg",
          category_name: "Bovinos",
          image_url: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1000&auto=format&fit=crop",
          is_kit: 0
        },
        {
          id: 2,
          name: "Kit Churrasco Família",
          description: "2kg Picanha, 1kg Linguiça, 1kg Coxinha da Asa, 1pct Carvão, 1pct Sal Grosso.",
          price: 249.90,
          promotional_price: 199.90,
          unit: "un",
          category_name: "Kits",
          image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop",
          is_kit: 1
        },
        {
          id: 3,
          name: "Linguiça Toscana Artesanal",
          description: "Receita da casa com pernil suíno selecionado e especiarias naturais.",
          price: 34.90,
          unit: "kg",
          category_name: "Suínos",
          image_url: "https://images.unsplash.com/photo-1595608936486-748956250529?q=80&w=1000&auto=format&fit=crop",
          is_kit: 0
        },
        {
          id: 4,
          name: "Tomahawk Steak",
          description: "Corte impressionante com osso longo, ideal para grelha.",
          price: 149.90,
          unit: "kg",
          category_name: "Bovinos",
          image_url: "https://images.unsplash.com/photo-1544025162-d76690b67f61?q=80&w=1000&auto=format&fit=crop",
          is_kit: 0
        },
        {
          id: 5,
          name: "Costela Minga",
          description: "Costela ponta de agulha, perfeita para assados lentos.",
          price: 49.90,
          promotional_price: 39.90,
          unit: "kg",
          category_name: "Bovinos",
          image_url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=1000&auto=format&fit=crop",
          is_kit: 0
        },
        {
          id: 6,
          name: "Carvão Premium 5kg",
          description: "Eucalipto selecionado, acendimento rápido e brasa duradoura.",
          price: 25.00,
          unit: "un",
          category_name: "Acessórios",
          image_url: "https://images.unsplash.com/photo-1526045431048-f857369baa09?q=80&w=1000&auto=format&fit=crop",
          is_kit: 0
        }
      ]);
      setSettings({
        address: "Av. Paulista, 1000 - São Paulo, SP",
        phone: "(11) 99999-9999",
        whatsapp: "5511999999999",
        instagram: "@meatmaster_demo",
        facebook: "meatmaster",
        opening_hours: "Seg a Sex: 08h às 20h\nSáb e Dom: 08h às 14h",
        logo_url: "",
        cnpj: "00.000.000/0001-00",
        delivery_fee: 15.00
      });
      setTenant({ id: 999, name: "MeatMaster Demo Store" });
      setLoading(false);
      return;
    }

    fetch(`/api/public/store/${storeSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setSettings(data.settings || {});
          setTenant(data.tenant || { id: 1, name: 'MeatMaster' });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFinishOrder = async () => {
    if (slug === 'demo') {
      setOrderProcessing(true);
      setTimeout(() => {
        alert("Pedido de demonstração realizado com sucesso! (Simulação)");
        setCart([]);
        setIsCartOpen(false);
        setOrderProcessing(false);
      }, 1500);
      return;
    }

    if (!tenant || cart.length === 0) return;
    
    setOrderProcessing(true);
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
          deliveryType,
          deliveryFee: deliveryType === 'delivery' ? (Number(settings.delivery_fee) || 0) : 0
        })
      });

      if (res.ok) {
        alert("Pedido realizado com sucesso! Em breve entraremos em contato.");
        setCart([]);
        setIsCartOpen(false);
      } else {
        alert("Erro ao realizar pedido. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setOrderProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const categories = ["Todos", ...new Set(products.map(p => p.category_name || "Geral"))];
  const filteredProducts = selectedCategory === "Todos" 
    ? products 
    : products.filter(p => p.category_name === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.product.promotional_price || item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const deliveryFee = deliveryType === 'delivery' ? (Number(settings.delivery_fee) || 0) : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const copyStoreLink = () => {
    const url = window.location.origin + "/store";
    navigator.clipboard.writeText(url);
    alert("Link da loja copiado!");
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-0 relative flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-red-600">{tenant?.name || 'MeatMaster'}<span className="text-slate-900">Delivery</span></h1>
            <div className="flex items-center text-xs text-slate-500 gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{settings.address || 'Endereço não informado'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={copyStoreLink}
              className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"
              title="Compartilhar Loja"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="O que você quer assar hoje?" 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto mt-4 pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
                selectedCategory === cat 
                  ? "bg-red-600 text-white shadow-md shadow-red-200" 
                  : "bg-white text-slate-600 border border-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Banners */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1">Kit Churrasco Premium</h3>
            <p className="text-sm text-slate-300 mb-3">Picanha + Carvão + Cerveja</p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Ver Oferta</button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 bg-red-500/10 -skew-x-12 transform translate-x-8" />
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex gap-3 relative overflow-hidden">
            {product.promotional_price && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                PROMO
              </div>
            )}
            <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-auto">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `${window.location.origin}/store/${slug}?product=${product.id}`;
                        navigator.clipboard.writeText(url);
                        alert("Link do produto copiado!");
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Compartilhar produto"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <div>
                      {product.promotional_price ? (
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-slate-900">{formatCurrency(product.promotional_price)}</span>
                          <span className="text-[10px] text-slate-400 line-through">{formatCurrency(product.price)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-900">{formatCurrency(product.price)}<span className="text-xs font-normal text-slate-400">/{product.unit}</span></span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
                  >
                    Adicionar
                  </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section: Address & Social */}
      <div className="p-6 bg-white border-t border-slate-100 mt-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Nossa Localização
            </h3>
            <p className="text-sm text-slate-600 mb-4 whitespace-pre-line">
              {settings.address || 'Endereço não informado'}
            </p>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }}
                src={settings.address 
                  ? `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                  : "https://maps.google.com/maps?q=Brasil&t=&z=4&ie=UTF8&iwloc=&output=embed"
                }
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">Siga-nos nas Redes</h3>
            <div className="flex gap-4 mb-8">
              {settings.instagram && (
                <a href={`https://instagram.com/${settings.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook.startsWith('http') ? settings.facebook : `https://facebook.com/${settings.facebook}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </a>
              )}
            </div>

            <h3 className="font-bold text-slate-900 mb-4">Horário de Funcionamento</h3>
            <div className="text-sm text-slate-600 whitespace-pre-line">
              {settings.opening_hours || 'Horário não informado'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Legal & LGPD */}
      <footer className="bg-slate-900 text-slate-400 p-8 text-center text-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="hover:text-white flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> LGPD
            </a>
            <a href="#" className="hover:text-white flex items-center gap-1">
              <FileText className="w-3 h-3" /> Termos de Uso
            </a>
            <a href="#" className="hover:text-white">Política de Privacidade</a>
          </div>
          <p>
            <a 
              href="https://wa.me/5594981028614" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-colors"
            >
              @ 2026 J.C SISTEMAS
            </a>. Todos os direitos reservados.
          </p>
          <p className="opacity-50">
            CNPJ: {settings.cnpj || '00.000.000/0001-00'} | {tenant?.name || 'MeatMaster'}
          </p>
          <div className="pt-4 border-t border-white/5">
            <p>Desenvolvido com ❤️ para os amantes de churrasco.</p>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button (Mobile) */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-red-600 text-white p-4 rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-700 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                  {cart.length}
                </div>
                <span className="font-medium">Ver Carrinho</span>
              </div>
              <span className="font-bold">{formatCurrency(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white z-[60] shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="font-bold text-lg">Seu Pedido</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 border-b border-slate-50 pb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900">{item.product.name}</h4>
                      <p className="text-red-600 font-bold text-sm">
                        {formatCurrency((item.product.promotional_price || item.product.price) * item.quantity)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">Qtd: {item.quantity}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-slate-400 hover:text-red-500 self-start">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                {/* Delivery Toggle */}
                <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setDeliveryType('delivery')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                      deliveryType === 'delivery' ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Truck className="w-4 h-4" /> Entrega
                  </button>
                  <button 
                    onClick={() => setDeliveryType('pickup')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                      deliveryType === 'pickup' ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Store className="w-4 h-4" /> Retirada
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                  {deliveryType === 'delivery' && (
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>Taxa de Entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-900 font-bold">Total</span>
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleFinishOrder}
                  disabled={orderProcessing}
                  className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {orderProcessing ? "Processando..." : "Finalizar Pedido"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
