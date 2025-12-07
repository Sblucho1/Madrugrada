import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { ChatScreen } from './components/AnalysisModal';
import { HistoryScreen } from './components/HistoryModal';
import { ResultSection } from './components/ResultSection';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PatientData, ClinicalAnalysis } from './types';
import { generateSmartClinicalHistory, createMedicalChat, analyzePatientCase } from './services/geminiService';
import { Activity } from 'lucide-react';
import { Chat } from '@google/genai';

const initialPatientData: PatientData = {
  name: '',
  dni: '',
  age: '',
  gender: '',
  aqx: '',
  ht: '',
  aa: '',
  vitals: {
    bp: '',
    hr: '',
    rr: '',
    temp: '',
    sat: '',
  },
  chiefComplaint: '',
  symptoms: '',
  signs: '',
  labs: '',
  conduct: '',
  history: '', // This is APP (Antecedentes Patológicos)
  treatments: '',
  pendingItems: [],
  status: 'new',
  generatedClinicalHistory: ''
};

type ViewState = 'dashboard' | 'input' | 'results' | 'chat' | 'history' | 'list-seen' | 'list-pending';

const App: React.FC = () => {
  // Global State for all patients
  const [patients, setPatients] = useState<PatientData[]>(() => {
    const saved = localStorage.getItem('guardiaai_patients');
    return saved ? JSON.parse(saved) : [];
  });
  
  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Current session state
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [clinicalHistory, setClinicalHistory] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingHistory, setIsGeneratingHistory] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    patientId: string | null;
    isCurrentSession: boolean;
  }>({ isOpen: false, patientId: null, isCurrentSession: false });

  // Persistence
  useEffect(() => {
    localStorage.setItem('guardiaai_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    // Listen for PWA install event
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  // Helper: Save or Update patient in the main list
  const upsertPatient = (data: PatientData) => {
    setPatients(prev => {
      const exists = prev.find(p => p.id === data.id);
      if (exists) {
        return prev.map(p => p.id === data.id ? data : p);
      }
      return [data, ...prev]; // Add new to top
    });
  };

  const handleInputChange = (field: string, value: string | object) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setPatientData({ ...initialPatientData, status: 'new' });
    setChatSession(null);
    setAnalysis(null);
    setClinicalHistory('');
    setAnalysisError(null);
  };

  const handleNewPatient = () => {
     handleReset();
     setCurrentView('input');
  };

  const handleSavePending = () => {
    if (!patientData.name) {
      alert("Por favor ingrese al menos el nombre del paciente.");
      return;
    }
    const id = patientData.id || Date.now().toString();
    const updatedPatient: PatientData = {
      ...patientData,
      id: id,
      timestamp: Date.now(),
      status: 'pending',
      generatedClinicalHistory: clinicalHistory
    };
    setPatientData(updatedPatient);
    upsertPatient(updatedPatient);
    alert("Paciente guardado en Pendientes.");
    setCurrentView('dashboard');
  };

  const handleLoadPatient = (patient: PatientData) => {
    setPatientData(patient);
    setChatSession(null);
    setAnalysis(null);
    setClinicalHistory(patient.generatedClinicalHistory || '');
    setCurrentView('input');
  };

  const handleLoadAndOpenHistory = (patient: PatientData) => {
    setPatientData(patient);
    setChatSession(null);
    setAnalysis(null);
    setClinicalHistory(patient.generatedClinicalHistory || '');
    setCurrentView('history');
  };

  // --- DELETE LOGIC ---
  const requestDeleteCurrentPatient = () => {
    if (patientData.id) {
        setDeleteConfirmation({
            isOpen: true,
            patientId: patientData.id,
            isCurrentSession: true
        });
    }
  };

  const requestDeletePatient = (id: string) => {
    setDeleteConfirmation({
        isOpen: true,
        patientId: id,
        isCurrentSession: false
    });
  };

  const executeDelete = () => {
    const { patientId, isCurrentSession } = deleteConfirmation;
    
    if (patientId) {
        setPatients(prev => prev.filter(p => p.id !== patientId));
        
        if (isCurrentSession) {
            handleReset();
            setCurrentView('dashboard');
        }
    }
    setDeleteConfirmation({ isOpen: false, patientId: null, isCurrentSession: false });
  };

  // --- BACKUP LOGIC ---
  const handleExportData = () => {
    const dataStr = JSON.stringify(patients, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `guardiaai_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (importedPatients: PatientData[]) => {
    if (window.confirm(`Se encontraron ${importedPatients.length} pacientes en el archivo. Esto combinará los datos con los actuales. ¿Desea continuar?`)) {
        // Merge logic: Add if ID doesn't exist, Update if ID exists
        setPatients(currentPatients => {
            const newPatients = [...currentPatients];
            let addedCount = 0;
            let updatedCount = 0;

            importedPatients.forEach(imported => {
                const index = newPatients.findIndex(p => p.id === imported.id);
                if (index >= 0) {
                    newPatients[index] = imported;
                    updatedCount++;
                } else {
                    newPatients.push(imported);
                    addedCount++;
                }
            });
            
            newPatients.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            alert(`Importación exitosa.\nAgregados: ${addedCount}\nActualizados: ${updatedCount}`);
            return newPatients;
        });
    }
  };

  // --------------------

  const handleGenerateHistory = async () => {
    setIsGeneratingHistory(true);
    // If we are in input, switch to history. If in results, we might stay there or handle it via ResultSection tabs
    if (currentView === 'input') setCurrentView('history');
    
    try {
      let smartHistory = await generateSmartClinicalHistory(patientData);
      smartHistory = smartHistory.replace(/\*\*/g, '').replace(/\*/g, '');
      
      setClinicalHistory(smartHistory);
      
      // Auto-save the generated history to the patient object
      if (patientData.id) {
        const updated = { 
            ...patientData, 
            generatedClinicalHistory: smartHistory 
        };
        setPatientData(updated);
        upsertPatient(updated);
      }

    } catch (err) {
      console.error("History generation error", err);
      setClinicalHistory("Error al generar texto. Por favor intente nuevamente.");
    } finally {
      setIsGeneratingHistory(false);
    }
  };

  const handleHistoryUpdate = (newText: string) => {
      setClinicalHistory(newText);
      // Update local object immediately to persist edits
      if (patientData.id) {
          const updated = {
              ...patientData,
              generatedClinicalHistory: newText
          };
          setPatientData(updated);
          upsertPatient(updated);
      }
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleFinishCase = () => {
    const seenPatient: PatientData = {
      ...patientData,
      id: patientData.id || Date.now().toString(),
      timestamp: Date.now(),
      status: 'seen',
      pendingItems: [],
      generatedClinicalHistory: clinicalHistory
    };
    setPatientData(seenPatient);
    upsertPatient(seenPatient);
    setCurrentView('dashboard');
  };

  const getFormattedFileName = () => {
    const dateObj = new Date();
    const yymmdd = dateObj.toISOString().slice(2, 10).replace(/-/g, '');
    let formattedName = "PACIENTE";
    if (patientData.name) {
         const parts = patientData.name.trim().split(' ');
         if (parts.length > 1) {
            const lastName = parts.pop()?.toUpperCase();
            const names = parts.join(' ');
            formattedName = `${lastName}, ${names}`;
         } else {
            formattedName = patientData.name.toUpperCase();
         }
    }
    return `${yymmdd} - ${formattedName}.txt`;
  };

  const getFullContent = () => {
      const localDate = new Date().toLocaleString();
      return `GUARDIA AI - HISTORIA CLÍNICA DE EMERGENCIA
============================================================
PACIENTE: ${patientData.name || 'NO REGISTRADO'}
DNI: ${patientData.dni || 'NO REGISTRADO'}
EDAD: ${patientData.age || '?'} | GÉNERO: ${patientData.gender || '?'}
FECHA Y HORA: ${localDate}
============================================================

${clinicalHistory}

------------------------------------------------------------
Generado por GuardiaAI - Asistente de Decisión Clínica
`;
  };

  const handleExport = () => {
    try {
      const fullContent = getFullContent();
      const fileName = getFormattedFileName();
      const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      handleFinishCase();
    } catch (err) {
      console.error("Export error", err);
      alert("Error al exportar archivo.");
    }
  };

  // Main Analysis Handler
  const handleSubmit = async () => {
    if (!patientData.symptoms && !patientData.signs && !patientData.chiefComplaint) {
      alert("Por favor ingrese al menos motivo de consulta, síntomas o signos físicos.");
      return;
    }
    
    setIsLoading(true);
    setAnalysisError(null);
    setChatSession(null);
    // Switch to results view immediately to show loading state
    setCurrentView('results');

    try {
        // 1. Analyze for syndrome/management
        const result = await analyzePatientCase(patientData);
        setAnalysis(result);
        
        // 2. Initialize chat for follow-up questions
        const chat = createMedicalChat(patientData);
        setChatSession(chat);

    } catch (e) {
        setAnalysisError("Hubo un problema al analizar el caso. Verifica tu conexión o intenta nuevamente.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!chatSession) {
        const chat = createMedicalChat(patientData);
        setChatSession(chat);
    }
    setCurrentView('chat');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <ConfirmationModal 
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer. Se borrarán permanentemente todos los datos de este paciente."
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
             onClick={() => setCurrentView('dashboard')} 
             className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-lg transition-colors"
          >
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">GuardiaAI</h1>
          </button>
          
          <div className="flex items-center gap-3">
            {currentView !== 'dashboard' && (
                <button 
                onClick={handleNewPatient}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition border-l border-slate-200 pl-3 ml-1"
                >
                Nuevo
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          
          {currentView === 'dashboard' && (
            <Dashboard 
              onNavigate={(view) => {
                if (view === 'input') handleNewPatient();
                else setCurrentView(view);
              }}
              pendingCount={patients.filter(p => p.status === 'pending').length}
              onInstall={installPrompt ? handleInstallClick : undefined}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}

          {(currentView === 'list-seen' || currentView === 'list-pending') && (
            <PatientList 
              type={currentView === 'list-seen' ? 'seen' : 'pending'}
              patients={patients.filter(p => p.status === (currentView === 'list-seen' ? 'seen' : 'pending'))}
              onSelect={currentView === 'list-seen' ? handleLoadAndOpenHistory : handleLoadPatient}
              onBack={() => setCurrentView('dashboard')}
              onDelete={requestDeletePatient}
            />
          )}

          {currentView === 'input' && (
            <InputSection 
              data={patientData} 
              onChange={handleInputChange} 
              onSubmit={handleSubmit}
              onClear={handleReset}
              onDelete={requestDeleteCurrentPatient}
              onGenerateHistory={handleGenerateHistory}
              onViewHistory={handleViewHistory}
              onFinish={handleFinishCase}
              onSavePending={handleSavePending}
              isLoading={isLoading}
              isGeneratingHistory={isGeneratingHistory}
              hasHistory={clinicalHistory.length > 0}
            />
          )}

          {currentView === 'results' && (
             <ResultSection 
               analysis={analysis}
               isLoading={isLoading}
               error={analysisError}
               clinicalHistory={clinicalHistory}
               onHistoryChange={handleHistoryUpdate}
               onExportHistory={handleExport}
               onBack={() => setCurrentView('input')}
               onStartChat={handleStartChat}
             />
          )}

          {currentView === 'chat' && (
            <ChatScreen 
              onBack={() => setCurrentView('results')}
              chatSession={chatSession}
            />
          )}

          {currentView === 'history' && (
            <HistoryScreen
              onBack={() => setCurrentView('input')}
              content={clinicalHistory}
              onChange={handleHistoryUpdate}
              onExport={handleExport}
              onRegenerate={handleGenerateHistory}
            />
          )}
      </main>
    </div>
  );
};

export default App;