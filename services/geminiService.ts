
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, ClinicalAnalysis } from "../types";

// Inicializa el cliente con la API Key del entorno
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const analyzePatientCase = async (data: PatientData): Promise<ClinicalAnalysis> => {
  const prompt = `Analiza el siguiente caso clínico de urgencias y proporciona una evaluación sindrómica estructurada.
  
  DATOS DEL PACIENTE:
  Nombre: ${data.name} | Edad: ${data.age} | Sexo: ${data.gender}
  MC: ${data.chiefComplaint}
  APP: ${data.history}
  Tóxicos: ${data.ht} | Alergias: ${data.aa} | Qx: ${data.aqx}
  
  CLÍNICA:
  Signos Vitales: TA ${data.vitals.bp}, FC ${data.vitals.hr}, FR ${data.vitals.rr}, T ${data.vitals.temp}, Sat ${data.vitals.sat}
  Síntomas (Enfermedad Actual): ${data.symptoms}
  Signos (Examen Físico): ${data.signs}
  Estudios: ${data.labs}
  
  Genera un objeto JSON con:
  - Síndrome clínico principal
  - Nivel de Triage (Rojo, Naranja, Amarillo, Verde, Azul)
  - Razonamiento clínico breve
  - 3 Diagnósticos diferenciales
  - 5 Acciones de manejo inmediato
  - Exámenes complementarios sugeridos
  - Red Flags (Signos de alarma presentes o a vigilar)`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            syndromeName: { type: Type.STRING },
            triageLevel: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            differentialDiagnoses: { type: Type.ARRAY, items: { type: Type.STRING } },
            immediateManagement: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedExams: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text) as ClinicalAnalysis;
  } catch (error) {
    console.error("Error analyzing case:", error);
    throw error;
  }
};

export const generateSmartClinicalHistory = async (data: PatientData): Promise<string> => {
  const prompt = `Actúa como un médico especialista en medicina de emergencias. Redacta una Historia Clínica completa, formal y profesional basada en los siguientes datos sueltos. Usa terminología técnica precisa.
  
  Estructura sugerida:
  1. Anamnesis (Filiación, MC, AE, Antecedentes)
  2. Examen Físico (Signos vitales y examen segmentario)
  3. Resumen de estudios complementarios
  4. Impresión Diagnóstica / Síndromes
  5. Plan de Trabajo y Tratamiento
  
  Datos crudos:
  ${JSON.stringify(data, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt
    });
    return response.text || "No se pudo generar el texto.";
  } catch (error) {
    console.error("Error generating history:", error);
    throw error;
  }
};

export const createMedicalChat = (data: PatientData) => {
  const systemInstruction = `Eres GuardiaAI, un asistente clínico experto basado en medicina basada en la evidencia.
  Estás asistiendo en tiempo real sobre el siguiente paciente:
  ${JSON.stringify(data)}
  
  Responde preguntas sobre dosis, interacciones, criterios de internación, scores (Wells, CURB-65, etc) y diagnósticos diferenciales.
  Cita fuentes generales (guías de práctica clínica) cuando sea relevante. Se conciso y directo.`;

  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction
    }
  });
};
