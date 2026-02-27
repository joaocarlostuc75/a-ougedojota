import React from 'react';
import { Book, Monitor, ShoppingCart, Package, Users, BarChart, Settings, Globe, Smartphone, Printer, Scale } from 'lucide-react';

export default function Manual() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Manual do Sistema MeatMaster Pro</h1>
        <p className="text-xl text-slate-600">Guia completo de operação e funcionalidades</p>
      </div>

      <div className="grid gap-12">
        {/* Introdução */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Monitor className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            O MeatMaster Pro é um sistema completo de gestão para açougues e casas de carnes, integrando PDV (Ponto de Venda), 
            controle de estoque, gestão financeira e loja online em uma única plataforma.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Multi-plataforma</h3>
              <p className="text-sm text-slate-500">Acesse pelo computador, tablet ou celular com interface responsiva.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Online & Offline</h3>
              <p className="text-sm text-slate-500">Funcionalidades essenciais continuam operando mesmo sem internet.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Integrado</h3>
              <p className="text-sm text-slate-500">Conexão nativa com balanças, impressoras térmicas e leitores de código.</p>
            </div>
          </div>
        </section>

        {/* PDV */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Frente de Caixa (PDV)</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Realizando Vendas</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Utilize a barra de busca ou o leitor de código de barras para adicionar produtos.</li>
                <li>Para produtos pesáveis, o sistema lê automaticamente o peso da balança conectada.</li>
                <li>Selecione o cliente para vincular a venda (opcional).</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pagamento e Entrega</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Múltiplas formas de pagamento: Dinheiro, Cartão (Crédito/Débito) e PIX.</li>
                <li>Cálculo automático de troco.</li>
                <li>Opção de Entrega ou Retirada, com cálculo automático da taxa de entrega configurada.</li>
              </ul>
            </div>
            <div className="flex gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <Printer className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-700">
                <strong>Dica:</strong> A impressão do cupom é automática após a finalização da venda se a impressora estiver conectada.
              </p>
            </div>
          </div>
        </section>

        {/* Produtos e Estoque */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Produtos e Estoque</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cadastro de Produtos</h3>
              <p className="text-slate-600 mb-4">
                Cadastre produtos com foto, preço de custo, preço de venda e preço promocional. 
                Organize por categorias para facilitar a busca no PDV e na Loja Online.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Controle de Estoque</h3>
              <p className="text-slate-600 mb-4">
                Acompanhe a movimentação de entrada e saída. O sistema alerta automaticamente 
                quando o estoque atinge o nível mínimo configurado.
              </p>
            </div>
          </div>
        </section>

        {/* Loja Online */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Globe className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Loja Online</h2>
          </div>
          <p className="text-slate-600 mb-4">
            Seu estabelecimento ganha automaticamente um site de vendas (ex: meatmaster.com/sualoja).
          </p>
          <ul className="list-disc list-inside text-slate-600 space-y-2">
            <li>Catálogo digital atualizado em tempo real com o estoque.</li>
            <li>Clientes podem fazer pedidos para entrega ou retirada.</li>
            <li>Integração com WhatsApp para notificações de pedidos.</li>
            <li>Link na Bio personalizado para redes sociais.</li>
          </ul>
        </section>

        {/* Configurações e Hardware */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
              <Settings className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Configurações e Hardware</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-slate-500 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900">Balança</h3>
                <p className="text-sm text-slate-600">Compatível com balanças Toledo e Filizola via porta Serial (Protocolo P03). Conecte via cabo USB-Serial.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Printer className="w-5 h-5 text-slate-500 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900">Impressora</h3>
                <p className="text-sm text-slate-600">Compatível com impressoras térmicas ESC/POS via USB. Permite impressão de cupons não-fiscais.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-slate-500 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900">Taxa de Entrega</h3>
                <p className="text-sm text-slate-600">Configure o valor padrão da taxa de entrega no menu Configurações. Este valor será aplicado automaticamente no PDV e na Loja Online.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>© 2026 MeatMaster Pro. Todos os direitos reservados.</p>
        <p>Versão do Sistema: 2.4.0</p>
      </footer>
    </div>
  );
}
