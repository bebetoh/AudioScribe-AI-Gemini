import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { FileDropzone } from './components/FileDropzone';
import { TranscriptionResult } from './components/TranscriptionResult';
import { AudioPlayer } from './components/AudioPlayer';
import { LoadingState } from './components/LoadingState';
import { transcribeAudio, getCachedCorrection, learnCorrection } from './services/geminiService';
import { AudioFile, TranscriptionState } from './types';
import { AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE_MB = 18; // Safety margin for base64 expansion overhead (Gemini limits vary but keeping it safe)

export default function App() {
  const [fileData, setFileData] = useState<AudioFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    status: 'idle',
    text: null,
    error: null,
  });

  // Simulated Progress Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (transcriptionState.status === 'loading') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Zeno's paradox simulation:
          // Move 10% of the remaining distance to 95%.
          // This ensures it starts fast but slows down and never quite hits 100% until done.
          const remaining = 95 - prev;
          const increment = Math.max(0.5, remaining * 0.1); 
          
          if (prev >= 95) return 95; // Cap at 95% while waiting
          return prev + increment;
        });
      }, 500);
    } else if (transcriptionState.status === 'success') {
      setProgress(100);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [transcriptionState.status]);

  const getAudioMetadata = async (file: File): Promise<{ duration: number; sampleRate: number } | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use AudioContext to decode header info without playing
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return null;
      
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      return {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate
      };
    } catch (e) {
      console.warn("Could not extract audio metadata", e);
      return null;
    }
  };

  const handleFileSelected = useCallback(async (file: File) => {
    // Reset state
    setTranscriptionState({ status: 'idle', text: null, error: null });
    setProgress(0);
    
    // Size check
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setTranscriptionState({
        status: 'error',
        text: null,
        error: `O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB para processamento direto.`,
      });
      return;
    }

    try {
      const base64Promise = fileToBase64(file);
      const metadataPromise = getAudioMetadata(file);

      const [base64, metadata] = await Promise.all([base64Promise, metadataPromise]);
      
      setFileData({
        file,
        base64,
        mimeType: file.type || 'audio/mp3', // Fallback
        duration: metadata?.duration,
        sampleRate: metadata?.sampleRate
      });
    } catch (err) {
      setTranscriptionState({
        status: 'error',
        text: null,
        error: 'Falha ao ler o arquivo de áudio.',
      });
    }
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (!fileData) return;

    setTranscriptionState({ status: 'loading', text: null, error: null });

    // Check for "learned" correction first
    const fileId = `${fileData.file.name}-${fileData.file.size}-${fileData.file.lastModified}`;
    const learnedText = getCachedCorrection(fileId);

    if (learnedText) {
      // Simulate a small delay for better UX even if cached
      setTimeout(() => {
        setTranscriptionState({ status: 'success', text: learnedText, error: null, fromCache: true });
      }, 800);
      return;
    }

    try {
      const result = await transcribeAudio(fileData.base64, fileData.mimeType);
      setTranscriptionState({ status: 'success', text: result, error: null, fromCache: false });
    } catch (error) {
      console.error(error);
      setTranscriptionState({
        status: 'error',
        text: null,
        error: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido durante a transcrição.',
      });
    }
  }, [fileData]);

  const handleReset = useCallback(() => {
    setFileData(null);
    setTranscriptionState({ status: 'idle', text: null, error: null });
    setProgress(0);
  }, []);

  const handleSaveCorrection = useCallback((correctedText: string) => {
    if (fileData) {
        const fileId = `${fileData.file.name}-${fileData.file.size}-${fileData.file.lastModified}`;
        learnCorrection(fileId, correctedText);
    }
  }, [fileData]);

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the Data-URL prefix (e.g., "data:audio/mp3;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            AudioScribe AI
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transforme voz em texto com precisão. Faça upload de qualquer formato de áudio e deixe nossa IA identificar e transcrever para você.
          </p>
        </div>

        {/* Main Interaction Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
          
          {/* 1. Upload State */}
          {!fileData && (
            <div className="p-8 md:p-12">
              <FileDropzone onFileSelected={handleFileSelected} />
            </div>
          )}

          {/* 2. File Loaded / Processing State */}
          {fileData && (
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                 <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{fileData.file.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium uppercase">
                        {fileData.mimeType.split('/')[1] || 'audio'}
                      </span>
                      <span>•</span>
                      <span>{(fileData.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                 </div>
                 {transcriptionState.status === 'idle' && (
                   <button 
                     onClick={handleReset}
                     className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors"
                   >
                     Remover
                   </button>
                 )}
              </div>

              {/* Audio Player Preview */}
              <div className="w-full">
                <AudioPlayer file={fileData.file} />
              </div>

              {/* Action Area */}
              {transcriptionState.status === 'idle' && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleTranscribe}
                    className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                  >
                    <span>Iniciar Transcrição</span>
                    <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Loading State */}
              {transcriptionState.status === 'loading' && (
                <LoadingState progress={progress} />
              )}

              {/* Error State */}
              {transcriptionState.status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Erro na Transcrição</h4>
                    <p className="text-sm mt-1">{transcriptionState.error}</p>
                    <button 
                      onClick={handleReset}
                      className="mt-3 text-sm font-medium underline hover:text-red-800"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              )}

              {/* Success State */}
              {transcriptionState.status === 'success' && transcriptionState.text && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TranscriptionResult 
                      text={transcriptionState.text} 
                      onReset={handleReset}
                      onSaveCorrection={handleSaveCorrection}
                      metadata={{
                        duration: fileData.duration,
                        sampleRate: fileData.sampleRate
                      }}
                      isLearned={transcriptionState.fromCache}
                    />
                 </div>
              )}

            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}