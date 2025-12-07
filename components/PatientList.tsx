import React from 'react';
import { PatientData } from '../types';
import { Clock, FileText, ArrowRight, User, Trash2, Eye, Share2, Stethoscope } from 'lucide-react';

interface PatientListProps {
  patients: PatientData[];
  type: 'seen' | 'pending';
  onSelect: (patient: PatientData) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, type, onSelect, onBack, onDelete }) => {
  const title = type === 'pending' ? 'Pacientes Pendientes' : 'Biblioteca de Historias Clínicas';
  const Icon = type === 'pending' ? Clock : FileText;
  const colorClass = type === 'pending' ? 'text-orange-600' : 'text-emerald-600';
  const bgClass = type === 'pending' ? 'bg-orange-50' : 'bg-emerald-50';

  const getAgeStyle = (gender: string) => {
    const g = gender?.toLowerCase().trim();
    if (g === 'masculino' || g === 'm' || g === 'hombre') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (g === 'femenino' || g === 'f' || g === 'mujer') {
      return 'bg-pink-100 text-pink-800 border-pink-200';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleShare = async (e: React.MouseEvent, patient: PatientData) => {
    e.stopPropagation();
    const text = patient.generatedClinicalHistory;
    
    if (!text) {
        alert("No hay texto de historia clínica para compartir.");
        return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Historia Clínica - ${patient.name}`,
          text: text,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Texto copiado al portapapeles. (Opción nativa de compartir no disponible)");
      } catch (err) {
        alert("No se pudo compartir automáticamente.");
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-in slide-in-from-right duration-200 pb-20">
      <button 
        onClick={onBack}
        className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
      >
        ← Volver al Menú
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400">No hay pacientes en esta lista.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <div 
              key={patient.id || Math.random().toString()} 
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group flex items-start justify-between relative pr-2 gap-4 cursor-default"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Avatar removed to save space */}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                      {patient.timestamp && (
                        <div className="text-xs font-medium text-slate-400">
                           {formatDate(patient.timestamp)}
                        </div>
                      )}
                      {type === 'seen' && patient.generatedClinicalHistory && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                             HC GENERADA
                          </span>
                      )}
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg transition-colors truncate">
                    {patient.name || "Sin nombre"}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 flex-wrap">
                     <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getAgeStyle(patient.gender)}`}>
                        {patient.age} años
                     </span>
                     {patient.chiefComplaint && (
                        <>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <span className="truncate max-w-[200px] font-medium">{patient.chiefComplaint}</span>
                        </>
                     )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                    {type === 'seen' ? (
                        <>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(patient);
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-200 transition whitespace-nowrap"
                            >
                                <Eye className="w-4 h-4" />
                                Ver Historia
                            </button>
                            
                            <button 
                                onClick={(e) => handleShare(e, patient)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-300 transition whitespace-nowrap"
                            >
                                <Share2 className="w-4 h-4" />
                                Compartir
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(patient);
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-bold border border-orange-200 transition whitespace-nowrap"
                        >
                            <Stethoscope className="w-4 h-4" />
                            Continuar Atención
                        </button>
                    )}
                  </div>

                  {type === 'pending' && patient.pendingItems && patient.pendingItems.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {patient.pendingItems.map(item => (
                        <span key={item} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded-md uppercase">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 border-l border-slate-100 pl-4 ml-2 self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (patient.id) onDelete(patient.id);
                  }}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                  title="Eliminar permanentemente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};