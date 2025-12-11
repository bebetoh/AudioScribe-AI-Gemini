import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  progress: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ progress }) => {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500 w-full max-w-md mx-auto">
      
      {/* Icon Animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-white p-4 rounded-full shadow-md border border-slate-100">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 bg-indigo-500 text-white p-1 rounded-full animate-bounce delay-700">
            <Sparkles className="w-3 h-3" />
        </div>
      </div>
      
      {/* Text Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-800">Transcrevendo Áudio</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          A IA está processando o áudio e gerando o texto...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wide">
          <span>Processando</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Dots */}
      <div className="flex gap-1 pt-2 justify-center opacity-60">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};