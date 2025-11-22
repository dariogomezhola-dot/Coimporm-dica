import React, { useState, useEffect, useCallback } from 'react';
import { SLIDES } from '../constants';
import { ChevronLeft, ChevronRight, Send, ArrowRight, FileText, Download, BookOpen } from 'lucide-react';
import { SlideContentData } from '../types';

const ManualModule: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slide = SLIDES[currentSlideIndex];

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }, [currentSlideIndex]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Helper to render content based on data structure
  const renderContent = (data: SlideContentData) => {
    return (
      <div className="space-y-8 animate-fadeIn pb-10">
         {/* Intro Text */}
         {data.text && (
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              {data.text}
            </p>
         )}

         {/* Cards Grid */}
         {data.cards && (
           <div className={`grid gap-6 ${data.cards.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {data.cards.map((card, idx) => (
                <div key={idx} className="bg-dark-700/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                    {card.title && (
                      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${card.titleColor || 'text-white'}`}>
                         {card.title}
                      </h4>
                    )}
                    
                    {card.type === 'list' && Array.isArray(card.content) ? (
                        <ul className="space-y-2">
                          {card.content.map((item, i) => {
                            // Check if item has a badge prefix like "A| "
                            const hasBadge = item.includes('|');
                            const badge = hasBadge ? item.split('|')[0] : null;
                            const text = hasBadge ? item.split('|')[1] : item;

                            return (
                              <li key={i} className="text-sm text-slate-400 flex items-start gap-3">
                                {card.listOrdered ? (
                                   <span className="bg-primary/10 text-primary font-mono text-xs px-2 py-0.5 rounded-full mt-0.5">{badge || i+1}</span>
                                ) : (
                                   badge ? (
                                     <span className="bg-primary/10 text-primary font-bold text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center mt-0.5">{badge}</span>
                                   ) : (
                                     <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 shrink-0"></span>
                                   )
                                )}
                                <span className="flex-1">{text}</span>
                              </li>
                            )
                          })}
                        </ul>
                    ) : (
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {card.content}
                      </p>
                    )}
                </div>
              ))}
           </div>
         )}

         {/* Quote / Footer Note */}
         {data.quote && (
           <div className="text-sm text-slate-500 italic border-l-2 border-accent pl-4 py-1">
             {data.quote}
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-dark-900 overflow-hidden">
      
      {/* Header specific for Wiki */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 text-primary mb-1">
            <BookOpen size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Wiki Interna</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 p-6 lg:p-12 pt-4 overflow-hidden">
        
        {/* Left: Text Content - Updated to handle scroll better */}
        <div className="flex flex-col h-full overflow-hidden">
           <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <div key={currentSlideIndex} className="animate-slideUp">
                  <span className="text-slate-500 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">
                    {slide.eyebrow}
                  </span>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl text-primary mb-8 font-light">
                    {slide.subtitle}
                  </h2>
                  
                  {renderContent(slide.contentData)}
              </div>
           </div>
        </div>

        {/* Right: Phone Simulator (Interactive Demo) */}
        <div className="hidden lg:flex items-center justify-center perspective-1000 h-full">
           <div className="w-[320px] h-[640px] bg-black rounded-[40px] border-[8px] border-dark-700 shadow-2xl overflow-hidden relative rotate-y-5 hover:transform-none transition-transform duration-500 ease-out group">
              
              {/* Mockup Header */}
              <div className="h-8 bg-dark-700 absolute top-0 inset-x-0 z-20 rounded-b-xl w-1/2 mx-auto"></div>

              {/* WhatsApp Interface */}
              <div className="flex flex-col h-full bg-[#0b141a] font-sans">
                 
                 {/* Chat Header */}
                 <div className="bg-[#202c33] px-4 py-3 pt-8 flex items-center gap-3 border-b border-white/5 shrink-0 z-10">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-300">
                       <img src={`https://picsum.photos/seed/${slide.chatAvatarSeed}/200`} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                       <h5 className="text-white text-sm font-medium leading-tight">{slide.chatContactName}</h5>
                       <span className="text-xs text-primary">{slide.chatContactStatus}</span>
                    </div>
                 </div>

                 {/* Chat Body */}
                 <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', opacity: 0.95}}>
                    {slide.chatScenario.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'} animate-fadeIn`} style={{animationDelay: `${idx * 0.2}s`}}>
                            <div className={`max-w-[85%] p-2 px-3 rounded-lg text-[13px] leading-snug relative shadow-sm ${
                                msg.style === 'system' ? 'bg-dark-800 text-slate-400 text-xs italic text-center w-full mx-8 my-2' :
                                msg.style === 'highlight' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
                                msg.isSender 
                                ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' 
                                : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                            }`}>
                                {msg.type === 'file' ? (
                                   <div className="flex items-center gap-3 bg-black/20 p-2 rounded mb-1">
                                      <div className="w-8 h-10 bg-red-500 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                         {msg.metadata?.fileType || 'FILE'}
                                      </div>
                                      <div className="overflow-hidden">
                                         <p className="font-medium truncate">{msg.metadata?.fileName}</p>
                                         <p className="text-[10px] opacity-70">{msg.metadata?.fileSize}</p>
                                      </div>
                                   </div>
                                ) : (
                                   <div className="whitespace-pre-line">{msg.text}</div>
                                )}
                                
                                {!msg.style && (
                                  <span className="text-[10px] text-white/50 block text-right mt-1 -mb-0.5">
                                      {msg.timestamp || '10:xx'} {msg.isSender && <span className="text-accent inline-block ml-1">✓✓</span>}
                                  </span>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>

                 {/* Chat Footer */}
                 <div className="bg-[#202c33] p-2 px-3 flex items-center gap-2 shrink-0">
                    <div className="flex-1 bg-[#2a3942] rounded-full h-9 px-4 flex items-center text-slate-400 text-xs">
                       Escribir mensaje...
                    </div>
                    <div className="w-9 h-9 bg-[#005c4b] rounded-full flex items-center justify-center text-white">
                       <Send size={16} />
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="h-16 bg-dark-800 border-t border-dark-700 flex items-center justify-between px-8 relative shrink-0 z-30">
          {/* Progress Bar (Absolute top of footer) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-dark-700">
             <div 
               className="h-full bg-primary shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-500 ease-out"
               style={{ width: `${((currentSlideIndex + 1) / SLIDES.length) * 100}%` }}
             />
          </div>

          <div className="text-sm text-slate-500 font-mono">
              Página <span className="text-white font-bold">{currentSlideIndex + 1}</span> de {SLIDES.length}
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={prevSlide}
               disabled={currentSlideIndex === 0}
               className="text-slate-400 hover:text-white disabled:opacity-50 px-4 py-2 rounded border border-dark-600 hover:bg-dark-700 transition-colors text-sm font-medium"
             >
               ← Anterior
             </button>
             <button 
               onClick={nextSlide}
               disabled={currentSlideIndex === SLIDES.length - 1}
               className="bg-primary hover:bg-cyan-400 text-dark-900 font-bold px-6 py-2 rounded transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Siguiente <ArrowRight size={16} />
             </button>
          </div>
      </div>

    </div>
  );
};

export default ManualModule;