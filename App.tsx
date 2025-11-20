import React, { useState } from 'react';
import { ModuleType } from './types';
import { BookOpen, Megaphone, Bookmark, BarChart2, Menu, Bell } from 'lucide-react';

// Components
import ManualModule from './components/ManualModule';
import CampaignModule from './components/CampaignModule';
import LibraryModule from './components/LibraryModule';
import ReportsModule from './components/ReportsModule';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.MANUAL);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeModule) {
      case ModuleType.MANUAL: return <ManualModule />;
      case ModuleType.CAMPAIGNS: return <CampaignModule />;
      case ModuleType.LIBRARY: return <LibraryModule />;
      case ModuleType.REPORTS: return <ReportsModule />;
      default: return <ManualModule />;
    }
  };

  const navItems = [
    { id: ModuleType.MANUAL, label: 'El Libro', sub: 'Manual Operativo', number: '01', icon: <BookOpen size={18} /> },
    { id: ModuleType.CAMPAIGNS, label: 'El Megáfono', sub: 'Campañas', number: '02', icon: <Megaphone size={18} /> },
    { id: ModuleType.LIBRARY, label: 'Marcador', sub: 'Biblioteca', number: '03', icon: <Bookmark size={18} /> },
    { id: ModuleType.REPORTS, label: 'Métricas', sub: 'Reportes', number: '04', icon: <BarChart2 size={18} /> },
  ];

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
        fixed inset-y-0 left-0 z-50 w-[260px] bg-dark-800/50 border-r border-dark-700 backdrop-blur-xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-[70px] flex items-center px-6 border-b border-dark-700/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] mr-3">
            W
          </div>
          <div className="leading-tight">
             <h1 className="text-white font-semibold text-sm">Dash<span className="text-primary">Integral</span></h1>
             <p className="text-[10px] text-slate-400">SPM-WhatsApp System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-70px)]">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setSidebarOpen(false);
              }}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer border-l-[3px] ${
                activeModule === item.id
                  ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary'
                  : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="font-mono text-xs text-slate-500">{item.number}</span>
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-wider text-primary font-bold">{item.label}</span>
                 <span className={`text-sm font-medium ${activeModule === item.id ? 'text-white' : 'text-slate-300'}`}>
                    {item.sub}
                 </span>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 bg-dark-900 relative">
        
        {/* Header */}
        <header className="h-[70px] border-b border-dark-700 bg-dark-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <button 
                className="md:hidden text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="hidden sm:block">
                  <h2 className="text-sm font-semibold text-white">Manual Interno · SPM-WhatsApp</h2>
                  <p className="text-[11px] text-slate-400">Sistema de Pitch Modular · Ejemplo: Micro CPAP Transcend</p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-medium">
                 <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#22c55e]"></span>
                 Modo presentación activo
              </div>
              <div className="h-8 w-px bg-dark-700 mx-2 hidden md:block"></div>
              <span className="text-xs text-slate-500 hidden md:inline">Usa ← → o el índice</span>
           </div>
        </header>

        {/* Content Area */}
        <div id="content-area" className="flex-1 relative overflow-hidden flex flex-col">
            {renderContent()}
        </div>

      </main>
    </div>
  );
};

export default App;