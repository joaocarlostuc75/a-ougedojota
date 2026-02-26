import React from "react";
import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  ShoppingBasket, 
  Package, 
  Users, 
  BarChart3, 
  Settings as SettingsIcon,
  Store,
  Wallet,
  Share2,
  Truck,
  LogOut,
  ClipboardList,
  Boxes,
  UserCircle,
  TrendingUp
} from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { NavItem } from "./components/Sidebar"; 
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import OnlineStore from "./pages/OnlineStore";
import Customers from "./pages/Customers";
import SettingsPage from "./pages/Settings";
import Finance from "./pages/Finance";
import Suppliers from "./pages/Suppliers";
import LinkTree from "./pages/LinkTree";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Placeholder for Reports
const Reports = () => <div className="p-8"><h1 className="text-2xl font-bold">Relatórios</h1></div>;

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;

  const canAccess = (role: string) => {
    if (user.role === 'admin') return true;
    if (user.role === 'cashier') return ['/', '/pos', '/customers', '/store', '/links'].includes(role);
    if (user.role === 'stock_manager') return ['/', '/products', '/inventory', '/suppliers'].includes(role);
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar>
        <NavItem href="/" icon={TrendingUp} label="Dashboard" />
        {canAccess('/pos') && <NavItem href="/pos" icon={ShoppingBasket} label="PDV (Caixa)" />}
        {canAccess('/products') && <NavItem href="/products" icon={ClipboardList} label="Produtos" />}
        {canAccess('/inventory') && <NavItem href="/inventory" icon={Boxes} label="Estoque" />}
        {canAccess('/customers') && <NavItem href="/customers" icon={UserCircle} label="Clientes" />}
        {canAccess('/suppliers') && <NavItem href="/suppliers" icon={Truck} label="Fornecedores" />}
        {canAccess('/finance') && <NavItem href="/finance" icon={Wallet} label="Financeiro" />}
        {canAccess('/store') && <NavItem href="/store" icon={Store} label="Loja Online (Preview)" />}
        {canAccess('/links') && <NavItem href="/links" icon={Share2} label="Link na Bio" />}
        {user.role === 'admin' && <NavItem href="/settings" icon={SettingsIcon} label="Configurações" />}
        
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all mt-auto mb-4 mx-4"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </Sidebar>
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (role && user.role !== 'admin' && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Standalone Route for Online Store (Customer View) */}
          <Route path="/store" element={<OnlineStore />} />
          <Route path="/links" element={<LinkTree />} />

          {/* Admin Routes with Sidebar */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pos" element={<ProtectedRoute role="cashier"><POS /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute role="stock_manager"><Products /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute role="stock_manager"><Inventory /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute role="cashier"><Customers /></ProtectedRoute>} />
                  <Route path="/suppliers" element={<ProtectedRoute role="stock_manager"><Suppliers /></ProtectedRoute>} />
                  <Route path="/finance" element={<ProtectedRoute role="admin"><Finance /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute role="admin"><SettingsPage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
