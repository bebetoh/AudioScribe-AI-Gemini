import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, Music, Mic } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        onFileSelected(file);
    } else {
        alert('Por favor, selecione um arquivo de áudio ou vídeo válido.');
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        border-3 border-dashed rounded-2xl p-10 md:p-16
        flex flex-col items-center justify-center text-center
        transition-all duration-300 ease-in-out
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
          : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="audio/*,video/*"
        className="hidden"
      />

      <div className={`
        mb-6 p-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg text-white
        transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
      `}>
        <UploadCloud className="w-10 h-10" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Arraste e solte seu áudio aqui
      </h3>
      <p className="text-slate-500 mb-6 max-w-sm">
        Ou clique para navegar em seus arquivos. Suportamos MP3, WAV, M4A, OGG e mais.
      </p>

      <div className="flex gap-4 text-xs text-slate-400 font-medium uppercase tracking-wide">
        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> MP3</span>
        <span className="flex items-center gap-1"><FileAudio className="w-3 h-3" /> WAV</span>
        <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> M4A</span>
      </div>
    </div>
  );
};