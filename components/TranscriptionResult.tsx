import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Download, RefreshCw, Pencil, Save, X, Send, Clock, Activity, Brain } from 'lucide-react';

interface TranscriptionResultProps {
  text: string;
  onReset: () => void;
  onSaveCorrection?: (text: string) => void;
  metadata?: {
    duration?: number;
    sampleRate?: number;
  };
  isLearned?: boolean;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text, onReset, onSaveCorrection, metadata, isLearned }) => {
  const [localText, setLocalText] = useState(text);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [copied, setCopied] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with prop if the parent updates the text (e.g. re-transcribe)
  useEffect(() => {
    setLocalText(text);
    setEditValue(text);
    setFeedbackStatus('idle');
  }, [text]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, editValue]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([localText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "transcricao_audioscribe.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const startEditing = () => {
    setEditValue(localText);
    setIsEditing(true);
    setFeedbackStatus('idle'); // Reset feedback if they edit again
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(localText);
  };

  const saveEditing = () => {
    setLocalText(editValue);
    setIsEditing(false);
  };

  const sendFeedback = () => {
    setFeedbackStatus('sending');
    
    // Simulate API delay
    setTimeout(() => {
      setFeedbackStatus('sent');
      if (onSaveCorrection) {
        onSaveCorrection(localText);
      }
    }, 1000);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSampleRate = (rate?: number) => {
    if (!rate) return '- Hz';
    return `${(rate / 1000).toFixed(1)} kHz`;
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
               Transcrição Concluída
             </h3>
             
             {isLearned && (
               <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                 <Brain className="w-3.5 h-3.5" />
                 <span>Aprendizado Aplicado</span>
               </div>
             )}
          </div>

          {/* Metadata Display */}
          {(metadata?.duration || metadata?.sampleRate) && (
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 ml-3.5">
              {metadata.duration && (
                <div className="flex items-center gap-1.5" title="Duração do áudio">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDuration(metadata.duration)}</span>
                </div>
              )}
              {metadata.sampleRate && (
                <div className="flex items-center gap-1.5" title="Taxa de amostragem">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatSampleRate(metadata.sampleRate)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={startEditing}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                title="Editar texto"
              >
                <Pencil className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Editar</span>
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button
                  onClick={handleDownload}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Baixar .txt"
              >
                  <Download className="w-5 h-5" />
              </button>
              <button
                  onClick={handleCopy}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Copiar texto"
              >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={cancelEditing}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={saveEditing}
                className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`bg-slate-50 rounded-xl border transition-all duration-200 ${isEditing ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 shadow-inner'}`}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-transparent p-6 outline-none text-slate-800 leading-relaxed font-normal resize-none min-h-[200px]"
            spellCheck={false}
          />
        ) : (
          <div className="p-6 max-h-[500px] overflow-y-auto">
             <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-normal">
              {localText}
            </p>
          </div>
        )}
      </div>

      {/* Feedback & Secondary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        
        {/* Model Training Feedback */}
        <div className="flex-1">
          {feedbackStatus === 'sent' ? (
             <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100 animate-in fade-in slide-in-from-left-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Correção enviada! Obrigado por ajudar a treinar a IA.</span>
             </div>
          ) : (
            <button
              onClick={sendFeedback}
              disabled={feedbackStatus === 'sending'}
              className={`
                flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors
                ${feedbackStatus === 'sending' 
                  ? 'text-slate-400 bg-slate-50 cursor-not-allowed' 
                  : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                }
              `}
              title="Envie a versão corrigida para melhorar o modelo"
            >
              <Send className={`w-4 h-4 ${feedbackStatus === 'sending' ? 'animate-ping' : ''}`} />
              {feedbackStatus === 'sending' ? 'Enviando...' : 'Enviar correção para aprendizado'}
            </button>
          )}
        </div>

        {/* Reset Action */}
        <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm ml-auto"
        >
            <RefreshCw className="w-4 h-4" />
            Transcrever novo áudio
        </button>
      </div>
    </div>
  );
};