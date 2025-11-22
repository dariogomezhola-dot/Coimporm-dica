
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Lead } from '../types';
import { Plus, Phone, MessageCircle, Trash2, User, ArrowRight, AlertCircle, CheckCircle2, Clock, RefreshCw, LayoutDashboard } from 'lucide-react';

const CRMModule: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Lead Form State
  const [newLead, setNewLead] = useState({ name: '', phone: '', interest: '', notes: '' });

  // Fetch Leads
  useEffect(() => {
    // Use a simple query first to avoid index requirements errors during dev
    const q = query(collection(db, "leads"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      // Sort manually to avoid composite index requirement on Firestore
      leadsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setLeads(leadsData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching leads:", error);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // CRUD Actions
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "leads"), {
        ...newLead,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        lastAction: 'Creado manualmente'
      });
      setShowAddModal(false);
      setNewLead({ name: '', phone: '', interest: '', notes: '' });
    } catch (error) {
      console.error("Error adding lead:", error);
      alert("Error al guardar. Revisa los permisos de Firebase.");
    }
  };

  const handleMoveLead = async (id: string, currentStatus: Lead['status']) => {
    const statusOrder: Lead['status'][] = ['NEW', 'CONTACTED', 'NEGOTIATION', 'CLOSED'];
    const nextIndex = statusOrder.indexOf(currentStatus) + 1;
    
    if (nextIndex < statusOrder.length) {
      const leadRef = doc(db, "leads", id);
      await updateDoc(leadRef, { 
        status: statusOrder[nextIndex],
        lastAction: `Movido a ${statusOrder[nextIndex]}`
      });
    }
  };

  const handleDeleteLead = async (id: string) => {
    if(window.confirm("¿Eliminar este cliente?")) {
      await deleteDoc(doc(db, "leads", id));
    }
  };

  const generateDummyData = async () => {
    const dummies = [
        { name: "Carlos Ruiz", phone: "+57 300 123 4567", interest: "Micro CPAP", status: "NEW", notes: "Interesado por Facebook Ads" },
        { name: "Dra. Ana Torres", phone: "+57 310 987 6543", interest: "Equipos Clínicos", status: "CONTACTED", notes: "Pidió ficha técnica" },
        { name: "Hospital Central", phone: "+57 601 234 5678", interest: "Licitación 2024", status: "NEGOTIATION", notes: "Enviada cotización formal" },
    ];
    dummies.forEach(async (d) => {
        await addDoc(collection(db, "leads"), { ...d, createdAt: new Date().toISOString(), lastAction: 'Importado' });
    });
  };

  // Kanban Column Component
  const KanbanColumn = ({ title, status, color, icon: Icon }: { title: string, status: Lead['status'], color: string, icon: any }) => {
    const columnLeads = leads.filter(l => l.status === status);
    
    return (
      <div className="flex flex-col h-full min-w-[280px] bg-dark-800/50 rounded-xl border border-dark-700/50 flex-1">
        {/* Header */}
        <div className={`p-4 border-b border-dark-700 flex items-center justify-between ${color} bg-opacity-10`}>
           <div className="flex items-center gap-2">
              <Icon size={16} className={color.replace('bg-', 'text-')} />
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wide">{title}</h3>
           </div>
           <span className="bg-dark-900 text-slate-400 text-xs font-mono py-0.5 px-2 rounded-full border border-dark-700">
             {columnLeads.length}
           </span>
        </div>

        {/* Cards Area */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
           {columnLeads.map(lead => (
             <div key={lead.id} className="bg-dark-900 border border-dark-700 p-4 rounded-lg shadow-sm hover:border-primary/50 group transition-all relative">
                
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                   <button onClick={() => handleDeleteLead(lead.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                   </button>
                </div>
                
                <div className="text-xs text-slate-400 mb-3 space-y-1">
                    <div className="flex items-center gap-2">
                        <Phone size={12} /> {lead.phone}
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                        <AlertCircle size={12} /> {lead.interest}
                    </div>
                    {lead.notes && <div className="italic opacity-70 mt-1 line-clamp-2">"{lead.notes}"</div>}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    
                    {status !== 'CLOSED' && (
                        <button 
                          onClick={() => handleMoveLead(lead.id, status)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase bg-dark-800 hover:bg-primary hover:text-dark-900 px-2 py-1 rounded border border-dark-700 transition-colors"
                        >
                          Mover <ArrowRight size={10} />
                        </button>
                    )}
                </div>
             </div>
           ))}
           {columnLeads.length === 0 && (
              <div className="h-24 border-2 border-dashed border-dark-700 rounded-lg flex items-center justify-center text-slate-600 text-xs">
                 Vacío
              </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 p-4 md:p-6 overflow-hidden">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
               Tablero Comercial
               <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">En vivo</span>
            </h1>
            <p className="text-slate-400 text-sm">Gestión de flujo de clientes y oportunidades.</p>
        </div>
        <div className="flex gap-3">
            {leads.length === 0 && !isLoading && (
                <button onClick={generateDummyData} className="text-xs text-slate-400 hover:text-white flex items-center gap-2 px-3 py-2 border border-dark-700 rounded-lg">
                    <RefreshCw size={14} /> Generar Leads de Prueba
                </button>
            )}
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-cyan-400 text-dark-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/10 transition-all"
            >
                <Plus size={18} /> Nuevo Lead
            </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
         <div className="flex h-full gap-4 min-w-[1000px]">
            <KanbanColumn title="Nuevos (Entrantes)" status="NEW" color="text-blue-400" icon={AlertCircle} />
            <KanbanColumn title="En Proceso (Contactado)" status="CONTACTED" color="text-yellow-400" icon={Clock} />
            <KanbanColumn title="Negociación (Pitch Enviado)" status="NEGOTIATION" color="text-purple-400" icon={MessageCircle} />
            <KanbanColumn title="Cerrados (Ventas)" status="CLOSED" color="text-green-400" icon={CheckCircle2} />
         </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-primary"/> Registrar Cliente
                </h2>
                <form onSubmit={handleAddLead} className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-slate-500 font-bold">Nombre Cliente</label>
                        <input required className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none" 
                            value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="Ej: Juan Pérez" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Teléfono</label>
                            <input required className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none" 
                                value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="+57..." />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Interés</label>
                            <input required className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none" 
                                value={newLead.interest} onChange={e => setNewLead({...newLead, interest: e.target.value})} placeholder="Producto..." />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-slate-500 font-bold">Notas Iniciales</label>
                        <textarea className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none h-20 resize-none" 
                            value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})} placeholder="Detalles del primer contacto..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 bg-primary hover:bg-cyan-400 text-dark-900 font-bold py-2 rounded-lg">Guardar Lead</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default CRMModule;
