import React from "react";
import { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
}

export function NavItem({ href, icon: Icon, label, external }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="relative block group">
        <div
          className={cn(
            "relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200",
            "text-slate-400 group-hover:text-white"
          )}
        >
          <Icon className={cn("w-5 h-5 transition-colors", "text-slate-500 group-hover:text-white")} />
          <span className="font-medium">{label}</span>
        </div>
      </a>
    );
  }

  return (
    <Link to={href} className="relative block group">
      <div
        className={cn(
          "relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200",
          isActive ? "text-white" : "text-slate-400 group-hover:text-white"
        )}
      >
        <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
        <span className="font-medium">{label}</span>
      </div>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 bg-red-600 rounded-xl z-0 shadow-lg shadow-red-900/20"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'cashier': return 'Operador de Caixa';
      case 'stock_manager': return 'Gerente de Estoque';
      default: return role;
    }
  };

  return (
    <aside className="w-64 bg-[#1a1a1a] h-screen flex flex-col fixed left-0 top-0 border-r border-white/5 overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #DC2626 0%, transparent 50%)' }} 
      />

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 shrink-0">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none text-white">MeatMaster</h1>
            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Sistema Pro</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 relative z-10 overflow-y-auto custom-scrollbar">
        {children}
      </nav>

      <div className="p-4 border-t border-white/10 relative z-10 mt-auto bg-[#1a1a1a]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xs border border-white/10 group-hover:border-white/20 transition-colors">
            {user?.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-tight">
              {user ? getRoleLabel(user.role) : 'Visitante'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

