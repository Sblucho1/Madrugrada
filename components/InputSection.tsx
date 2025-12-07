import React from 'react';
import { PatientData } from '../types';
import { Activity, Thermometer, Wind, Heart, FileText, User, Microscope, ClipboardList, Trash2, Syringe, MessageSquare, Loader2, Sparkles, Clock, Save, Eye, CheckCircle, CreditCard, Stethoscope } from 'lucide-react';

interface InputSectionProps {
  data: PatientData;
  onChange: (field: string, value: string | object) => void;
  onSubmit: () => void;
  onClear: () => void;
  onDelete?: () => void;
  onGenerateHistory: () => void;
  onViewHistory: () => void;
  onFinish: () => void;
  onSavePending: () => void;
  isLoading: boolean;
  isGeneratingHistory: boolean;
  hasHistory: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  data, 
  onChange, 
  onSubmit, 
  onClear, 
  onDelete,
  onGenerateHistory,
  onViewHistory,
  onFinish,
  onSavePending,
  isLoading, 
  isGeneratingHistory,
  hasHistory
}) => {
  
  const handleVitalChange = (key: keyof PatientData['vitals'], value: string) => {
    onChange('vitals', { ...data.vitals, [key]: value });
  };

  const handlePendingToggle = (item: string) => {
    const currentItems = data.pendingItems || [];
    let newItems;
    if (currentItems.includes(item)) {
      newItems = currentItems.filter(i => i !== item);
    } else {
      newItems = [...currentItems, item];
    }
    onChange('pendingItems', newItems);
  };

  const pendingOptions = [
    { id: 'laboratorio', label: 'Laboratorio' },
    { id: 'evolución', label: 'Evolución' },
    { id: 'ecg', label: 'ECG' },
    { id: 'imágenes', label: 'Imágenes' },
    { id: 'otros estudios', label: 'Otros estudios' },
  ];

  const isExistingPatient = data.id && data.status !== 'new';
  const isCaseClosed = data.status === 'seen';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col mb-10 animate-in fade-in duration-300">
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800 text-lg">Ingreso de Datos Clínicos</h2>
        </div>
        
        {isExistingPatient && onDelete ? (
          <button 
            onClick={onDelete} 
            className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg shadow-sm"
            title="Borrar registro permanentemente"
          >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar Registro
          </button>
        ) : (
          <button 
            onClick={onClear} 
            className="text-xs font-medium text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-200"
            title="Borrar todos los campos"
          >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar Datos
          </button>
        )}
      </div>
      
      <div className="p-8 space-y-8">
        
        {/* Patient ID Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre y Apellido</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50/50"
              />
           </div>
           
           <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">DNI</label>
              <div className="relative">
                 <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                 <input
                    type="text"
                    value={data.dni || ''}
                    onChange={(e) => onChange('dni', e.target.value)}
                    placeholder="Ej. 12345678"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50/50"
                 />
              </div>
           </div>

           <div className="md:col-span-2">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Edad</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={data.age}
                  onChange={(e) => onChange('age', e.target.value)}
                  placeholder="Ej. 45"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50/50"
                />
              </div>
           </div>
           
           <div className="md:col-span-3">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Género</label>
              <select
                value={data.gender}
                onChange={(e) => onChange('gender', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50/50"
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
           </div>
        </div>

        {/* Antecedents Grid */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
             <FileText className="w-4 h-4" /> Antecedentes
           </label>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <input
                  value={data.history}
                  onChange={(e) => onChange('history', e.target.value)}
                  placeholder="APP: HTA, DBT, Asma, Cardiopatía..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                value={data.aqx}
                onChange={(e) => onChange('aqx', e.target.value)}
                placeholder="AQx"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                value={data.ht}
                onChange={(e) => onChange('ht', e.target.value)}
                placeholder="HT"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                value={data.aa}
                onChange={(e) => onChange('aa', e.target.value)}
                placeholder="AA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
           </div>
        </div>

        {/* Clinical Picture */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600"/>
            <label className="text-sm font-bold text-slate-700 uppercase">Motivo de Consulta</label>
          </div>
          <input
            type="text"
            value={data.chiefComplaint}
            onChange={(e) => onChange('chiefComplaint', e.target.value)}
            placeholder="Ej. Dolor torácico, Disnea, Cefalea..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
          />
        </div>

        {/* Vitals */}
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Signos Vitales</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-slate-400"><Activity className="w-4 h-4" /></div>
              <input 
                placeholder="TA" 
                value={data.vitals.bp}
                onChange={(e) => handleVitalChange('bp', e.target.value)}
                className="w-full pl-9 pr-2 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" 
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-slate-400"><Heart className="w-4 h-4" /></div>
              <input 
                placeholder="FC" 
                value={data.vitals.hr}
                onChange={(e) => handleVitalChange('hr', e.target.value)}
                className="w-full pl-9 pr-2 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" 
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-slate-400"><Wind className="w-4 h-4" /></div>
              <input 
                placeholder="FR" 
                value={data.vitals.rr}
                onChange={(e) => handleVitalChange('rr', e.target.value)}
                className="w-full pl-9 pr-2 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" 
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-slate-400"><Thermometer className="w-4 h-4" /></div>
              <input 
                placeholder="Temp" 
                value={data.vitals.temp}
                onChange={(e) => handleVitalChange('temp', e.target.value)}
                className="w-full pl-9 pr-2 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" 
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">O2</div>
              <input 
                placeholder="SatO2" 
                value={data.vitals.sat}
                onChange={(e) => handleVitalChange('sat', e.target.value)}
                className="w-full pl-9 pr-2 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white" 
              />
            </div>
          </div>
        </div>

        {/* Narrative Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enfermedad Actual (Síntomas)</label>
                <textarea
                  value={data.symptoms}
                  onChange={(e) => onChange('symptoms', e.target.value)}
                  placeholder="Desarrollo cronológico del cuadro clínico..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 resize-none shadow-sm"
                />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Examen Físico (Signos)</label>
                <textarea
                  value={data.signs}
                  onChange={(e) => onChange('signs', e.target.value)}
                  placeholder="Hallazgos positivos al examen físico..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 resize-none shadow-sm"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div>
                <div className="flex items-center gap-2 mb-2">
                    <Microscope className="w-4 h-4 text-slate-500"/>
                    <label className="text-xs font-bold text-slate-500 uppercase">Laboratorio / Imágenes</label>
                </div>
                <textarea
                  value={data.labs}
                  onChange={(e) => onChange('labs', e.target.value)}
                  placeholder="Resultados relevantes..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none"
                />
             </div>
             
             <div>
                <div className="flex items-center gap-2 mb-2">
                    <Syringe className="w-4 h-4 text-slate-500"/>
                    <label className="text-xs font-bold text-slate-500 uppercase">Tratamiento Administrado</label>
                </div>
                <textarea
                  value={data.treatments}
                  onChange={(e) => onChange('treatments', e.target.value)}
                  placeholder="Fármacos o medidas ya realizadas..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-24 resize-none"
                />
             </div>
          </div>

          <div>
             <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4 text-slate-500"/>
                <label className="text-xs font-bold text-slate-500 uppercase">Conducta Médica (Opcional)</label>
             </div>
            <textarea
              value={data.conduct}
              onChange={(e) => onChange('conduct', e.target.value)}
              placeholder="Plan a seguir, interconsultas (dejar vacío si se usará IA)..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-20 resize-none"
            />
          </div>

          {/* Pending Status Checkbox */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
             <div className="flex items-center gap-2 mb-3 text-orange-800">
               <Clock className="w-5 h-5" />
               <span className="font-bold text-sm uppercase">Pendiente de resultados / Evolución</span>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {pendingOptions.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-orange-100 transition">
                     <input 
                       type="checkbox" 
                       checked={data.pendingItems?.includes(opt.id) || false}
                       onChange={() => handlePendingToggle(opt.id)}
                       className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                     />
                     <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                  </label>
                ))}
             </div>
             <div className="mt-4 flex justify-end">
                <button
                   onClick={onSavePending}
                   disabled={(!data.pendingItems || data.pendingItems.length === 0)}
                   className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition
                     ${(!data.pendingItems || data.pendingItems.length === 0) 
                       ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                       : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'}`}
                >
                   <Save className="w-4 h-4" />
                   Guardar en Pendientes
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSubmit}
            disabled={isLoading || isGeneratingHistory}
            title="Generar manejo sindrómico"
            className={`flex-1 py-4 px-6 rounded-xl text-white flex items-center justify-center gap-2 transition shadow-lg
              ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}`}
          >
            {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span>Procesando...</span>
                </>
            ) : (
                <>
                  <Stethoscope className="w-6 h-6" />
                  <span className="font-bold text-lg">Analizar Caso Clínico</span>
                </>
            )}
          </button>
          
          <button
            onClick={hasHistory ? onViewHistory : onGenerateHistory}
            disabled={isLoading || isGeneratingHistory}
            className={`sm:w-1/3 py-4 px-4 rounded-xl text-slate-700 font-bold text-base flex items-center justify-center gap-2 transition border-2 border-slate-300 bg-white
              ${isGeneratingHistory ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'hover:bg-slate-100 active:scale-[0.98]'}`}
          >
            {isGeneratingHistory ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redactando...
              </>
            ) : hasHistory ? (
              <>
                <Eye className="w-5 h-5" />
                Ver Historia
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Generar Historia
              </>
            )}
          </button>
        </div>
        
        {/* Close Case Button */}
        <button
           onClick={onFinish}
           disabled={isCaseClosed}
           className={`w-full py-3 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition shadow-md
             ${isCaseClosed 
               ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
               : 'text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]'}`}
        >
           <CheckCircle className="w-5 h-5" />
           Cerrar Caso (Archivar)
        </button>
      </div>
    </div>
  );
};