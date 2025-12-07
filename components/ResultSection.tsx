import React, { useState, useEffect } from 'react';
import { ClinicalAnalysis } from '../types';
import { AlertTriangle, CheckCircle, List, Activity, AlertOctagon, Stethoscope, FileText, Download, ArrowLeft, MessageSquare } from 'lucide-react';

interface ResultSectionProps {
  analysis: ClinicalAnalysis | null;
  isLoading: boolean;
  error: string | null;
  clinicalHistory: string;
  onHistoryChange: (text: string) => void;
  onExportHistory: () => void;
  onBack: () => void;
  onStartChat: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ 
  analysis, 
  isLoading, 
  error, 
  clinicalHistory, 
  onHistoryChange, 
  onExportHistory,
  onBack,
  onStartChat
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'history'>('analysis');

  // If generated history arrives, switch to it ONLY if analysis is missing (e.g. user clicked Generate History directly)
  useEffect(() => {
    if (clinicalHistory && !analysis && !isLoading) {
        setActiveTab('history');
    }
  }, [clinicalHistory, analysis, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-8rem)] p-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <div className="animate-pulse flex flex-col items-center space-y-4 max-w-md w-full">
          <Activity className="w-12 h-12 text-indigo-500 animate-bounce" />
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-32 bg-slate-100 rounded w-full mt-8"></div>
        </div>
        <p className="text-slate-600 mt-8 font-medium text-lg">Analizando signos y síntomas...</p>
        <p className="text-slate-400 text-sm">Generando manejo sindrómico y diagnósticos diferenciales</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 h-[calc(100vh-8rem)] p-8 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h3 className="text-xl font-bold text-red-700">Error en el Análisis</h3>
        <p className="text-slate-600 mt-2 max-w-md">{error}</p>
        <button 
            onClick={onBack}
            className="mt-8 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
        >
            Volver a intentar
        </button>
      </div>
    );
  }

  const getTriageColor = (level: string) => {
    if (!level) return 'bg-slate-100 text-slate-800';
    if (level.includes('Rojo') || level.includes('Emergencia')) return 'bg-red-100 text-red-800 border-red-200';
    if (level.includes('Naranja')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (level.includes('Amarillo')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)] animate-in slide-in-from-right duration-300">
       {/* Header with Tabs */}
       <div className="bg-slate-50 border-b border-slate-200">
         <div className="p-4 flex justify-between items-center pb-2">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 border border-transparent hover:border-slate-200 hover:shadow-sm"
                title="Volver a la carga de datos"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-slate-800 text-lg">Resultado Clínico</h2>
            </div>
            {analysis && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTriageColor(analysis.triageLevel)} uppercase tracking-wide`}>
                Triage: {analysis.triageLevel}
              </span>
            )}
         </div>
         
         <div className="flex px-4 gap-6 border-t border-slate-200 bg-white">
           <button 
                onClick={() => setActiveTab('analysis')}
                className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Activity className="w-4 h-4" />
                Análisis Sindrómico
            </button>
           
           <button 
             onClick={() => setActiveTab('history')}
             className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
             <FileText className="w-4 h-4" />
             Historia Clínica
           </button>
         </div>
       </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 relative">
        {activeTab === 'analysis' && analysis ? (
          /* ANALYSIS VIEW */
          <div className="p-6 space-y-6 max-w-5xl mx-auto">
            
            {/* Main Syndrome Card */}
            <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <label className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1 block">Impresión Diagnóstica Principal</label>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">{analysis.syndromeName}</h1>
              <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                {analysis.reasoning}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Immediate Management */}
              <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                  <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-emerald-900">Conducta Inmediata</h3>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3">
                        {analysis.immediateManagement.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span> 
                            <span>{item}</span>
                        </li>
                        ))}
                    </ul>
                  </div>
              </div>

              {/* Red Flags */}
              <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                  <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-900">Red Flags / Alarma</h3>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3">
                        {analysis.redFlags.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span> 
                            <span>{item}</span>
                        </li>
                        ))}
                    </ul>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Differential Diagnosis */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-400" /> Diagnósticos Diferenciales
                </h4>
                <ul className="space-y-2">
                  {analysis.differentialDiagnoses.map((dx, i) => (
                    <li key={i} className="text-sm text-slate-600 pl-4 border-l-2 border-slate-200 py-0.5">{dx}</li>
                  ))}
                </ul>
              </div>
              
              {/* Exams */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-400" /> Exámenes Sugeridos
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendedExams.map((exam, i) => (
                    <li key={i} className="text-sm text-slate-600 pl-4 border-l-2 border-slate-200 py-0.5">{exam}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Chat CTA */}
            <div className="flex justify-center pt-4 pb-8">
               <button 
                 onClick={onStartChat}
                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 font-bold transition-transform active:scale-95"
               >
                 <MessageSquare className="w-5 h-5" />
                 Hacer preguntas al Asistente (Chat)
               </button>
            </div>
          </div>
        ) : activeTab === 'analysis' ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p>No hay análisis disponible.</p>
           </div>
        ) : null}

        {activeTab === 'history' && (
           /* HISTORY EDITOR VIEW */
           <div className="flex flex-col h-full bg-slate-50">
             <div className="flex-1 p-6 overflow-y-auto">
               <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-3xl mx-auto min-h-[500px]">
                 {clinicalHistory ? (
                   <textarea 
                     value={clinicalHistory}
                     onChange={(e) => onHistoryChange(e.target.value)}
                     className="w-full h-full min-h-[500px] outline-none text-slate-800 font-mono text-sm leading-relaxed resize-none border-none p-0 focus:ring-0"
                     placeholder="La historia clínica generada aparecerá aquí para ser editada..."
                   />
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 pt-10">
                        <FileText className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-medium">Aún no se ha generado la historia clínica.</p>
                        <p className="text-xs max-w-xs text-center">Puedes generarla automáticamente desde la pantalla anterior o esperar a completar más datos.</p>
                    </div>
                 )}
               </div>
             </div>
             
             {clinicalHistory && (
               <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2">
                 <button
                    onClick={onExportHistory}
                    className="py-2.5 px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition"
                 >
                    <Download className="w-4 h-4" />
                    Exportar TXT
                 </button>
               </div>
             )}
           </div>
        )}

      </div>
    </div>
  );
};