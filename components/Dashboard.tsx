import React, { useRef } from 'react';
import { UserPlus, ClipboardList, Clock, Download, FileText, Upload, Database } from 'lucide-react';
import { PatientData } from '../types';

interface DashboardProps {
  onNavigate: (view: 'input' | 'list-seen' | 'list-pending') => void;
  pendingCount: number;
  onInstall?: () => void;
  onExportData?: () => void;
  onImportData?: (data: PatientData[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  pendingCount, 
  onInstall,
  onExportData,
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          if (Array.isArray(data)) {
            onImportData(data);
          } else {
            alert("El archivo no tiene un formato válido (debe ser una lista de pacientes).");
          }
        }
      } catch (error) {
        console.error("Error parsing backup file:", error);
        alert("Error al leer el archivo de respaldo.");
      }
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-in fade-in zoom-in duration-300">
      
      <div className="flex items-center justify-center relative mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Menú Principal</h2>
        {onInstall && (
            <button 
                onClick={onInstall}
                className="absolute right-0 flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">App</span>
            </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Nuevo Paciente Card */}
        <button 
          onClick={() => onNavigate('input')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all group flex flex-col items-center justify-center text-center gap-4 h-64"
        >
          <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
            <UserPlus className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700">Nuevo Paciente</h3>
            <p className="text-sm text-slate-500 mt-1">Ingresar datos clínicos para un nuevo caso.</p>
          </div>
        </button>

        {/* Pendientes Card */}
        <button 
          onClick={() => onNavigate('list-pending')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-orange-300 hover:-translate-y-1 transition-all group flex flex-col items-center justify-center text-center gap-4 h-64 relative"
        >
          {pendingCount > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
              {pendingCount}
            </div>
          )}
          <div className="p-4 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors">
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-700">Pendientes</h3>
            <p className="text-sm text-slate-500 mt-1">Pacientes en espera de evolución, laboratorios o estudios.</p>
          </div>
        </button>

        {/* Historias Clínicas (Previously Vistos) Card */}
        <button 
          onClick={() => onNavigate('list-seen')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all group flex flex-col items-center justify-center text-center gap-4 h-64"
        >
          <div className="p-4 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors">
            <FileText className="w-10 h-10 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700">Historias Clínicas</h3>
            <p className="text-sm text-slate-500 mt-1">Biblioteca de historias generadas y pacientes vistos.</p>
          </div>
        </button>

      </div>

      {/* Backup & Restore Controls */}
      {(onExportData || onImportData) && (
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="font-medium">Gestión de Datos Locales</span>
            </div>
            <div className="flex gap-3">
                {onExportData && (
                    <button 
                        onClick={onExportData}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm text-slate-700 hover:text-slate-900"
                        title="Descargar copia de seguridad de todos los pacientes"
                    >
                        <Download className="w-4 h-4" />
                        Exportar Backup
                    </button>
                )}
                {onImportData && (
                    <>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleFileChange}
                        />
                        <button 
                            onClick={handleImportClick}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm text-slate-700 hover:text-slate-900"
                            title="Restaurar pacientes desde un archivo .json"
                        >
                            <Upload className="w-4 h-4" />
                            Restaurar
                        </button>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};