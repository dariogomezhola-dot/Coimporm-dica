
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Campaign, Asset, PitchData } from '../types';
import { Edit2, FileText, Image as ImageIcon, Save, ArrowLeft, Plus, Trash2, Paperclip, Loader2, UploadCloud, CheckCircle, AlertCircle, X, Eye, Download, Globe, ShieldAlert, PenLine } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CampaignModule: React.FC = () => {
  // --- STATES ---
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  
  // Modes: LIST | EDIT | VIEW
  const [viewMode, setViewMode] = useState<'LIST' | 'EDIT' | 'VIEW'>('LIST');
  
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [formState, setFormState] = useState<{name: string, status: 'Active'|'Draft'|'Paused', pitches: {[key: string]: PitchData}} | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // --- REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadPitchRef = useRef<string | null>(null); 

  // --- HELPERS ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000); 
  };

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const q = query(collection(db, "campaigns"), orderBy("lastUpdated", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const campaignsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(campaignsData);
      setIsLoading(false);
      setPermissionError(false);
    }, (error) => {
        console.error("Error fetching campaigns:", error);
        setIsLoading(false);
        if (error.code === 'permission-denied') {
            setPermissionError(true);
        }
    });
    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---

  const handleCreateNew = () => {
      const newCampaignData = {
          name: 'Nueva Campaña',
          status: 'Draft' as const,
          lastUpdated: new Date().toISOString().split('T')[0],
          pitches: {
              A: { title: 'Educativo', text: '', assets: [], observations: '' },
              B: { title: 'Diferenciales', text: '', assets: [], observations: '' },
              C: { title: 'Confianza', text: '', assets: [], observations: '' },
              D: { title: 'Casos de Uso', text: '', assets: [], observations: '' },
              E: { title: 'Urgencia', text: '', assets: [], observations: '' },
          }
      };
      const tempCampaign = { ...newCampaignData, id: 'new' } as Campaign;
      setActiveCampaign(tempCampaign);
      setFormState({ 
          name: newCampaignData.name, 
          status: newCampaignData.status,
          pitches: newCampaignData.pitches 
      });
      setViewMode('EDIT');
  };

  const handleEdit = (campaign: Campaign) => {
    setActiveCampaign(campaign);
    
    // Ensure titles exist for older campaigns
    const pitches = JSON.parse(JSON.stringify(campaign.pitches));
    const defaults: any = { A: 'Educativo', B: 'Diferenciales', C: 'Confianza', D: 'Casos de Uso', E: 'Urgencia' };
    
    Object.keys(pitches).forEach(key => {
        if (!pitches[key].title) pitches[key].title = defaults[key] || `Pitch ${key}`;
    });

    setFormState({ 
        name: campaign.name, 
        status: campaign.status,
        pitches: pitches 
    });
    setViewMode('EDIT');
  };

  const handleView = (campaign: Campaign) => {
      setActiveCampaign(campaign);
      setViewMode('VIEW');
  };

  const handleBackToList = () => {
      setViewMode('LIST');
      setActiveCampaign(null);
      setFormState(null);
  };

  const handleSave = async () => {
    if(activeCampaign && formState) {
        setIsSaving(true);
        
        const updatedData = {
            name: formState.name,
            pitches: formState.pitches,
            status: formState.status,
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        try {
            if (activeCampaign.id === 'new') {
                await addDoc(collection(db, "campaigns"), updatedData);
                showToast("¡Campaña creada con éxito!", "success");
            } else {
                const campaignRef = doc(db, "campaigns", activeCampaign.id);
                await updateDoc(campaignRef, updatedData);
                showToast("¡Cambios guardados correctamente!", "success");
            }
            handleBackToList();
        } catch (error: any) {
            console.error("Error saving campaign: ", error);
            if (error.code === 'permission-denied') {
                showToast("Permiso Denegado: Revisa reglas en Firebase Console", "error");
                setPermissionError(true);
            } else {
                showToast(`Error al guardar: ${error.message}`, "error");
            }
        } finally {
            setIsSaving(false);
        }
    }
  };

  const handleDelete = async (id: string) => {
      if (window.confirm("¿Estás seguro de borrar esta campaña de la base de datos?")) {
          try {
              await deleteDoc(doc(db, "campaigns", id));
              showToast("Campaña eliminada");
          } catch (error: any) {
              showToast("Error al eliminar", "error");
          }
      }
  };

  const updatePitchObservations = (key: string, obs: string) => {
      if (!formState) return;
      setFormState(prev => prev ? ({
          ...prev,
          pitches: {
              ...prev.pitches,
              [key]: {
                  ...prev.pitches[key],
                  observations: obs
              }
          }
      }) : null);
  };

  const updatePitchTitle = (key: string, title: string) => {
      if (!formState) return;
      setFormState(prev => prev ? ({
          ...prev,
          pitches: {
              ...prev.pitches,
              [key]: {
                  ...prev.pitches[key],
                  title: title
              }
          }
      }) : null);
  };

  const updateAssetDescription = (pitchKey: string, assetId: string, description: string) => {
      if (!formState) return;
      setFormState(prev => {
          if (!prev) return null;
          return {
              ...prev,
              pitches: {
                  ...prev.pitches,
                  [pitchKey]: {
                      ...prev.pitches[pitchKey],
                      assets: prev.pitches[pitchKey].assets.map(a => 
                          a.id === assetId ? { ...a, description } : a
                      )
                  }
              }
          }
      });
  };

  // --- FILE UPLOAD LOGIC ---

  const triggerFileUpload = (pitchKey: string) => {
      activeUploadPitchRef.current = pitchKey;
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset input
          fileInputRef.current.click();
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      
      if (!file) return;

      // Limit file size to 10MB to prevent browser hanging on large uploads
      if (file.size > 10 * 1024 * 1024) {
          showToast("El archivo es demasiado grande (Máx 10MB)", "error");
          return;
      }

      const currentPitch = activeUploadPitchRef.current;
      if (!currentPitch || !formState) return;

      setIsUploading(true);
      showToast(`Subiendo ${file.name}...`, "success");
      
      try {
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, `assets/${fileName}`);
          
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);

          const newAsset: Asset = {
              id: `a${Date.now()}`,
              name: file.name,
              description: '', // Init description
              type: 'FILE',
              category: 'Campaign',
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              url: url
          };

          setFormState(prev => {
              if(!prev) return null;
              return {
                ...prev,
                pitches: {
                    ...prev.pitches,
                    [currentPitch]: {
                        ...prev.pitches[currentPitch],
                        assets: [...prev.pitches[currentPitch].assets, newAsset]
                    }
                }
              }
          });
          showToast("Archivo subido exitosamente", "success");

      } catch (error: any) {
          console.error("Upload error:", error);
          showToast(`Error subida: ${error.message}`, "error");
      } finally {
          setIsUploading(false);
          activeUploadPitchRef.current = null;
      }
  };

  const removeAssetFromPitch = (pitchKey: string, assetId: string) => {
      if (!formState) return;
      setFormState({
          ...formState,
          pitches: {
              ...formState.pitches,
              [pitchKey]: {
                  ...formState.pitches[pitchKey],
                  assets: formState.pitches[pitchKey].assets.filter(a => a.id !== assetId)
              }
          }
      });
  };

  // --- PORTAL TOAST ---
  const ToastPortal = () => {
      if (!toast) return null;
      return createPortal(
        <div className="fixed bottom-6 right-6 z-[99999] animate-slideUp pointer-events-none">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl min-w-[320px] pointer-events-auto ${
                toast.type === 'success' 
                ? 'bg-dark-800/95 border-accent text-white shadow-accent/10' 
                : 'bg-dark-800/95 border-red-500 text-white shadow-red-500/10'
            }`}>
                <div className={`p-2 rounded-full shrink-0 ${
                    toast.type === 'success' ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm">{toast.type === 'success' ? 'Operación Exitosa' : 'Error'}</p>
                    <p className="text-sm opacity-90">{toast.message}</p>
                </div>
                <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white"><X size={16}/></button>
            </div>
        </div>,
        document.body
      );
  };

  const getFileIcon = (name: string) => {
      const ext = name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return <FileText size={14} className="text-red-400" />;
      if (['jpg', 'png', 'jpeg', 'gif'].includes(ext || '')) return <ImageIcon size={14} className="text-blue-400" />;
      return <Paperclip size={14} className="text-slate-400" />;
  };

  return (
    <div className="h-full relative bg-dark-900 flex flex-col">
        
        <input 
            type="file" 
            ref={fileInputRef} 
            style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px' }} 
            onChange={handleFileChange} 
        />
        <ToastPortal />

        {permissionError && (
            <div className="bg-red-500 text-white p-3 text-center text-sm font-bold flex items-center justify-center gap-2 animate-fadeIn shadow-lg z-50">
                <ShieldAlert size={20} />
                ¡ALERTA! La base de datos está bloqueada. Ve a Firebase Console → Firestore Database → Rules y cambia "false" por "true".
            </div>
        )}

        {/* --- HEADER --- */}
        <div className="shrink-0 p-6 md:p-8 pb-0 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    Gestión de Campañas
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        permissionError 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                        <Globe size={10} /> {permissionError ? 'ACCESO DENEGADO' : 'CONECTADO'}
                    </span>
                </h1>
                <p className="text-slate-400">Administra tus estrategias comerciales.</p>
            </div>
            {viewMode === 'LIST' && (
                <button onClick={handleCreateNew} className="bg-primary hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary/10">
                    <Plus size={18} /> Nueva Campaña
                </button>
            )}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 overflow-hidden p-6 md:p-8 pt-6">
            
            {/* VIEW: LIST */}
            {viewMode === 'LIST' && (
                <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-xl flex flex-col h-full max-h-[70vh]">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {isLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-slate-500 h-full">
                                <Loader2 className="animate-spin mb-3 text-primary" size={32} />
                                <p>Sincronizando con Firebase...</p>
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 h-full flex flex-col items-center justify-center">
                                <p>No hay campañas registradas en la base de datos.</p>
                                <button onClick={handleCreateNew} className="mt-4 text-primary hover:underline text-sm">Crear la primera</button>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-dark-800 z-10 shadow-sm">
                                    <tr className="border-b border-dark-700">
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-700">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id} onClick={() => handleView(campaign)} className="hover:bg-dark-700/30 transition-colors cursor-pointer group">
                                            <td className="p-4 font-medium text-white">{campaign.name}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    campaign.status === 'Active' ? 'bg-accent/10 text-accent border border-accent/20' : 
                                                    campaign.status === 'Paused' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                                                    'bg-slate-700 text-slate-300 border border-slate-600'
                                                }`}>{campaign.status}</span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">{campaign.lastUpdated}</td>
                                            <td className="p-4 text-right flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleView(campaign)} className="text-slate-400 hover:text-accent p-2" title="Ver">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => handleEdit(campaign)} className="text-slate-400 hover:text-primary p-2" title="Editar">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(campaign.id)} className="text-slate-400 hover:text-red-400 p-2" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW: EDIT */}
            {viewMode === 'EDIT' && formState && (
                <div className="flex flex-col h-full bg-dark-800 rounded-xl border border-dark-700 overflow-hidden animate-fadeIn">
                    <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-900/30">
                        <div className="flex items-center gap-4">
                            <button onClick={handleBackToList} className="p-2 hover:bg-dark-700 rounded-full text-slate-400 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <input 
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                                    className="bg-transparent border-b border-transparent focus:border-primary focus:outline-none text-xl font-bold text-white w-full"
                                    placeholder="Nombre de la Campaña"
                                />
                                <button 
                                    onClick={() => setFormState(prev => prev ? ({...prev, status: prev.status === 'Active' ? 'Paused' : 'Active'}) : null)}
                                    className="text-xs mt-1 flex items-center gap-1 text-slate-400 hover:text-white"
                                >
                                    <span className={`w-2 h-2 rounded-full ${formState.status === 'Active' ? 'bg-accent' : 'bg-yellow-500'}`}></span>
                                    {formState.status} (Click para cambiar)
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving || isUploading}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                                isSaving ? 'bg-slate-700 text-slate-400' : 'bg-primary text-dark-900 hover:bg-cyan-400'
                            }`}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                         <div className="space-y-8 max-w-4xl mx-auto pb-20">
                            {['A', 'B', 'C', 'D', 'E'].map((pitchKey) => (
                                <div key={pitchKey} className="bg-dark-900/50 rounded-xl border border-dark-700 p-6">
                                    <div className="flex justify-between items-center mb-4 border-b border-dark-700 pb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-primary text-dark-900 flex items-center justify-center text-xs font-bold">{pitchKey}</span>
                                            
                                            {/* EDITABLE TITLE */}
                                            <div className="flex items-center gap-2 group/edit">
                                                <input 
                                                    type="text"
                                                    value={formState.pitches[pitchKey].title || `Pitch ${pitchKey}`}
                                                    onChange={(e) => updatePitchTitle(pitchKey, e.target.value)}
                                                    className="bg-transparent text-white font-bold border-b border-transparent hover:border-dark-600 focus:border-primary outline-none transition-all"
                                                />
                                                <PenLine size={12} className="text-slate-500 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid lg:grid-cols-2 gap-6">
                                        <textarea 
                                            value={formState.pitches[pitchKey].text}
                                            onChange={(e) => setFormState(prev => prev ? ({...prev, pitches: {...prev.pitches, [pitchKey]: {...prev.pitches[pitchKey], text: e.target.value}}}) : null)}
                                            className="w-full h-32 bg-dark-800 border border-dark-600 rounded-lg p-3 text-slate-200 text-sm focus:border-primary outline-none resize-none"
                                            placeholder="Escribe el guión..."
                                        />
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-slate-500 uppercase font-bold">Archivos & Observaciones</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => triggerFileUpload(pitchKey)}
                                                    disabled={isUploading}
                                                    className="text-xs bg-dark-700 hover:bg-dark-600 text-primary px-2 py-1 rounded flex items-center gap-1"
                                                >
                                                    {isUploading && activeUploadPitchRef.current === pitchKey ? <Loader2 className="animate-spin" size={12} /> : <UploadCloud size={12} />} Subir
                                                </button>
                                            </div>

                                            {/* Technical Observations Area */}
                                            <div className="mb-3">
                                                <textarea 
                                                    placeholder="Observaciones técnicas de los archivos (ej: 'Se necesita video en formato 9:16')..." 
                                                    value={formState.pitches[pitchKey].observations || ''}
                                                    onChange={(e) => updatePitchObservations(pitchKey, e.target.value)}
                                                    className="w-full h-16 bg-dark-900 text-xs text-slate-300 p-2 rounded border border-dark-600 focus:border-primary outline-none resize-none mb-2"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                {formState.pitches[pitchKey].assets.map(asset => (
                                                    <div key={asset.id} className="flex flex-col bg-dark-800 p-2 rounded border border-dark-700">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-dark-700 rounded flex items-center justify-center">{getFileIcon(asset.name)}</div>
                                                            <span className="text-xs text-slate-300 truncate flex-1 font-medium">{asset.name}</span>
                                                            <button onClick={() => removeAssetFromPitch(pitchKey, asset.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                                                        </div>
                                                        <input 
                                                          type="text" 
                                                          placeholder="Añadir descripción del archivo..." 
                                                          value={asset.description || ''}
                                                          onChange={(e) => updateAssetDescription(pitchKey, asset.id, e.target.value)}
                                                          className="mt-2 w-full bg-dark-900 text-[10px] text-slate-400 p-1.5 rounded border border-dark-700 focus:border-primary outline-none"
                                                        />
                                                    </div>
                                                ))}
                                                {formState.pitches[pitchKey].assets.length === 0 && <div className="text-xs text-slate-600 italic text-center py-2">Sin archivos adjuntos.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}

            {/* VIEW: READ ONLY */}
            {viewMode === 'VIEW' && activeCampaign && (
                <div className="flex flex-col h-full bg-dark-800 rounded-xl border border-dark-700 overflow-hidden animate-fadeIn">
                    <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-900/30">
                        <div className="flex items-center gap-4">
                             <button onClick={handleBackToList} className="p-2 hover:bg-dark-700 rounded-full text-slate-400 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-white">{activeCampaign.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        activeCampaign.status === 'Active' ? 'bg-accent/20 text-accent' : 'bg-slate-700 text-slate-400'
                                    }`}>{activeCampaign.status}</span>
                                    <span className="text-xs text-slate-500">Actualizado: {activeCampaign.lastUpdated}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleEdit(activeCampaign)} className="text-sm bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded flex items-center gap-2">
                            <Edit2 size={16} /> Editar
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="space-y-6 max-w-4xl mx-auto pb-20">
                            {['A', 'B', 'C', 'D', 'E'].map((pitchKey) => {
                                const pitch = activeCampaign.pitches[pitchKey];
                                return (
                                    <div key={pitchKey} className="bg-dark-900/50 rounded-xl border border-dark-700 p-5">
                                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-dark-700 border border-slate-600 flex items-center justify-center text-xs">{pitchKey}</span>
                                            {pitch.title || `Pitch ${pitchKey}`}
                                        </h3>
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-dark-900 p-3 rounded border border-dark-800 mb-4">
                                            {pitch.text || <span className="italic text-slate-600">Sin guión definido.</span>}
                                        </p>

                                        {pitch.observations && (
                                            <div className="bg-yellow-500/5 border border-yellow-500/20 p-2 rounded mb-3">
                                                <p className="text-xs text-yellow-500 font-bold uppercase mb-1">Observaciones Técnicas:</p>
                                                <p className="text-xs text-slate-400">{pitch.observations}</p>
                                            </div>
                                        )}

                                        {pitch.assets.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                {pitch.assets.map(asset => (
                                                    <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 px-3 py-2 rounded text-xs text-slate-300 transition-colors group">
                                                        <div className="shrink-0">{getFileIcon(asset.name)}</div>
                                                        <div className="flex-1">
                                                            <span className="group-hover:text-white font-medium block">{asset.name}</span>
                                                            {asset.description && <span className="text-[10px] text-slate-500 block">{asset.description}</span>}
                                                        </div>
                                                        <Download size={12} className="opacity-50" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default CampaignModule;