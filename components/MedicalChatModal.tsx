import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';

interface MedicalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatSession: Chat | null;
}

export const MedicalChatModal: React.FC<MedicalChatModalProps> = ({ isOpen, onClose, chatSession }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatSession && isOpen && chatMessages.length === 0) {
      setChatMessages([
        { role: 'model', text: 'Tengo la historia clínica cargada. ¿Sobre qué patología o tratamiento deseas información basada en evidencia?' }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSession, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatSession) return;

    const userText = inputMessage;
    setInputMessage('');
    setIsChatLoading(true);

    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);

    try {
      const response = await chatSession.sendMessage({ message: userText });
      const modelText = response.text || "Lo siento, no pude generar una respuesta.";
      
      setChatMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Error de conexión. Intenta nuevamente." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-800 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
             </div>
             <div>
                <h3 className="font-bold text-lg leading-tight">Asistente Clínico Académico</h3>
                <p className="text-xs text-slate-300">Medicina Basada en Evidencia (Pubmed/Cochrane)</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
           {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-6 h-6 text-indigo-700" />
                </div>
              )}
              
              <div className={`rounded-2xl px-5 py-3.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="w-6 h-6 text-blue-700" />
                </div>
              )}
            </div>
          ))}
          
          {isChatLoading && (
             <div className="flex gap-4 justify-start">
               <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-6 h-6 text-indigo-700" />
               </div>
               <div className="bg-white rounded-2xl rounded-tl-none px-6 py-4 border border-slate-200 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
           <div className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej. Tratamiento de neumonía adquirida en la comunidad..."
              disabled={isChatLoading || !chatSession}
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isChatLoading || !chatSession}
              className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};