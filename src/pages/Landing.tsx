import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Store, 
  Smartphone, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Menu, 
  X,
  Star,
  Play,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: Store,
      title: "PDV Moderno",
      description: "Frente de caixa ágil, compatível com balanças e impressoras. Venda em segundos."
    },
    {
      icon: Smartphone,
      title: "Loja Virtual Própria",
      description: "Seu açougue online 24h. Receba pedidos de entrega e retirada automaticamente."
    },
    {
      icon: TrendingUp,
      title: "Gestão Financeira",
      description: "Controle total de fluxo de caixa, lucros e despesas. Adeus planilhas."
    },
    {
      icon: Zap,
      title: "Estoque Inteligente",
      description: "Baixa automática de insumos técnicos e alertas de reposição em tempo real."
    }
  ];

  const plans = [
    {
      name: "Start",
      price: "49,90",
      period: "/mês",
      description: "Essencial para pequenos negócios.",
      features: [
        "PDV Frente de Caixa",
        "Até 500 Produtos",
        "Gestão de Clientes",
        "Suporte por Email"
      ],
      highlight: false,
      buttonText: "Começar Agora"
    },
    {
      name: "Profissional",
      price: "89,90",
      period: "/mês",
      description: "O favorito dos açougues modernos.",
      features: [
        "Tudo do plano Start",
        "Loja Online Integrada",
        "Estoque Técnico (Ficha Técnica)",
        "Financeiro Completo",
        "Integração Balança/Impressora",
        "Suporte Prioritário WhatsApp"
      ],
      highlight: true,
      buttonText: "Testar Grátis por 7 Dias"
    },
    {
      name: "Franquias",
      price: "Sob Consulta",
      period: "",
      description: "Para redes e grandes volumes.",
      features: [
        "Múltiplas Lojas / Filiais",
        "API de Integração (ERP)",
        "Gerente de Contas Dedicado",
        "Treinamento de Equipe",
        "Setup Personalizado"
      ],
      highlight: false,
      buttonText: "Falar com Consultor"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-slate-100 selection:bg-red-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed w-full bg-[#0F172A]/90 backdrop-blur-md z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-900/20">M</div>
              <span className="text-2xl font-bold tracking-tight text-white">MeatMaster<span className="text-red-500">Pro</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wide">Funcionalidades</a>
              <a href="#pricing" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wide">Planos</a>
              <Link to="/login" className="text-white font-bold hover:text-red-400 transition-colors">Entrar</Link>
              <Link to="/login" className="bg-red-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transform hover:-translate-y-0.5">
                Teste Grátis
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1E293B] border-t border-white/10 p-4 absolute w-full shadow-xl">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-lg font-medium text-slate-200" onClick={() => setIsMenuOpen(false)}>Funcionalidades</a>
              <a href="#pricing" className="text-lg font-medium text-slate-200" onClick={() => setIsMenuOpen(false)}>Planos</a>
              <Link to="/login" className="text-lg font-bold text-red-500" onClick={() => setIsMenuOpen(false)}>Acessar Sistema</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-widest mb-8 border border-red-500/20">
                <Star className="w-3 h-3 fill-current" />
                Nova Versão 2.0 Disponível
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
                O Sistema Definitivo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Açougues</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                Gerencie vendas, estoque técnico e loja online em uma única plataforma. Feito por quem entende de carne para quem vive de carne.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 hover:scale-105">
                  Começar Grátis <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/store/demo" className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 group">
                  <Play className="w-5 h-5 fill-current text-slate-400 group-hover:text-white transition-colors" />
                  Ver Loja Demo
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Dados Seguros</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <span>Sem Cartão para Testar</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1000&auto=format&fit=crop" 
                  alt="Vitrine de Açougue Premium" 
                  className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating UI Elements */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-8 left-8 right-8 z-20 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Faturamento Hoje</p>
                      <p className="text-2xl font-bold text-white">R$ 4.250,00</p>
                    </div>
                    <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '75%' }} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-red-500 font-bold tracking-widest uppercase text-sm mb-3">Funcionalidades Premium</h2>
            <h3 className="text-4xl font-bold text-white mb-6">Tecnologia de Ponta para seu Negócio</h3>
            <p className="text-lg text-slate-400">
              Desenvolvido para eliminar perdas e maximizar lucros. Cada detalhe foi pensado para a rotina do açougue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-[#1E293B] p-8 rounded-3xl border border-white/5 hover:border-red-500/30 transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0F172A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-red-500 font-bold tracking-widest uppercase text-sm mb-3">Nossos Planos</h2>
            <h3 className="text-4xl font-bold text-white mb-6">Investimento que se Paga</h3>
            <p className="text-lg text-slate-400">
              Escolha o plano ideal para o tamanho do seu negócio. Upgrade ou downgrade a qualquer momento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative p-8 rounded-[2rem] border flex flex-col ${
                  plan.highlight 
                    ? 'border-red-500 bg-[#1E293B] shadow-2xl shadow-red-900/20 scale-105 z-10' 
                    : 'border-white/10 bg-[#0B1120] text-slate-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Recomendado
                  </div>
                )}
                <div className="mb-8">
                  <h4 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-slate-200'}`}>{plan.name}</h4>
                  <p className="text-sm text-slate-500 h-10">{plan.description}</p>
                </div>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-sm font-medium text-slate-400">R$</span>
                  <span className={`text-5xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-200'}`}>{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-red-500' : 'text-slate-600'}`} />
                      <span className={`text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/login" 
                  className={`w-full block text-center py-4 rounded-xl font-bold transition-all ${
                    plan.highlight 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20' 
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] text-slate-400 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xl font-bold text-white">MeatMaster<span className="text-red-600">Pro</span></span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-slate-500">
                Transformando a gestão de açougues no Brasil com tecnologia, design e inteligência.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Produto</h5>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-red-500 transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-red-500 transition-colors">Planos</a></li>
                <li><Link to="/store/demo" className="hover:text-red-500 transition-colors">Loja Demo</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Suporte</h5>
              <ul className="space-y-3 text-sm">
                <li><Link to="/manual" className="hover:text-red-500 transition-colors">Manual do Sistema</Link></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Status do Servidor</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© 2026 MeatMaster Pro. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
