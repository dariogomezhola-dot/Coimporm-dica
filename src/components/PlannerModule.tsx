
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { PlannerTask, SubTask } from '../types';
import { Plus, Calendar, User, AlignLeft, MoreHorizontal, CheckCircle2, Circle, Clock, AlertCircle, Trash2, X, Edit3, CheckSquare, ListTodo, MinusCircle } from 'lucide-react';

const PlannerModule: React.FC = () => {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PlannerTask>>({
      title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assignee: '', labels: []
  });
  
  // Subtasks State for the Form
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // --- FETCH TASKS ---
  useEffect(() => {
      const q = query(collection(db, "planner_tasks"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PlannerTask[];
          setTasks(data);
          setIsLoading(false);
      }, (error) => {
          console.error("Error fetching tasks:", error);
          setIsLoading(false);
      });
      return () => unsubscribe();
  }, []);

  // --- CRUD OPERATIONS ---
  const handleSaveTask = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const taskData = {
              ...formData,
              subtasks: subtasks // Include subtasks in save
          };

          if (editingId) {
              await updateDoc(doc(db, "planner_tasks", editingId), taskData);
          } else {
              await addDoc(collection(db, "planner_tasks"), {
                  ...taskData,
                  createdAt: new Date().toISOString(),
                  status: formData.status || 'TODO'
              });
          }
          setShowModal(false);
          resetForm();
      } catch (error) {
          console.error("Error saving task:", error);
          alert("Error al guardar tarea.");
      }
  };

  const handleDeleteTask = async (id: string) => {
      if (window.confirm("¿Eliminar esta tarea?")) {
          await deleteDoc(doc(db, "planner_tasks", id));
      }
  };

  const resetForm = () => {
      setEditingId(null);
      setFormData({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assignee: '', labels: [] });
      setSubtasks([]);
      setNewSubtaskTitle('');
  };

  const openEdit = (task: PlannerTask) => {
      setEditingId(task.id);
      setFormData(task);
      setSubtasks(task.subtasks || []);
      setShowModal(true);
  };

  // --- SUBTASK LOGIC ---
  const handleAddSubtask = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!newSubtaskTitle.trim()) return;
      const newItem: SubTask = {
          id: Date.now().toString(),
          title: newSubtaskTitle,
          completed: false
      };
      setSubtasks([...subtasks, newItem]);
      setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
      setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const deleteSubtask = (id: string) => {
      setSubtasks(subtasks.filter(s => s.id !== id));
  };

  // --- DRAG & DROP ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: PlannerTask['status']) => {
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) {
          const task = tasks.find(t => t.id === taskId);
          if (task && task.status !== status) {
              // Optimistic Update
              const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
              setTasks(updatedTasks);
              
              // DB Update
              await updateDoc(doc(db, "planner_tasks", taskId), { status });
          }
      }
  };

  // --- HELPERS ---
  const getPriorityColor = (p: string) => {
      if (p === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500/30';
      if (p === 'MEDIUM') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const isOverdue = (dateStr: string) => {
      if (!dateStr) return false;
      return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
  };

  // --- COMPONENTS ---
  const TaskColumn = ({ title, status, icon: Icon }: { title: string, status: PlannerTask['status'], icon: any }) => {
      const colTasks = tasks.filter(t => t.status === status);
      
      return (
          <div 
            className="flex flex-col h-full min-w-[280px] w-full md:w-[25%] bg-dark-800/30 rounded-xl border border-dark-700 flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
              <div className="p-4 border-b border-dark-700/50 flex items-center justify-between sticky top-0 bg-dark-800/90 backdrop-blur z-10 rounded-t-xl">
                  <div className="flex items-center gap-2 font-bold text-slate-300 text-sm uppercase tracking-wide">
                      <Icon size={16} /> {title}
                  </div>
                  <span className="bg-dark-900 text-slate-500 text-xs px-2 py-0.5 rounded-full font-mono">{colTasks.length}</span>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                  {colTasks.map(task => {
                      const doneSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
                      const totalSubtasks = task.subtasks?.length || 0;
                      const progress = totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 100 : 0;

                      return (
                        <div 
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => openEdit(task)}
                            className="bg-dark-800 border border-dark-600/50 p-4 rounded-lg hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer transition-all group relative animate-fadeIn"
                        >
                            {/* Priority Badge */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                    {task.priority === 'HIGH' ? 'URGENTE' : task.priority === 'MEDIUM' ? 'NORMAL' : 'BAJA'}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal size={14} className="text-slate-500" />
                                </div>
                            </div>

                            <h4 className="text-white font-medium text-sm mb-1 leading-snug">{task.title}</h4>
                            
                            {/* Preview Description */}
                            {task.description && (
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
                                    <AlignLeft size={10} />
                                    <span className="truncate">{task.description}</span>
                                </div>
                            )}

                            {/* Subtask Progress */}
                            {totalSubtasks > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                                        <CheckSquare size={10} />
                                        <span>{doneSubtasks}/{totalSubtasks}</span>
                                    </div>
                                    <div className="h-1 w-full bg-dark-900 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-dark-700/50 mt-2">
                                {/* Assignee */}
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold border border-primary/30">
                                        {task.assignee ? task.assignee.charAt(0).toUpperCase() : <User size={10}/>}
                                    </div>
                                    <span className="text-[10px] text-slate-400 truncate max-w-[60px]">{task.assignee || 'Sin asignar'}</span>
                                </div>
                                
                                {/* Date */}
                                {task.dueDate && (
                                    <div className={`flex items-center gap-1 text-[10px] ${
                                        isOverdue(task.dueDate) && status !== 'DONE' ? 'text-red-400 font-bold' : 'text-slate-500'
                                    }`}>
                                        <Calendar size={10} />
                                        {new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                    </div>
                                )}
                            </div>
                        </div>
                      );
                  })}
                  {colTasks.length === 0 && (
                      <div className="h-full flex items-center justify-center opacity-30">
                          <Plus size={24} className="text-slate-600" />
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 pb-2 shrink-0 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Planner Marketing
                    <span className="text-xs bg-dark-800 border border-dark-700 text-slate-400 px-2 py-0.5 rounded-full font-normal">Team Design & Ads</span>
                </h1>
                <p className="text-slate-400 text-sm">Gestión de tareas, creativos y pendientes del equipo.</p>
            </div>
            <button 
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-primary hover:bg-cyan-400 text-dark-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/10 transition-all"
            >
                <Plus size={18} /> Nueva Tarea
            </button>
        </div>

        {/* Kanban Board Container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 pt-4">
            <div className="flex h-full gap-6 min-w-[1000px]">
                <TaskColumn title="Pendiente" status="TODO" icon={Circle} />
                <TaskColumn title="En Curso" status="DOING" icon={Clock} />
                <TaskColumn title="Revisión" status="REVIEW" icon={AlertCircle} />
                <TaskColumn title="Completado" status="DONE" icon={CheckCircle2} />
            </div>
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                           {editingId ? <Edit3 size={20} className="text-primary"/> : <Plus size={20} className="text-primary"/>}
                           {editingId ? 'Editar Tarea' : 'Crear Tarea'}
                        </h2>
                        <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                    </div>

                    <form onSubmit={handleSaveTask} className="space-y-4">
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Título de la tarea</label>
                            <input required className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none" 
                                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Diseñar Banner Black Friday" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Prioridad</label>
                                <select 
                                    className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none"
                                    value={formData.priority}
                                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                                >
                                    <option value="LOW">Baja</option>
                                    <option value="MEDIUM">Media</option>
                                    <option value="HIGH">Alta 🔥</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Estado</label>
                                <select 
                                    className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                >
                                    <option value="TODO">Pendiente</option>
                                    <option value="DOING">En Curso</option>
                                    <option value="REVIEW">Revisión</option>
                                    <option value="DONE">Completado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Descripción</label>
                            <textarea className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none h-20 resize-none" 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detalles, requisitos o links..." />
                        </div>

                        {/* SUBTASKS SECTION */}
                        <div className="bg-dark-900/50 p-3 rounded-lg border border-dark-700">
                             <div className="flex items-center gap-2 mb-3">
                                <ListTodo size={14} className="text-primary"/>
                                <label className="text-xs uppercase text-slate-500 font-bold">Checklist / Subtareas</label>
                             </div>
                             
                             <div className="space-y-2 mb-3">
                                {subtasks.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-2 group">
                                        <button 
                                            type="button" 
                                            onClick={() => toggleSubtask(sub.id)}
                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${sub.completed ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-primary'}`}
                                        >
                                            {sub.completed && <CheckSquare size={10} className="text-white" />}
                                        </button>
                                        <span className={`text-sm flex-1 ${sub.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                            {sub.title}
                                        </span>
                                        <button type="button" onClick={() => deleteSubtask(sub.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MinusCircle size={14} />
                                        </button>
                                    </div>
                                ))}
                             </div>

                             <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-dark-800 border border-dark-600 rounded p-1.5 text-xs text-white focus:border-primary outline-none" 
                                    placeholder="Agregar paso (Enter)..." 
                                    value={newSubtaskTitle}
                                    onChange={e => setNewSubtaskTitle(e.target.value)}
                                    onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                                />
                                <button type="button" onClick={handleAddSubtask} className="bg-dark-700 hover:bg-primary hover:text-dark-900 text-slate-300 p-1.5 rounded transition-colors">
                                    <Plus size={14} />
                                </button>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Asignado a</label>
                                <input className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none" 
                                    value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})} placeholder="Nombre..." />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold block mb-1">Fecha Límite</label>
                                <input type="date" className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2.5 text-white focus:border-primary outline-none scheme-dark" 
                                    value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3 border-t border-dark-700 mt-2">
                            {editingId && (
                                <button type="button" onClick={() => { handleDeleteTask(editingId); setShowModal(false); }} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2.5 rounded-lg border border-red-500/20">
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-medium py-2.5 rounded-lg transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 bg-primary hover:bg-cyan-400 text-dark-900 font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-primary/10">
                                {editingId ? 'Guardar Cambios' : 'Crear Tarea'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default PlannerModule;
