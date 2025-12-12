import React, { useState, useEffect } from 'react';
import { ZoomIn, ImageOff, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  type: 'console' | 'dashboard' | 'rancher';
  title?: string;
  lines?: string[];
  activeItem?: string;
  onClick?: () => void;
  imageSrc?: string; // Expecting Raw GitHub URL
}

export const UISnapshot: React.FC<Props> = ({ type, title, lines = [], activeItem, onClick, imageSrc }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageSrc]);

  const containerClasses = `relative my-4 rounded-lg overflow-hidden shadow-md border bg-gray-50 w-full max-w-lg mx-auto group ${onClick ? 'cursor-zoom-in hover:shadow-xl hover:border-suse-base/50 transition-all duration-200' : ''}`;
  
  const overlay = onClick ? (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
       <div className="bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
          <ZoomIn className="w-5 h-5 text-suse-base" />
       </div>
    </div>
  ) : null;

  // Render Image if source is provided
  if (imageSrc) {
    return (
      <div className={`${containerClasses} ${type === 'console' ? 'border-4 border-gray-800 bg-black' : 'border-gray-300'}`} onClick={onClick}>
        {type === 'console' && (
           <div className="bg-gray-800 text-gray-400 px-2 py-1 text-xs text-center border-b border-gray-700 font-mono">
             tty1 - SUSE Virtualization Installer
           </div>
        )}
        {type !== 'console' && (
           <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-3">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-amber-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <span className="ml-2 text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded flex-1 text-center truncate">
               {title || 'SUSE Virtualization Dashboard'}
             </span>
           </div>
        )}
        
        <div className="relative min-h-[200px] bg-gray-100 flex items-center justify-center">
            {!hasError ? (
                <img 
                  src={imageSrc} 
                  alt={title || "Official Screenshot"} 
                  className="w-full h-auto object-cover"
                  onError={() => setHasError(true)}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center bg-gray-50">
                    <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-bold text-gray-500">Image Load Failed</span>
                    <span className="text-[10px] mt-1 break-all px-4 select-all text-gray-400">{imageSrc}</span>
                    <div className="flex gap-2 mt-2">
                        <button 
                            onClick={() => setHasError(false)}
                            className="text-xs flex items-center gap-1 bg-white border px-2 py-1 rounded hover:bg-gray-100"
                        >
                            <RefreshCw className="w-3 h-3"/> Retry
                        </button>
                        <a 
                        href={imageSrc} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs flex items-center gap-1 bg-white border px-2 py-1 rounded hover:bg-gray-100 text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3 h-3"/> Open Source
                        </a>
                    </div>
                </div>
            )}
        </div>
        {overlay}
      </div>
    );
  }

  // Fallback (Code should not reach here if imageSrc is provided)
  return <div className="p-4 text-center text-red-500">No Image Source Provided</div>;
};