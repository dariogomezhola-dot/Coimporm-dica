
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { LogisticsRoute, DeliveryItem } from '../types';
import { MapPin, User, Calendar, Truck, Bike, Package, CheckSquare, Plus, X, Save, MoreHorizontal, Trash2, Edit2, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

const LogisticsModule: React.FC = () => {
  const [routes, setRoutes] = useState<LogisticsRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LogisticsRoute>>({
      title: '', responsible: '', date: '', status: 'PENDING', priority: 'MEDIUM', vehicleType: 'MOTO', destination: '', observations: ''
  });
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  // Fetch Routes
  useEffect(() => {
      const q = query(collection(db, "logistics_routes"), orderBy("date", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LogisticsRoute[];
          setRoutes(data);
          setIsLoading(false);
      }, (error) => {
          console.error("Error fetching routes:", error);
          setIsLoading(false);
      });
      return () => unsubscribe();
  }, []);

  // CRUD
  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const payload = {
              ...formData,
              items: items,
              updatedAt: new Date().toISOString()
          };

          if (editingId) {
              await updateDoc(doc(db, "logistics_routes", editingId), payload);
          } else {
              await addDoc(collection(db, "logistics_routes"), {
                  ...payload,
                  createdAt: new Date().toISOString()
              });
          }
          setShowModal(false);
          resetForm();
      } catch (error) {
          console.error(error);
          alert("Error al guardar ruta.");
      }
  };

  const handleDelete = async (id: string) => {
      if(window.confirm("¿Eliminar esta ruta?")) {
          await deleteDoc(doc(db, "logistics_routes", id));
      }
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({ title: '', responsible: '', date: '', status: 'PENDING', priority: 'MEDIUM', vehicleType: 'MOTO', destination: '', observations: '' });
      setItems([]);
  };

  const openEdit = (route: LogisticsRoute) => {
      setEditingId(route.id);
      setFormData(route);
      setItems(route.items || []);
      setShowModal(true);
  };

  // Item Logic
  const addItem = () => {
      if(!newItemName.trim()) return;
      setItems([...items, { id: Date.now().toString(), name: newItemName, checked: false }]);
      setNewItemName('');
  };

  const deleteItem = (id: string) => {
      setItems(items.filter(i => i.id !== id));
  };

  const toggleItem = (id: string) => {
      setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const getPriorityColor = (p: string) => {
      if (p === 'HIGH') return 'text-red-400 border-red-400/30 bg-red-500/10';
      if (p === 'MEDIUM') return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10';
      return 'text-blue-400 border-blue-400/30 bg-blue-500/10';
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2 shrink-0 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
               Logística & Rutas
               <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Mensajería</span>
            </h1>
            <p className="text-slate-400 text-sm">Control de entregas, despachos y mensajería urbana.</p>
        </div>
        <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-primary hover:bg-cyan-400 text-dark-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/10"
        >
            <Plus size={18} /> Nueva Ruta
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {routes.map(route => (
                <div key={route.id} className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group">
                    {/* Card Header */}
                    <div className="p-4 border-b border-dark-700/50 bg-dark-900/30 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-white text-lg">{route.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                <User size={12} /> {route.responsible}
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold border ${getPriorityColor(route.priority || 'MEDIUM')}`}>
                            {route.priority === 'HIGH' ? 'ALTA' : route.priority === 'MEDIUM' ? 'NORMAL' : 'BAJA'}
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                                {route.vehicleType === 'MOTO' ? <Bike size={16} className="text-accent"/> : <Truck size={16} className="text-accent"/>}
                                <span className="uppercase text-xs font-bold">{route.vehicleType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar size={14} />
                                <span>{route.date}</span>
                            </div>
                        </div>

                        <div className="bg-dark-900/50 p-3 rounded border border-dark-700">
                             <div className="flex items-center gap-2 text-xs uppercase text-slate-500 font-bold mb-2">
                                <MapPin size={12} /> Destino
                             </div>
                             <p className="text-sm text-white truncate">{route.destination || 'Sin destino especificado'}</p>
                        </div>

                        {/* Progress Checklist */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-slate-500 uppercase font-bold">Carga / Items</span>
                                <span className="text-xs text-slate-400">
                                    {route.items?.filter(i => i.checked).length || 0}/{route.items?.length || 0}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-dark-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all" 
                                    style={{ width: `${route.items && route.items.length > 0 ? (route.items.filter(i => i.checked).length / route.items.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {route.status === 'PENDING' && (
                            <div className="flex items-center gap-2 text-yellow-500 text-xs bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                <AlertTriangle size={14} /> Pendiente de salida
                            </div>
                        )}
                        {route.status === 'IN_TRANSIT' && (
                            <div className="flex items-center gap-2 text-blue-400 text-xs bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                <Truck size={14} /> En ruta
                            </div>
                        )}
                         {route.status === 'DELIVERED' && (
                            <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-2 rounded border border-green-500/20">
                                <CheckCircle2 size={14} /> Entregado
                            </div>
                        )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 border-t border-dark-700 bg-dark-900/30 flex justify-end gap-2">
                        <button onClick={() => openEdit(route)} className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(route.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
                  <div className="p-6 border-b border-dark-700 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          {editingId ? <Edit2 size={20} className="text-primary"/> : <Plus size={20} className="text-primary"/>}
                          {editingId ? 'Editar Ruta' : 'Programar Ruta'}
                      </h2>
                      <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                      {/* Section 1: Basic Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                              <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Nombre de la Ruta</label>
                              <input className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none" 
                                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Entrega Equipos Norte" />
                          </div>
                          <div>
                              <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Responsable</label>
                              <input className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none" 
                                  value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} placeholder="Nombre del mensajero" />
                          </div>
                          <div>
                              <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Fecha</label>
                              <input type="date" className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none scheme-dark" 
                                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                          </div>
                      </div>

                      {/* Section 2: Logistics Details */}
                      <div className="grid grid-cols-3 gap-4 bg-dark-900/50 p-4 rounded-lg border border-dark-700">
                          <div>
                               <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Prioridad</label>
                               <select className="w-full bg-dark-800 border border-dark-600 rounded p-2 text-sm text-white focus:border-primary outline-none"
                                  value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                                  <option value="LOW">Baja</option>
                                  <option value="MEDIUM">Normal</option>
                                  <option value="HIGH">Alta 🔥</option>
                               </select>
                          </div>
                          <div>
                               <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Vehículo</label>
                               <select className="w-full bg-dark-800 border border-dark-600 rounded p-2 text-sm text-white focus:border-primary outline-none"
                                  value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value as any})}>
                                  <option value="MOTO">Moto 🏍️</option>
                                  <option value="CAR">Carro 🚗</option>
                                  <option value="TRUCK">Camión 🚛</option>
                               </select>
                          </div>
                          <div>
                               <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Estado</label>
                               <select className="w-full bg-dark-800 border border-dark-600 rounded p-2 text-sm text-white focus:border-primary outline-none"
                                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                  <option value="PENDING">Pendiente</option>
                                  <option value="IN_TRANSIT">En Ruta</option>
                                  <option value="DELIVERED">Entregado</option>
                                  <option value="CANCELLED">Cancelado</option>
                               </select>
                          </div>
                          <div className="col-span-3">
                               <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Dirección / Destino</label>
                               <div className="flex items-center gap-2 bg-dark-800 border border-dark-600 rounded p-2">
                                   <MapPin size={16} className="text-slate-400" />
                                   <input className="bg-transparent w-full text-white outline-none text-sm" 
                                      value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="Dirección exacta o zona..." />
                               </div>
                          </div>
                      </div>

                      {/* Section 3: Items Checklist */}
                      <div>
                          <label className="text-xs uppercase text-slate-500 font-bold block mb-2 flex items-center gap-2">
                             <Package size={14}/> Productos a llevar (Checklist)
                          </label>
                          <div className="bg-dark-900 border border-dark-600 rounded-lg p-4">
                              <div className="flex gap-2 mb-3">
                                  <input className="flex-1 bg-dark-800 border border-dark-600 rounded p-2 text-sm text-white focus:border-primary outline-none"
                                      placeholder="Añadir item (ej: Caja CPAP Transcend)..."
                                      value={newItemName}
                                      onChange={e => setNewItemName(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && addItem()}
                                  />
                                  <button type="button" onClick={addItem} className="bg-dark-700 hover:bg-primary hover:text-dark-900 text-white p-2 rounded transition-colors">
                                      <Plus size={18}/>
                                  </button>
                              </div>
                              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                  {items.map(item => (
                                      <div key={item.id} className="flex items-center gap-3 p-2 bg-dark-800 rounded border border-dark-700 hover:border-primary/30 group">
                                          <button type="button" onClick={() => toggleItem(item.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-primary border-primary text-dark-900' : 'border-slate-500 text-transparent'}`}>
                                              <CheckSquare size={12} />
                                          </button>
                                          <span className={`flex-1 text-sm ${item.checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.name}</span>
                                          <button type="button" onClick={() => deleteItem(item.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                  ))}
                                  {items.length === 0 && <div className="text-center text-slate-600 text-xs py-2">Lista vacía</div>}
                              </div>
                          </div>
                      </div>

                      {/* Section 4: Observations */}
                      <div>
                          <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Observaciones / Bitácora</label>
                          <textarea className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none h-20 resize-none" 
                              value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} placeholder="Notas adicionales sobre la entrega..." />
                      </div>
                  </div>

                  <div className="p-6 border-t border-dark-700 flex gap-4 bg-dark-800 rounded-b-2xl">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                      <button type="button" onClick={handleSave} className="flex-1 bg-primary hover:bg-cyan-400 text-dark-900 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/10">
                          <Save size={18} /> Guardar Ruta
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default LogisticsModule;
