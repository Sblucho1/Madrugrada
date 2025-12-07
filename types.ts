
export interface PatientData {
  id?: string; // Unique identifier
  timestamp?: number; // Creation/Update time
  status?: 'new' | 'pending' | 'seen';
  pendingItems?: string[]; // Array of selected pending items
  
  name: string; // Nombre y Apellido
  dni?: string; // Documento Nacional de Identidad
  age: string;
  gender: string;
  aqx: string; // Antecedentes Quirúrgicos
  ht: string; // Hábitos Tóxicos
  aa: string; // Antecedentes Alérgicos
  history: string; // Antecedentes Patológicos (APP)
  vitals: {
    bp: string; // Blood Pressure
    hr: string; // Heart Rate
    rr: string; // Respiratory Rate
    temp: string; // Temperature
    sat: string; // O2 Saturation
  };
  chiefComplaint: string; // Motivo de consulta
  symptoms: string; // Subjective
  signs: string; // Objective/Physical Exam
  labs: string; // Laboratory/Imaging results
  conduct: string; // Conducta médica
  treatments: string; // Tratamiento administrado
  
  generatedClinicalHistory?: string; // The generated text of the history
}

export interface ClinicalAnalysis {
  syndromeName: string;
  triageLevel: string; // e.g., "Rojo", "Naranja", "Amarillo", "Verde"
  reasoning: string;
  differentialDiagnoses: string[];
  immediateManagement: string[];
  recommendedExams: string[];
  redFlags: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
