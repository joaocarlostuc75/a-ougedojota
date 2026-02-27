import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Share2,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface LinkSettings {
  address?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  opening_hours?: string;
  logo_url?: string;
}

export default function LinkTree() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [settings, setSettings] = useState<LinkSettings>({});
  const [tenantName, setTenantName] = useState("MeatMaster Pro");
  const [tenantSlug, setTenantSlug] = useState("meatmaster");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (slug) {
          // Public view
          const res = await fetch(`/api/public/store/${slug}`);
          const data = await res.json();
          if (data && !data.error) {
            setSettings(data.settings || {});
            setTenantName(data.tenant?.name || "MeatMaster Pro");
            setTenantSlug(data.tenant?.slug || slug);
          }
        } else if (user?.tenant_id) {
          // Private view inside system
          const res = await fetch('/api/settings', {
            headers: { 'x-tenant-id': user.tenant_id.toString() }
          });
          const data = await res.json();
          if (data && !data.error) {
            setSettings(data);
            setTenantName(user.tenant?.name || "MeatMaster Pro");
            setTenantSlug(user.tenant?.slug || "meatmaster");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [slug, user]);

  const copyLink = () => {
    const url = slug ? window.location.href : `${window.location.origin}/links/${tenantSlug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const links = [
    {
      title: "Fazer Pedido Online",
      subtitle: "Peça agora e receba em casa",
      icon: ShoppingBag,
      href: `/store/${tenantSlug}`,
      color: "bg-red-600",
      textColor: "text-white",
      show: true
    },
    {
      title: "WhatsApp",
      subtitle: "Fale direto com nossos açougueiros",
      icon: MessageCircle,
      href: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : null,
      color: "bg-emerald-500",
      textColor: "text-white",
      show: !!settings.whatsapp
    },
    {
      title: "Instagram",
      subtitle: "Siga-nos para ver as ofertas do dia",
      icon: Instagram,
      href: settings.instagram ? `https://instagram.com/${settings.instagram.replace('@', '')}` : null,
      color: "bg-gradient-to-tr from-purple-600 to-pink-500",
      textColor: "text-white",
      show: !!settings.instagram
    },
    {
      title: "Facebook",
      subtitle: "Acompanhe nossa página",
      icon: Facebook,
      href: settings.facebook ? (settings.facebook.startsWith('http') ? settings.facebook : `https://facebook.com/${settings.facebook}`) : null,
      color: "bg-blue-600",
      textColor: "text-white",
      show: !!settings.facebook
    },
    {
      title: "Nossa Localização",
      subtitle: settings.address || "Veja como chegar",
      icon: MapPin,
      href: settings.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` : null,
      color: "bg-slate-800",
      textColor: "text-white",
      show: !!settings.address
    }
  ].filter(l => l.show);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center p-6 font-sans">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mt-12 mb-8 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/40 mb-4 border-4 border-white/10">
          <span className="text-4xl font-bold">{tenantName.charAt(0)}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{tenantName}</h1>
        <p className="text-slate-400 text-sm mt-1">O melhor corte da região na sua mesa</p>
      </motion.div>

      {/* Links */}
      <div className="w-full max-w-md space-y-4 mb-12">
        {links.map((link, idx) => (
          <motion.a
            key={idx}
            href={link.href || '#'}
            target={link.href?.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-2xl ${link.color} ${link.textColor} shadow-lg hover:scale-[1.02] transition-transform group`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <link.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight">{link.title}</h3>
              <p className="text-xs opacity-80">{link.subtitle}</p>
            </div>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.a>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-4 mb-12">
        <button 
          onClick={copyLink}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <Share2 className="w-4 h-4" /> Compartilhar
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto text-center space-y-4">
        <div className="flex justify-center gap-6 text-slate-500">
          {settings.instagram && <Instagram className="w-5 h-5 hover:text-white cursor-pointer" />}
          {settings.facebook && <Facebook className="w-5 h-5 hover:text-white cursor-pointer" />}
          {settings.whatsapp && <MessageCircle className="w-5 h-5 hover:text-white cursor-pointer" />}
        </div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          Powered by MeatMaster Pro System
        </p>
      </div>
    </div>
  );
}
