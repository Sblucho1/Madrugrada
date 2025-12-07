import React, { useState } from 'react';
import { Download, FileText, ArrowLeft, RotateCw, Share2, Check } from 'lucide-react';

interface HistoryScreenProps {
  onBack: () => void;
  content: string;
  onChange: (text: string) => void;
  onExport: () => void;
  onRegenerate: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
    onBack, 
    content, 
    onChange, 
    onExport, 
    onRegenerate, 
}) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleShare = async () => {
    // 1. Try Native Share (Mobile: WhatsApp, Mail, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Historia Clínica - GuardiaAI',
          text: content,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // 2. Fallback for Desktop: Copy to Clipboard
      try {
        await navigator.clipboard.writeText(content);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 3000);
      } catch (err) {
        alert("No se pudo compartir automáticamente. Por favor selecciona el texto y cópialo manualmente.");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)] animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-200 hover:text-white flex items-center gap-2 group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Volver</span>
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <div className="flex items-center gap-3">
                <div className="bg-slate-700 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold">Historia Clínica</h2>
            </div>
         </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-slate-50 p-6 overflow-hidden flex flex-col relative">
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-1">
              <textarea 
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-full p-6 outline-none text-slate-800 font-mono text-sm leading-relaxed resize-none border-none focus:ring-0"
                  placeholder="Generando historia clínica..."
              />
          </div>
          
          {/* Copy Feedback Toast */}
          {showCopyFeedback && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in duration-200">
                <Check className="w-4 h-4 text-emerald-400" />
                Copiado. Pega en WhatsApp o Email.
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
           <button
              onClick={onRegenerate}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 transition shadow-sm order-3 sm:order-1"
              title="Volver a generar con IA (Sobrescribe cambios)"
           >
              <RotateCw className="w-4 h-4" />
              <span className="sm:hidden">Regenerar</span>
           </button>

           <div className="h-auto w-px bg-slate-300 mx-2 hidden sm:block order-2"></div>

           <button
              onClick={handleShare}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition shadow-sm order-1 sm:order-3"
           >
              {showCopyFeedback ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {showCopyFeedback ? 'Copiado' : 'Compartir'}
           </button>

           <button
              onClick={onExport}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition shadow-sm order-2 sm:order-4"
           >
              <Download className="w-4 h-4" />
              Guardar .txt
           </button>
      </div>
    </div>
  );
};