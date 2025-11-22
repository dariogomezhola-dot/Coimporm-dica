
import React, { useState } from 'react';
import { ModuleType } from './types';
import { BookOpen, Megaphone, Bookmark, BarChart2, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth } from './firebase';
import Login from './components/Login';

// Strict relative paths to fix module resolution errors
import CRMModule from './components/CRMModule';
import ManualModule from './components/ManualModule';
import CampaignModule from './components/CampaignModule';
import LibraryModule from './components/LibraryModule';
import ReportsModule from './components/ReportsModule';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.CRM);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeModule) {
      case ModuleType.CRM: return <CRMModule />;
      case ModuleType.WIKI: return <ManualModule />;
      case ModuleType.RESOURCES: return <LibraryModule />;
      case ModuleType.CAMPAIGNS: return <CampaignModule />;
      case ModuleType.REPORTS: return <ReportsModule />;
      default: return <CRMModule />;
    }
  };

  const navItems = [
    { id: ModuleType.CRM, label: 'Tablero CRM', sub: 'Gestión Comercial', number: '01', icon: <LayoutDashboard size={18} /> },
    { id: ModuleType.WIKI, label: 'Wiki Interna', sub: 'Manual Operativo', number: '02', icon: <BookOpen size={18} /> },
    { id: ModuleType.RESOURCES, label: 'Recursos', sub: 'Biblioteca Global', number: '03', icon: <Bookmark size={18} /> },
    { id: ModuleType.CAMPAIGNS, label: 'Marketing', sub: 'Campañas & Pitch', number: '04', icon: <Megaphone size={18} /> },
    { id: ModuleType.REPORTS, label: 'Reportes', sub: 'Métricas KPI', number: '05', icon: <BarChart2 size={18} /> },
  ];

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-dark-900 text-slate-200 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-dark-800/95 border-r border-dark-700 backdrop-blur-xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-[70px] flex items-center px-6 border-b border-dark-700/50 bg-dark-900/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] mr-3">
            C
          </div>
          <div className="leading-tight">
             <h1 className="text-white font-semibold text-sm">Coimpormedica</h1>
             <p className="text-[10px] text-primary">CRM Operativo v3.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setSidebarOpen(false);
              }}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer border-l-[3px] ${
                activeModule === item.id
                  ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary shadow-lg shadow-primary/5'
                  : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="font-mono text-xs text-slate-500">{item.number}</span>
              <div className="flex flex-col">
                 <span className={`text-[10px] uppercase tracking-wider font-bold ${activeModule === item.id ? 'text-primary' : 'text-slate-500 group-hover:text-slate-400'}`}>{item.label}</span>
                 <span className={`text-sm font-medium ${activeModule === item.id ? 'text-white' : 'text-slate-300'}`}>
                    {item.sub}
                 </span>
              </div>
            </div>
          ))}
        </nav>

        {/* User Logout Area */}
        <div className="absolute bottom-0 w-full p-4 border-t border-dark-700/50 bg-dark-900/50">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="text-xs text-slate-400 truncate max-w-[130px]">
                      {user.email}
                  </div>
              </div>
              <button onClick={() => auth.signOut()} className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                  <LogOut size={16} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 bg-dark-900 relative">
        
        {/* Mobile Header */}
        <header className="h-[60px] border-b border-dark-700 bg-dark-900/80 backdrop-blur-md flex md:hidden items-center justify-between px-6 sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <button 
                className="text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h2 className="text-sm font-semibold text-white">CRM Coimpormedica</h2>
           </div>
        </header>

        {/* Content Area */}
        <div id="content-area" className="flex-1 relative overflow-hidden flex flex-col">
            {renderContent()}
        </div>

      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardLayout />
    </AuthProvider>
  );
};

export default App;
