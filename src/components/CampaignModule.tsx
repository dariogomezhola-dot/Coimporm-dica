
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Campaign, Asset, PitchData } from '../types';
import { Edit2, FileText, Image as ImageIcon, Save, ArrowLeft, Plus, Trash2, Paperclip, Loader2, UploadCloud, CheckCircle, AlertCircle, X, Eye, Download, Globe, Terminal, ShieldAlert } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CampaignModule: React.FC = () => {
  // --- STATES ---
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]); // Debug logs visible to user
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
  const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [`[${time}] ${msg}`, ...prev]);
      console.log(`[System] ${msg}`);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      addLog(`${type.toUpperCase()}: ${message}`);
      setTimeout(() => setToast(null), 4000); 
  };

  // --- FIREBASE SYNC ---
  useEffect(() => {
    addLog("Iniciando conexión a Firestore...");
    const q = query(collection(db, "campaigns"), orderBy("lastUpdated", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const campaignsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(campaignsData);
      setIsLoading(false);
      setPermissionError(false);
      addLog(`Datos sincronizados: ${campaignsData.length} campañas encontradas.`);
    }, (error) => {
        console.error("Error fetching campaigns:", error);
        setIsLoading(false);
        if (error.code === 'permission-denied') {
            setPermissionError(true);
            addLog("BLOQUEO: Permisos insuficientes. Revisa las reglas de Firestore Console.");
        } else {
            addLog(`ERROR CRÍTICO: ${error.message}`);
        }
    });
    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---

  const handleCreateNew = () => {
      addLog("Iniciando creación de campaña...");
      const newCampaignData = {
          name: 'Nueva Campaña',
          status: 'Draft' as const,
          lastUpdated: new Date().toISOString().split('T')[0],
          pitches: {
              A: { text: '', assets: [] },
              B: { text: '', assets: [] },
              C: { text: '', assets: [] },
              D: { text: '', assets: [] },
              E: { text: '', assets: [] },
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
    addLog(`Editando campaña: ${campaign.name}`);
    setActiveCampaign(campaign);
    setFormState({ 
        name: campaign.name, 
        status: campaign.status,
        pitches: JSON.parse(JSON.stringify(campaign.pitches)) 
    });
    setViewMode('EDIT');
  };

  const handleView = (campaign: Campaign) => {
      addLog(`Visualizando campaña: ${campaign.name}`);
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
        addLog("Intentando guardar en Firestore...");
        
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
            addLog(`FALLO GUARDADO: ${error.code} - ${error.message}`);
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
              addLog(`Error delete: ${error.message}`);
          }
      }
  };

  // --- FILE UPLOAD LOGIC ---

  const triggerFileUpload = (pitchKey: string) => {
      addLog(`Abriendo selector de archivos para Pitch ${pitchKey}...`);
      activeUploadPitchRef.current = pitchKey;
      
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset
          fileInputRef.current.click();
      } else {
          addLog("ERROR: Referencia de input no encontrada.");
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      
      if (!file) {
          addLog("Selección de archivo cancelada por el usuario.");
          return;
      }

      const currentPitch = activeUploadPitchRef.current;
      if (!currentPitch || !formState) return;

      setIsUploading(true);
      showToast(`Subiendo ${file.name}...`, "success");
      addLog(`Iniciando subida a Storage: ${file.name} (${file.size} bytes)`);
      
      try {
          // 1. Upload to Firebase Storage
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, `assets/${fileName}`);
          
          addLog(`Destino: assets/${fileName}`);
          const snapshot = await uploadBytes(storageRef, file);
          addLog("Subida completada. Obteniendo URL...");
          
          const url = await getDownloadURL(snapshot.ref);
          addLog(`URL obtenida: ${url.substring(0, 30)}...`);

          // 2. Create Asset Object
          const newAsset: Asset = {
              id: `a${Date.now()}`,
              name: file.name,
              type: 'FILE',
              category: 'Campaign',
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              url: url
          };

          // 3. Update Local Form State
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
          if (error.code === 'storage/unauthorized') {
             showToast("Error Permisos Storage: Revisa reglas en Firebase Console", "error");
             setPermissionError(true);
          } else {
             showToast(`Error subida: ${error.message}`, "error");
          }
          addLog(`ERROR SUBIDA: ${error.message}`);
      } finally {
          setIsUploading(false);
          activeUploadPitchRef.current = null;
      }
  };

  const removeAssetFromPitch = (pitchKey: string, assetId: string) => {
      if (!formState) return;
      addLog(`Removiendo asset ${assetId} localmente`);
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
        
        {/* --- DEBUG & UTILS --- */}
        <input 
            type="file" 
            ref={fileInputRef} 
            style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px' }} 
            onChange={handleFileChange} 
        />
        <ToastPortal />

        {/* --- PERMISSION ERROR BANNER --- */}
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
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary text-dark-900 flex items-center justify-center text-xs">{pitchKey}</span>
                                            Pitch {pitchKey}
                                        </h3>
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
                                                <span className="text-xs text-slate-500 uppercase font-bold">Archivos</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => triggerFileUpload(pitchKey)}
                                                    disabled={isUploading}
                                                    className="text-xs bg-dark-700 hover:bg-dark-600 text-primary px-2 py-1 rounded flex items-center gap-1"
                                                >
                                                    {isUploading && activeUploadPitchRef.current === pitchKey ? <Loader2 className="animate-spin" size={12} /> : <UploadCloud size={12} />} Subir
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formState.pitches[pitchKey].assets.map(asset => (
                                                    <div key={asset.id} className="flex items-center gap-2 bg-dark-800 p-2 rounded border border-dark-700">
                                                        <div className="w-6 h-6 bg-dark-700 rounded flex items-center justify-center">{getFileIcon(asset.name)}</div>
                                                        <span className="text-xs text-slate-300 truncate flex-1">{asset.name}</span>
                                                        <button onClick={() => removeAssetFromPitch(pitchKey, asset.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                                                    </div>
                                                ))}
                                                {formState.pitches[pitchKey].assets.length === 0 && <div className="text-xs text-slate-600 italic text-center py-2">Sin archivos</div>}
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
                                            Pitch {pitchKey}
                                        </h3>
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-dark-900 p-3 rounded border border-dark-800 mb-4">
                                            {pitch.text || <span className="italic text-slate-600">Sin guión definido.</span>}
                                        </p>
                                        {pitch.assets.length > 0 && (
                                            <div className="flex flex-wrap gap-3">
                                                {pitch.assets.map(asset => (
                                                    <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 px-3 py-2 rounded text-xs text-slate-300 transition-colors group">
                                                        {getFileIcon(asset.name)}
                                                        <span className="group-hover:text-white">{asset.name}</span>
                                                        <Download size={12} className="ml-1 opacity-50" />
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

        {/* --- DEBUG CONSOLE (BOTTOM) --- */}
        <div className="shrink-0 bg-black/50 border-t border-dark-700 p-2 max-h-32 overflow-y-auto text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-2 mb-1 text-slate-400 font-bold uppercase"><Terminal size={10}/> Consola de Sistema</div>
            {logs.length === 0 && <div className="opacity-50">Esperando eventos...</div>}
            {logs.map((log, i) => (
                <div key={i} className={`${log.includes('ERROR') || log.includes('FALLO') || log.includes('BLOQUEO') ? 'text-red-400' : log.includes('success') ? 'text-green-400' : ''}`}>
                    {log}
                </div>
            ))}
        </div>
    </div>
  );
};

export default CampaignModule;
