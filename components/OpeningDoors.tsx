import React, { useState } from 'react';

interface OpeningDoorsProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function OpeningDoors({ 
  children, 
  title = "AI Practice Lab", 
  subtitle = "Enter the I-Model" 
}: OpeningDoorsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullyClosed, setIsFullyClosed] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    // Remove from DOM/layout flow after animation completes to prevent interaction issues
    setTimeout(() => {
      setIsFullyClosed(true);
    }, 1500); // slightly longer than transition to be safe
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main Content (Behind the doors) */}
      <div className={`w-full h-full transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>

      {/* The Doors Overlay */}
      {!isFullyClosed && (
        <div className="absolute inset-0 z-50 flex pointer-events-none">
          {/* Left Door */}
          <div 
            className={`h-full w-1/2 bg-slate-950 border-r border-slate-800 relative z-10 flex items-center justify-end transition-transform duration-1000 ease-in-out ${isOpen ? '-translate-x-full' : 'translate-x-0'}`}
            style={{ 
                background: 'linear-gradient(to right, #020617, #0f172a)',
                boxShadow: isOpen ? 'none' : '5px 0 25px rgba(0,0,0,0.5)' 
            }}
          >
             {/* Left pattern/decoration */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950 pointer-events-none" />
          </div>

          {/* Right Door */}
          <div 
            className={`h-full w-1/2 bg-slate-950 border-l border-slate-800 relative z-10 flex items-center justify-start transition-transform duration-1000 ease-in-out ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
            style={{ 
                background: 'linear-gradient(to left, #020617, #0f172a)',
                boxShadow: isOpen ? 'none' : '-5px 0 25px rgba(0,0,0,0.5)' 
            }}
          >
             {/* Right pattern/decoration */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-950 to-slate-950 pointer-events-none" />
          </div>

          {/* Center Click Trigger (Floating above) */}
          <div 
            className={`absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center transition-all duration-700 pointer-events-auto cursor-pointer group ${isOpen ? 'opacity-0 scale-150 pointer-events-none' : 'opacity-100 scale-100'}`}
            onClick={handleOpen}
          >
            <div className="mb-10 text-center">
                <h1 className="text-2xl font-light tracking-[0.3em] text-slate-300 mb-2 uppercase whitespace-nowrap">{title}</h1>
                <p className="text-slate-500 text-xs tracking-widest uppercase">{subtitle}</p>
            </div>

            {/* Glowing Orb/Button */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
              <div className="w-24 h-24 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-slate-900/80 transition-all duration-500 shadow-2xl">
                <div className="w-16 h-16 rounded-full border border-slate-600 group-hover:border-indigo-400/50 flex items-center justify-center transition-all duration-500">
                    <span className="text-slate-400 group-hover:text-indigo-200 text-xs tracking-[0.2em] font-light transition-colors duration-300 ml-1">OPEN</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}