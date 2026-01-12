import React, { useState, useRef, useEffect } from 'react';

const labels = ['Integrity', 'Intuition', 'Inquiry', 'Intentionality'];
const colors: Record<string, string> = {
  Integrity: '#818cf8',
  Intuition: '#a78bfa',
  Inquiry: '#c084fc',
  Intentionality: '#e879f9'
};

interface IModeData {
  feelsLike: string;
  whatItIs: string;
  whenYouUseIt: string;
}

const explanations: Record<string, IModeData> = {
  Intentionality: {
    feelsLike: "Having a clear sense of direction; knowing your 'why'",
    whatItIs: "Being clear about purpose and direction. This is the mode of clarity about why you're using AI and what you want to achieve—including whether AI is the right tool at all.",
    whenYouUseIt: "Before you start, when deciding whether to use AI"
  },
  Integrity: {
    feelsLike: "Confidence that you can stand behind your choices; no ethical discomfort",
    whatItIs: "Ensuring ethical, honest, and appropriate use. This is the mode of using AI honestly and responsibly—being transparent about its role, taking responsibility for outputs, and ensuring alignment with your values.",
    whenYouUseIt: "When there are stakes—'Is this still my work?' 'Should I disclose I used AI?'"
  },
  Inquiry: {
    feelsLike: "Engaged curiosity; critically examining rather than passively accepting",
    whatItIs: "Critical examination and quality checking. This is the mode of asking good questions, evaluating outputs carefully, and probing deeper. It means staying curious about both what AI produces and how you're using it.",
    whenYouUseIt: "While working—'Is this actually what I asked for?' 'Does this match my needs?'"
  },
  Intuition: {
    feelsLike: "That internal signal saying 'wait' or 'something's not right here'",
     whatItIs: "Trusting expertise and professional judgment. This is the mode of your internal compass—the sense that something isn't right, or that you should pause. Instead of ignoring these feelings, you treat them as signals worth investigating.",
    whenYouUseIt: "When something feels generic, too easy, or not quite right"
  }
};

interface Dimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

type RevealType = 'feelsLike' | 'whenYouUseIt' | null;

export default function IModelExplainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 400, height: 300 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<Position | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [nearLock, setNearLock] = useState<boolean>(false);
  const [activeReveal, setActiveReveal] = useState<RevealType>(null);

  // Layout constants - Shifted right for better balance
  const webCenterX = dimensions.width - 350; // Moved further right from 250
  const webCenterY = dimensions.height / 2;
  const radius = 90;
  const lockZone = { x: dimensions.width * 0.35, y: dimensions.height / 2 }; // Relative positioning
  const lockRadius = 60;

  // Reduced to 2 Reveal Zones: Feels Like and When You Use It
  const getRevealZones = () => [
    { id: 'feelsLike' as const, label: '← Feels Like', y: lockZone.y - 70 },
    { id: 'whenYouUseIt' as const, label: '← When You Use It', y: lockZone.y + 70 }
  ];

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    const timeout = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
    };
  }, []);

  const getRestPositions = (): Record<string, Position> => {
    const positions: Record<string, Position> = {};
    const angleOffset = -Math.PI / 2;
    labels.forEach((label, i) => {
      const angle = angleOffset + (i * Math.PI * 2) / 4;
      positions[label] = {
        x: webCenterX + Math.cos(angle) * radius,
        y: webCenterY + Math.sin(angle) * radius
      };
    });
    return positions;
  };

  const getTargetPositions = (leadLabel: string) => {
    const leadIndex = labels.indexOf(leadLabel);
    const oppositeIndex = (leadIndex + 2) % 4;
    const oppositeLabel = labels[oppositeIndex];
    const neighborIndices = [0, 1, 2, 3].filter(i => i !== leadIndex && i !== oppositeIndex);
    const getYScore = (i: number) => {
        if (i === 0) return -1;
        if (i === 2) return 1;
        return 0;
    };
    neighborIndices.sort((a, b) => getYScore(a) - getYScore(b));
    const neighbor1Label = labels[neighborIndices[0]];
    const neighbor2Label = labels[neighborIndices[1]];

    // Spread nodes out slightly more to the right
    return {
      [leadLabel]: { x: lockZone.x, y: lockZone.y },
      [oppositeLabel]: { x: lockZone.x + 350, y: lockZone.y },
      [neighbor1Label]: { x: lockZone.x + 250, y: lockZone.y - 120 },
      [neighbor2Label]: { x: lockZone.x + 250, y: lockZone.y + 120 }
    };
  };

  const getPositions = (): Record<string, Position> => {
    const rest = getRestPositions();
    if (locked) {
      const lockedPositions = getTargetPositions(locked);
      if (dragging === locked && dragPos) {
        lockedPositions[locked] = dragPos;
      }
      return lockedPositions;
    }
    if (dragging && dragPos) {
      const positions = { ...rest };
      positions[dragging] = dragPos;
      const dx = dragPos.x - lockZone.x;
      const dy = dragPos.y - lockZone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < lockRadius * 3.5) {
        const targets = getTargetPositions(dragging);
        const t = Math.max(0, 1 - dist / (lockRadius * 3.5));
        labels.forEach(label => {
          if (label === dragging) return;
          const start = rest[label];
          const end = targets[label];
          positions[label] = {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t
          };
        });
      }
      return positions;
    }
    return rest;
  };

  const positions = getPositions();

  const handlePointerDown = (label: string, e: React.PointerEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragging(label);
      setDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPos = {
      x: Math.max(45, Math.min(dimensions.width - 45, e.clientX - rect.left)),
      y: Math.max(45, Math.min(dimensions.height - 45, e.clientY - rect.top))
    };
    setDragPos(newPos);
    
    const dx = newPos.x - lockZone.x;
    const dy = newPos.y - lockZone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    setNearLock(dist < lockRadius * 1.8);

    if (locked && dragging === locked) {
      let foundZone: RevealType = null;
      getRevealZones().forEach(zone => {
        const zdx = newPos.x - (lockZone.x - 100);
        const zdy = newPos.y - zone.y;
        const zdist = Math.sqrt(zdx * zdx + zdy * zdy);
        if (zdist < 50) foundZone = zone.id;
      });
      setActiveReveal(foundZone);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      if (dragPos) {
        const dx = dragPos.x - lockZone.x;
        const dy = dragPos.y - lockZone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (locked) {
          if (dist > lockRadius * 3 || (dragPos.x > lockZone.x + 200)) {
            setLocked(null);
            setActiveReveal(null);
          }
        } else {
          if (dist < lockRadius * 1.5) {
            setLocked(dragging);
            setActiveReveal(null);
          }
        }
      }
    }
    setDragging(null);
    setDragPos(null);
    setNearLock(false);
  };

  const connections: [string, string][] = [];
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      connections.push([labels[i], labels[j]]);
    }
  }

  const getLineStyle = (a: string, b: string) => {
    const isActive = dragging && (a === dragging || b === dragging);
    const isLocked = locked && (a === locked || b === locked);
    return {
      stroke: isActive ? colors[dragging!] : isLocked ? colors[locked!] : '#475569',
      strokeWidth: isActive || isLocked ? 2 : 1,
      opacity: isActive || isLocked ? 0.8 : 0.25,
    };
  };

  const transition = locked && dragging === locked ? 'none' : 
                     locked ? 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 
                     dragging ? 'all 0.08s ease-out' : 
                     'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}>
      <div className="absolute top-0 left-0 w-full pt-8 z-30 pointer-events-none text-center">
        <h1 className="text-2xl font-light tracking-[0.4em] text-white/90 uppercase">The I-Model</h1>
      </div>

      <div className="text-center px-4 pt-20 pb-4 shrink-0 z-20 relative">
        <div className={`transition-opacity duration-300 ${!locked ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
           <p className="text-sm mt-2 text-slate-400">
            Drag an I to the Explore zone
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative select-none touch-none mx-4 min-h-[400px]"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute pointer-events-none"
          style={{ left: lockZone.x, top: lockZone.y, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 160, height: 160, left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              background: locked 
                ? (nearLock && dragging === locked) || !dragging
                    ? `radial-gradient(circle, ${colors[locked]}35 0%, transparent 65%)`
                    : 'transparent'
                : nearLock && dragging
                    ? `radial-gradient(circle, ${colors[dragging]}30 0%, transparent 65%)`
                    : 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
              transition: 'all 0.3s ease',
              opacity: locked && dragging === locked && !nearLock ? 0.2 : 1
            }}
          />
          {!locked && (
            <div className="absolute rounded-full flex items-center justify-center" 
                 style={{ width: 100, height: 100, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', border: '1.5px solid rgba(99,102,241,0.3)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Explore</span>
            </div>
          )}
        </div>

        {locked && (
          <div className="absolute" style={{ left: lockZone.x - 100, top: 0, height: '100%', pointerEvents: 'none' }}>
            {getRevealZones().map((zone) => {
              const isActive = activeReveal === zone.id;
              return (
                <div
                  key={zone.id}
                  className="absolute flex items-center justify-end"
                  style={{ top: zone.y, transform: 'translateY(-50%) translate(-100%)' }}
                >
                  <div
                    className="w-20 h-20 rounded-full border border-dashed flex items-center justify-center transition-all duration-300 relative"
                    style={{
                      borderColor: isActive ? colors[locked] : 'rgba(255,255,255,0.1)',
                      backgroundColor: isActive ? `${colors[locked]}20` : 'transparent',
                      boxShadow: isActive ? `0 0 20px ${colors[locked]}40` : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <span 
                      className="text-[9px] uppercase font-bold text-center px-1 transition-colors duration-300"
                      style={{ color: isActive ? colors[locked] : 'rgba(255,255,255,0.3)' }}
                    >
                      {zone.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
          {connections.map(([a, b], idx) => {
            if (!positions[a] || !positions[b]) return null;
            const style = getLineStyle(a, b);
            return (
              <line
                key={idx}
                x1={positions[a].x}
                y1={positions[a].y}
                x2={positions[b].x}
                y2={positions[b].y}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                opacity={style.opacity}
                style={{ transition }}
              />
            );
          })}
        </svg>

        {labels.map((label) => {
          const pos = positions[label];
          if (!pos) return null;
          const isLead = locked === label;
          const isDragging = dragging === label;
          return (
            <div
              key={label}
              onPointerDown={(e) => handlePointerDown(label, e)}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)',
                transition: isDragging ? 'none' : transition,
                zIndex: isDragging || isLead ? 20 : 1,
                cursor: 'grab',
              }}
            >
              <div
                className="rounded-full flex items-center justify-center text-white font-bold select-none"
                style={{
                  width: isLead ? 72 : 56, height: isLead ? 72 : 56,
                  fontSize: isLead ? 24 : 18, backgroundColor: colors[label],
                  boxShadow: `0 0 ${isLead ? 40 : 20}px ${colors[label]}${isLead ? '70' : '50'}`,
                  transition: 'all 0.2s ease', fontFamily: 'Georgia, serif',
                }}
              >
                I
              </div>
              <span className="mt-2 text-xs font-medium tracking-wide text-slate-400 opacity-80">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-8 shrink-0 relative z-20 min-h-[220px] flex flex-col justify-end">
        {locked && (
          <div
            className="rounded-xl p-6 animate-fadeIn w-full max-w-2xl mx-auto backdrop-blur-md"
            style={{ 
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${colors[locked]}40`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px ${colors[locked]}10`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: colors[locked] }} />
              <h2 className="text-xl font-bold tracking-tight uppercase" style={{ color: colors[locked] }}>{locked} Mode</h2>
            </div>

            <div className="min-h-[100px] flex flex-col justify-center">
              {activeReveal ? (
                <div key={activeReveal} className="animate-revealText">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-2">
                    {activeReveal === 'feelsLike' ? 'Feels Like' : 'When You Use It'}
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-100 font-light italic">
                    {explanations[locked][activeReveal]}
                  </p>
                </div>
              ) : (
                <div key="whatItIs" className="animate-revealText">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-2">
                    Core Definition
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-100 font-light">
                    {explanations[locked].whatItIs}
                  </p>
                  <p className="mt-4 text-xs text-slate-400 italic">
                    Drag the {locked} circle left to see how it feels and when to use it
                  </p>
                </div>
              )}
            </div>
            
            <p className="mt-6 text-[10px] font-bold text-center tracking-[0.3em] uppercase text-indigo-400/60">
                ⟵ Drag another I-Mode to explore
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealText {
          from { opacity: 0; transform: translateX(-10px); filter: blur(4px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        .animate-revealText { animation: revealText 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
