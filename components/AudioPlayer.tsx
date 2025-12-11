import React, { useMemo } from 'react';

interface AudioPlayerProps {
  file: File;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ file }) => {
  const objectUrl = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  // Clean up URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <div className="w-full bg-white rounded-lg p-2">
      <audio 
        controls 
        src={objectUrl} 
        className="w-full h-10 focus:outline-none"
        controlsList="nodownload"
      >
        Seu navegador não suporta o elemento de áudio.
      </audio>
    </div>
  );
};