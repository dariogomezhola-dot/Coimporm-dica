
import React from 'react';
import { LIBRARY_ASSETS } from '../constants';
import { Download, FileText, Image as ImageIcon, FileCheck } from 'lucide-react';

const LibraryModule: React.FC = () => {
  
  const getIcon = (type: string) => {
    switch(type) {
        case 'PDF': return <FileText className="text-red-400" size={32} />;
        case 'DOC': return <FileText className="text-blue-400" size={32} />;
        case 'JPG': 
        case 'PNG': return <ImageIcon className="text-accent" size={32} />;
        default: return <FileCheck className="text-slate-400" size={32} />;
    }
  };

  const categories = Array.from(new Set(LIBRARY_ASSETS.map(a => a.category)));

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar bg-dark-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Biblioteca Global</h1>
            <p className="text-slate-400">Repositorio centralizado de recursos y documentos oficiales.</p>
        </div>

        {categories.map(category => (
            <div key={category} className="mb-12">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-1 bg-primary rounded-full"></span>
                    {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {LIBRARY_ASSETS.filter(a => a.category === category).map(asset => (
                        <div key={asset.id} className="bg-dark-800 rounded-xl border border-dark-700 hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group flex flex-col h-48">
                            <div className="flex-1 flex items-center justify-center bg-dark-900/50 rounded-t-xl p-6 group-hover:bg-dark-900/80 transition-colors">
                                {getIcon(asset.type)}
                            </div>
                            <div className="p-4 border-t border-dark-700 bg-dark-800 rounded-b-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-medium text-white truncate pr-2">{asset.name}</h3>
                                    <span className="text-[10px] font-mono bg-dark-900 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                                        {asset.type}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xs text-slate-500">{asset.size}</span>
                                    <button className="text-primary hover:text-white bg-primary/10 hover:bg-primary p-1.5 rounded transition-colors">
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryModule;
