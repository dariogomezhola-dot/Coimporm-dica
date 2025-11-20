import React, { useState, useEffect } from 'react';
import { CAMPAIGNS } from '../constants';
import { Campaign, Asset, PitchData } from '../types';
import { Edit2, FileText, Image as ImageIcon, Save, ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';

const CampaignModule: React.FC = () => {
  // State for all campaigns (simulating database)
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  
  // State for current editing
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formState, setFormState] = useState<{name: string, pitches: {[key: string]: PitchData}} | null>(null);

  const handleCreateNew = () => {
      const newCampaign: Campaign = {
          id: `c${Date.now()}`,
          name: 'Nueva Campaña Sin Título',
          status: 'Draft',
          lastUpdated: new Date().toISOString().split('T')[0],
          pitches: {
              A: { text: '', assets: [] },
              B: { text: '', assets: [] },
              C: { text: '', assets: [] },
              D: { text: '', assets: [] },
              E: { text: '', assets: [] },
          }
      };
      setEditingCampaign(newCampaign);
      setFormState({ name: newCampaign.name, pitches: newCampaign.pitches });
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    // Deep copy to avoid direct mutation during edit
    setFormState({ 
        name: campaign.name, 
        pitches: JSON.parse(JSON.stringify(campaign.pitches)) 
    });
  };

  const handleSave = () => {
    if(editingCampaign && formState) {
        const updatedCampaign = {
            ...editingCampaign,
            name: formState.name,
            pitches: formState.pitches,
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        // Check if it exists in list
        const exists = campaigns.find(c => c.id === updatedCampaign.id);
        if (exists) {
            setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
        } else {
            setCampaigns([updatedCampaign, ...campaigns]);
        }

        setEditingCampaign(null);
        setFormState(null);
    }
  };

  const handleDelete = (id: string) => {
      if (window.confirm("¿Estás seguro de borrar esta campaña?")) {
          setCampaigns(campaigns.filter(c => c.id !== id));
      }
  };

  const updatePitchText = (key: string, text: string) => {
      if (!formState) return;
      setFormState({
          ...formState,
          pitches: {
              ...formState.pitches,
              [key]: {
                  ...formState.pitches[key],
                  text
              }
          }
      });
  };

  const addMockAssetToPitch = (key: string) => {
      if (!formState) return;
      const mockAsset: Asset = {
          id: `a${Date.now()}`,
          name: `archivo_nuevo_pitch_${key}.pdf`,
          type: 'PDF',
          category: 'Campaign',
          size: '1.5 MB'
      };

      setFormState({
          ...formState,
          pitches: {
              ...formState.pitches,
              [key]: {
                  ...formState.pitches[key],
                  assets: [...formState.pitches[key].assets, mockAsset]
              }
          }
      });
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

  if (editingCampaign && formState) {
    // EDITOR VIEW
    return (
      <div className="flex flex-col h-full animate-fadeIn bg-dark-900 overflow-hidden">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700 bg-dark-800">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setEditingCampaign(null)}
                    className="p-2 hover:bg-dark-700 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <input 
                        type="text"
                        value={formState.name}
                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                        className="bg-transparent border-b border-transparent focus:border-primary focus:outline-none text-2xl font-bold text-white placeholder-slate-600"
                        placeholder="Nombre de la Campaña"
                    />
                    <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${editingCampaign.status === 'Active' ? 'bg-accent' : 'bg-yellow-500'}`}></span>
                        {editingCampaign.status} · {editingCampaign.lastUpdated}
                    </p>
                </div>
            </div>
            <button 
                onClick={handleSave}
                className="bg-primary hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-primary/20"
            >
                <Save size={18} /> Guardar Cambios
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Instructions */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-primary/80 text-sm flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full"><FileText size={16} /></div>
                    <p>Configura el mensaje y los archivos adjuntos específicos para cada tipo de Pitch. Los archivos se enviarán junto con el texto.</p>
                </div>

                {/* Pitches Loop */}
                <div className="grid gap-8">
                    {['A', 'B', 'C', 'D', 'E'].map((pitchKey) => {
                        const pitchData = formState.pitches[pitchKey];
                        return (
                            <div key={pitchKey} className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-lg group focus-within:border-primary/50 transition-colors">
                                {/* Pitch Header */}
                                <div className="bg-dark-700/50 px-6 py-3 border-b border-dark-700 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary text-dark-900 flex items-center justify-center text-xs font-bold">
                                            {pitchKey}
                                        </span>
                                        Pitch {pitchKey}
                                    </h3>
                                    <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                        {pitchKey === 'A' ? 'Educativo' : 
                                         pitchKey === 'B' ? 'Diferenciales' : 
                                         pitchKey === 'C' ? 'Confianza' : 
                                         pitchKey === 'D' ? 'Casos de Uso' : 'Urgencia'}
                                    </span>
                                </div>

                                <div className="p-6 grid lg:grid-cols-[1.5fr_1fr] gap-6">
                                    {/* Left: Text Editor */}
                                    <div>
                                        <label className="block text-xs uppercase text-slate-400 mb-2 font-medium">Guión de Texto</label>
                                        <textarea 
                                            value={pitchData.text}
                                            onChange={(e) => updatePitchText(pitchKey, e.target.value)}
                                            className="w-full h-32 bg-dark-900 border border-dark-600 rounded-lg p-3 text-slate-200 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none leading-relaxed"
                                            placeholder={`Escribe aquí el texto para el Pitch ${pitchKey}...`}
                                        />
                                    </div>

                                    {/* Right: Assets Manager */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs uppercase text-slate-400 font-medium">Archivos Adjuntos ({pitchData.assets.length})</label>
                                            <button 
                                                onClick={() => addMockAssetToPitch(pitchKey)}
                                                className="text-[10px] bg-dark-700 hover:bg-dark-600 text-primary px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                            >
                                                <Plus size={12} /> Agregar
                                            </button>
                                        </div>
                                        
                                        <div className="bg-dark-900 border border-dark-600 rounded-lg p-2 min-h-[128px] flex flex-col gap-2">
                                            {pitchData.assets.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 opacity-60">
                                                    <Paperclip size={20} />
                                                    <span className="text-xs">Sin archivos</span>
                                                </div>
                                            ) : (
                                                pitchData.assets.map((asset) => (
                                                    <div key={asset.id} className="bg-dark-800 p-2 rounded flex items-center gap-3 border border-dark-700 relative group/asset">
                                                        <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-slate-300 shrink-0">
                                                            {asset.type === 'PDF' ? <FileText size={14} /> : <ImageIcon size={14} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-slate-200 truncate font-medium">{asset.name}</p>
                                                            <p className="text-[10px] text-slate-500">{asset.size}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeAssetFromPitch(pitchKey, asset.id)}
                                                            className="text-slate-500 hover:text-red-400 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Campañas</h1>
            <p className="text-slate-400">Administra y optimiza tus estrategias comerciales activas.</p>
        </div>
        <button 
            onClick={handleCreateNew}
            className="bg-primary hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary/10"
        >
            <Plus size={18} /> Nueva Campaña
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-xl">
        {campaigns.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
                <p>No hay campañas creadas.</p>
            </div>
        ) : (
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-dark-900/50 border-b border-dark-700">
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actualización</th>
                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                    {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-dark-700/30 transition-colors group">
                            <td className="p-4">
                                <div className="font-medium text-white">{campaign.name}</div>
                                <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                    <span className="bg-dark-900 px-2 py-0.5 rounded border border-dark-600">5 Pitches</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    campaign.status === 'Active' 
                                    ? 'bg-accent/10 text-accent border border-accent/20' 
                                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                                }`}>
                                    {campaign.status}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-slate-400">
                                {campaign.lastUpdated}
                            </td>
                            <td className="p-4 text-right flex items-center justify-end gap-2">
                                <button 
                                    onClick={() => handleEdit(campaign)}
                                    className="text-slate-400 hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-all"
                                    title="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(campaign.id)}
                                    className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                                    title="Eliminar"
                                >
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
  );
};

export default CampaignModule;