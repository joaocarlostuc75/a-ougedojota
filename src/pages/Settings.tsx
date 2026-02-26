import { useState } from "react";
import { Save, Printer, Scale, CreditCard, ShieldCheck, Bell } from "lucide-react";

export default function Settings() {
  const [scaleConnected, setScaleConnected] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(true);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Gerencie hardware e preferências do sistema</p>
      </div>

      <div className="space-y-6">
        {/* Hardware Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-slate-500" />
            Integração de Hardware
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${scaleConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium text-slate-900">Balança Digital (Toledo/Filizola)</p>
                  <p className="text-xs text-slate-500">Porta COM3 - 9600 baud</p>
                </div>
              </div>
              <button 
                onClick={() => setScaleConnected(!scaleConnected)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                {scaleConnected ? 'Desconectar' : 'Conectar'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${printerConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium text-slate-900">Impressora Térmica (Epson TM-T20)</p>
                  <p className="text-xs text-slate-500">USB001 - Pronta para impressão</p>
                </div>
              </div>
              <button 
                onClick={() => setPrinterConnected(!printerConnected)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                {printerConnected ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          </div>
        </section>

        {/* Fiscal Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-500" />
            Dados Fiscais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
              <input type="text" defaultValue="12.345.678/0001-90" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Inscrição Estadual</label>
              <input type="text" defaultValue="123.456.789.111" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Regime Tributário</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option>Simples Nacional</option>
                <option>Lucro Presumido</option>
                <option>Lucro Real</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Token NFC-e</label>
              <input type="password" defaultValue="********" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-500" />
            Notificações
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500" />
              <span className="text-sm text-slate-700">Alertar quando estoque estiver baixo</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500" />
              <span className="text-sm text-slate-700">Receber resumo diário de vendas por email</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500" />
              <span className="text-sm text-slate-700">Notificar novos pedidos online via SMS</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium">
            <Save className="w-5 h-5" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
