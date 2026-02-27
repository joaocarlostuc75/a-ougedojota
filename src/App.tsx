import React, { Suspense, lazy } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp,
  ShoppingBasket, 
  ClipboardList, 
  Boxes, 
  UserCircle, 
  Truck, 
  Wallet, 
  Store, 
  Share2, 
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { NavItem } from "./components/Sidebar"; 
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const POS = lazy(() => import("./pages/POS"));
const Products = lazy(() => import("./pages/Products"));
const Inventory = lazy(() => import("./pages/Inventory"));
const OnlineStore = lazy(() => import("./pages/OnlineStore"));
const Customers = lazy(() => import("./pages/Customers"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const Finance = lazy(() => import("./pages/Finance"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const LinkTree = lazy(() => import("./pages/LinkTree"));
const Login = lazy(() => import("./pages/Login"));

// Loading fallback
const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4" />
    <p className="text-slate-500 font-medium animate-pulse">Carregando MeatMaster Pro...</p>
  </div>
);

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
        <NavItem href="/" icon={TrendingUp} label="Painel" />
        {canAccess('/pos') && <NavItem href="/pos" icon={ShoppingBasket} label="PDV (Caixa)" />}
        {canAccess('/products') && <NavItem href="/products" icon={ClipboardList} label="Produtos" />}
        {canAccess('/inventory') && <NavItem href="/inventory" icon={Boxes} label="Estoque" />}
        {canAccess('/customers') && <NavItem href="/customers" icon={UserCircle} label="Clientes" />}
        {canAccess('/suppliers') && <NavItem href="/suppliers" icon={Truck} label="Fornecedores" />}
        {canAccess('/finance') && <NavItem href="/finance" icon={Wallet} label="Financeiro" />}
        {canAccess('/store') && <NavItem href={`/store/${user.tenant?.slug || 'meatmaster'}`} icon={Store} label="Loja Online" external />}
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
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Standalone Route for Online Store (Customer View) */}
            <Route path="/store/:slug" element={<OnlineStore />} />
            <Route path="/links/:slug" element={<LinkTree />} />
  
            {/* Admin Routes with Sidebar */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/pos" element={<ProtectedRoute role="cashier"><POS /></ProtectedRoute>} />
                      <Route path="/products" element={<ProtectedRoute role="stock_manager"><Products /></ProtectedRoute>} />
                      <Route path="/inventory" element={<ProtectedRoute role="stock_manager"><Inventory /></ProtectedRoute>} />
                      <Route path="/customers" element={<ProtectedRoute role="cashier"><Customers /></ProtectedRoute>} />
                      <Route path="/suppliers" element={<ProtectedRoute role="stock_manager"><Suppliers /></ProtectedRoute>} />
                      <Route path="/finance" element={<ProtectedRoute role="admin"><Finance /></ProtectedRoute>} />
                      <Route path="/links" element={<LinkTree />} />
                      <Route path="/settings" element={<ProtectedRoute role="admin"><SettingsPage /></ProtectedRoute>} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
