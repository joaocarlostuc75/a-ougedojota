import { useEffect, useState } from "react";
import { Save, Printer, Scale, CreditCard, ShieldCheck, Bell, Store, Instagram, Facebook, MessageCircle, MapPin, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { scale, printer } from "../lib/hardware";

export default function Settings() {
  const { user } = useAuth();
  const [scaleConnected, setScaleConnected] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    address: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    opening_hours: '',
    logo_url: ''
  });

  useEffect(() => {
    if (user?.tenant_id) {
      fetch('/api/settings', {
        headers: { 'x-tenant-id': user.tenant_id.toString() }
      })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            address: data.address || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            opening_hours: data.opening_hours || '',
            logo_url: data.logo_url || ''
          });
        }
      });
    }
  }, [user]);

  const handleConnectScale = async () => {
    if (scaleConnected) {
      await scale.disconnect();
      setScaleConnected(false);
    } else {
      const success = await scale.connect();
      if (success) setScaleConnected(true);
      else alert("Não foi possível conectar à balança. Verifique se o navegador suporta Web Serial.");
    }
  };

  const handleConnectPrinter = async () => {
    if (printerConnected) {
      setPrinterConnected(false);
    } else {
      const success = await printer.connect();
      if (success) setPrinterConnected(true);
      else alert("Não foi possível conectar à impressora. Verifique se o navegador suporta Web USB.");
    }
  };

  const handleSave = async () => {
    if (!user?.tenant_id) return;
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenant_id.toString()
        },
        body: JSON.stringify(settings)
      });
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Gerencie hardware e preferências do sistema</p>
      </div>

      <div className="space-y-6">
        {/* Establishment Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-slate-500" />
            Dados do Estabelecimento (Loja Online & Link na Bio)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={settings.address}
                  onChange={e => setSettings({...settings, address: e.target.value})}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone de Contato</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={settings.phone}
                onChange={e => setSettings({...settings, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp (Link na Bio)</label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={settings.whatsapp}
                  onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                  placeholder="5511999999999"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram (@usuario)</label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={settings.instagram}
                  onChange={e => setSettings({...settings, instagram: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook (Link ou Nome)</label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={settings.facebook}
                  onChange={e => setSettings({...settings, facebook: e.target.value})}
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Funcionamento</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                <textarea 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  rows={3}
                  value={settings.opening_hours}
                  onChange={e => setSettings({...settings, opening_hours: e.target.value})}
                  placeholder="Seg-Sex: 08:00 - 20:00&#10;Sáb: 08:00 - 18:00"
                />
              </div>
            </div>
          </div>
        </section>

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
                  <p className="text-xs text-slate-500">Porta Serial - Protocolo P03</p>
                </div>
              </div>
              <button 
                onClick={handleConnectScale}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scaleConnected ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                {scaleConnected ? 'Desconectar' : 'Conectar Balança'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${printerConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium text-slate-900">Impressora Térmica (ESC/POS)</p>
                  <p className="text-xs text-slate-500">USB - Impressão Direta</p>
                </div>
              </div>
              <button 
                onClick={handleConnectPrinter}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${printerConnected ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                {printerConnected ? 'Desconectar' : 'Conectar Impressora'}
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
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
