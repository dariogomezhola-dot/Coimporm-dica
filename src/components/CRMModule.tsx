
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Lead, Campaign, PitchData } from '../types';
import { Plus, Phone, MessageCircle, Trash2, User, ArrowRight, AlertCircle, CheckCircle2, Clock, RefreshCw, LayoutDashboard, GripVertical, BookOpen, Edit2, Thermometer, Target, Timer } from 'lucide-react';

const CRMModule: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]); // To populate dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New/Edit Lead Form State
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({ 
      name: '', phone: '', interest: '', notes: '', campaignId: '', qualification: 'Suspect', temperature: 'Cold', responseTime: 0
  });

  // Fetch Leads
  useEffect(() => {
    const q = query(collection(db, "leads"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      leadsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLeads(leadsData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching leads:", error);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Campaigns for assignment
  useEffect(() => {
      const q = query(collection(db, "campaigns"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const cData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as Campaign[];
          setCampaigns(cData);
      });
      return () => unsubscribe();
  }, []);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData("leadId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Lead['status']) => {
      const leadId = e.dataTransfer.getData("leadId");
      if (leadId) {
          const lead = leads.find(l => l.id === leadId);
          if (lead && lead.status !== status) {
              const leadRef = doc(db, "leads", leadId);
              updateDoc(leadRef, {
                  status: status,
                  lastAction: `Movido a ${status}`
              });
          }
      }
  };

  // CRUD Actions
  const openModalForNew = () => {
      setEditingLeadId(null);
      setFormData({ name: '', phone: '', interest: '', notes: '', campaignId: '', qualification: 'Suspect', temperature: 'Cold', responseTime: 0 });
      setShowAddModal(true);
  };

  const openModalForEdit = (lead: Lead) => {
      setEditingLeadId(lead.id);
      setFormData({
          name: lead.name,
          phone: lead.phone,
          interest: lead.interest,
          notes: lead.notes,
          campaignId: lead.campaignId || '',
          qualification: lead.qualification || 'Suspect',
          temperature: lead.temperature || 'Cold',
          responseTime: lead.responseTime || 0
      });
      setShowAddModal(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLeadId) {
          // UPDATE EXISTING
          const leadRef = doc(db, "leads", editingLeadId);
          await updateDoc(leadRef, {
              ...formData,
              lastAction: 'Editado manualmente'
          });
      } else {
          // CREATE NEW
          await addDoc(collection(db, "leads"), {
            ...formData,
            status: 'NEW',
            createdAt: new Date().toISOString(),
            lastAction: 'Creado manualmente'
          });
      }
      setShowAddModal(false);
    } catch (error) {
      console.error("Error saving lead:", error);
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
        { name: "Carlos Ruiz", phone: "+57 300 123 4567", interest: "Micro CPAP", status: "NEW", notes: "Interesado por Facebook Ads", qualification: "MQL", temperature: "Warm" },
        { name: "Dra. Ana Torres", phone: "+57 310 987 6543", interest: "Equipos Clínicos", status: "CONTACTED", notes: "Pidió ficha técnica", qualification: "SQL", temperature: "Hot" },
        { name: "Hospital Central", phone: "+57 601 234 5678", interest: "Licitación 2024", status: "NEGOTIATION", notes: "Enviada cotización formal", qualification: "Opportunity", temperature: "Hot" },
    ];
    dummies.forEach(async (d) => {
        await addDoc(collection(db, "leads"), { ...d, createdAt: new Date().toISOString(), lastAction: 'Importado' });
    });
  };

  // Helper to find selected campaign details
  const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);

  // Kanban Column Component
  const KanbanColumn = ({ title, status, color, icon: Icon }: { title: string, status: Lead['status'], color: string, icon: any }) => {
    const columnLeads = leads.filter(l => l.status === status);
    
    return (
      <div 
        className="flex flex-col h-full min-w-[300px] bg-dark-800/50 rounded-xl border border-dark-700/50 flex-1 transition-colors"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
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
             <div 
                key={lead.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, lead.id)}
                className="bg-dark-900 border border-dark-700 p-4 rounded-lg shadow-sm hover:border-primary/50 group transition-all relative cursor-grab active:cursor-grabbing"
             >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <GripVertical size={12} className="text-slate-600" />
                      <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModalForEdit(lead)} className="text-slate-600 hover:text-primary p-1">
                          <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteLead(lead.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <Trash2 size={14} />
                      </button>
                   </div>
                </div>
                
                <div className="text-xs text-slate-400 mb-3 space-y-1">
                    <div className="flex items-center gap-2">
                        <Phone size={12} /> {lead.phone}
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                        <AlertCircle size={12} /> {lead.interest}
                    </div>
                    {lead.campaignId && (
                        <div className="bg-dark-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px] inline-block border border-dark-700 mt-1">
                            Camp: {campaigns.find(c => c.id === lead.campaignId)?.name || 'Desconocida'}
                        </div>
                    )}
                </div>

                {/* Metrics Row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {lead.qualification && (
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                            lead.qualification === 'MQL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            lead.qualification === 'SQL' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            lead.qualification === 'Opportunity' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                            {lead.qualification}
                        </span>
                    )}
                    {lead.temperature && (
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                            lead.temperature === 'Hot' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            lead.temperature === 'Warm' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                            <Thermometer size={8} /> {lead.temperature}
                        </span>
                    )}
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
                 Arrastra leads aquí
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
                onClick={openModalForNew}
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
            <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-primary"/> {editingLeadId ? 'Editar Cliente' : 'Registrar Cliente'}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Form */}
                    <form onSubmit={handleSaveLead} className="space-y-4">
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Nombre Cliente</label>
                            <input required className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none" 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Juan Pérez" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold">Teléfono</label>
                                <input required className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none" 
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+57..." />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold">Interés</label>
                                <input required className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none" 
                                    value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})} placeholder="Producto..." />
                            </div>
                        </div>

                        {/* --- NEW METRICS FIELDS --- */}
                        <div className="grid grid-cols-3 gap-3 bg-dark-900/50 p-3 rounded border border-dark-700">
                             <div>
                                <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1"><Target size={10}/> Calificación</label>
                                <select 
                                    className="w-full bg-dark-800 border border-dark-600 rounded p-1.5 text-xs text-white outline-none focus:border-primary"
                                    value={formData.qualification}
                                    onChange={e => setFormData({...formData, qualification: e.target.value as any})}
                                >
                                    <option value="Suspect">Sospechoso</option>
                                    <option value="MQL">MQL (Marketing)</option>
                                    <option value="SQL">SQL (Ventas)</option>
                                    <option value="Opportunity">Oportunidad</option>
                                </select>
                             </div>
                             <div>
                                <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1"><Thermometer size={10}/> Temperatura</label>
                                <select 
                                    className="w-full bg-dark-800 border border-dark-600 rounded p-1.5 text-xs text-white outline-none focus:border-primary"
                                    value={formData.temperature}
                                    onChange={e => setFormData({...formData, temperature: e.target.value as any})}
                                >
                                    <option value="Cold">Frío ❄️</option>
                                    <option value="Warm">Tibio 🌤️</option>
                                    <option value="Hot">Caliente 🔥</option>
                                </select>
                             </div>
                             <div>
                                <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 flex items-center gap-1"><Timer size={10}/> T. Respuesta (min)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-dark-800 border border-dark-600 rounded p-1.5 text-xs text-white outline-none focus:border-primary"
                                    value={formData.responseTime}
                                    onChange={e => setFormData({...formData, responseTime: Number(e.target.value)})}
                                />
                             </div>
                        </div>
                        
                        {/* Campaign Select */}
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Asignar Campaña</label>
                            <select 
                                className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none"
                                value={formData.campaignId}
                                onChange={e => setFormData({...formData, campaignId: e.target.value})}
                            >
                                <option value="">-- Sin Campaña --</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Notas Iniciales</label>
                            <textarea className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-white mt-1 focus:border-primary outline-none h-20 resize-none" 
                                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Detalles del primer contacto..." />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg">Cancelar</button>
                            <button type="submit" className="flex-1 bg-primary hover:bg-cyan-400 text-dark-900 font-bold py-2 rounded-lg">{editingLeadId ? 'Actualizar' : 'Guardar'}</button>
                        </div>
                    </form>

                    {/* Right: Mini-Library Preview */}
                    <div className="bg-dark-900 rounded-lg p-4 border border-dark-700 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3 text-slate-400">
                             <BookOpen size={16} />
                             <span className="text-xs font-bold uppercase">Guiones de Campaña</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {selectedCampaign ? (
                                <>
                                    <h4 className="text-accent text-sm font-bold mb-2">{selectedCampaign.name}</h4>
                                    {['A', 'B', 'C', 'D', 'E'].map(pitchKey => {
                                        const pitch = selectedCampaign.pitches[pitchKey] as PitchData | undefined;
                                        if(!pitch?.text) return null;
                                        return (
                                            <div key={pitchKey} className="bg-dark-800 p-2 rounded border border-dark-700">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[10px] bg-primary text-dark-900 px-1 rounded font-bold mr-2">{pitchKey}</span>
                                                    <span className="text-[9px] text-slate-400 italic">{pitch.title}</span>
                                                </div>
                                                <p className="text-xs text-slate-300 mt-1">{pitch.text}</p>
                                            </div>
                                        )
                                    })}
                                    {Object.values(selectedCampaign.pitches).every((p: any) => !p.text) && (
                                        <div className="text-center text-slate-600 text-xs italic mt-10">Esta campaña no tiene guiones definidos.</div>
                                    )}
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center px-4">
                                    Selecciona una campaña a la izquierda para previsualizar sus guiones y mensajes clave.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default CRMModule;
