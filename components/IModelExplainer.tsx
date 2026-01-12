import React, { useState, useRef, useEffect } from 'react';

const labels = ['Integrity', 'Intuition', 'Inquiry', 'Intentionality'];
const colors: Record<string, string> = {
  Integrity: '#818cf8',
  Intuition: '#a78bfa',
  Inquiry: '#c084fc',
  Intentionality: '#e879f9'
};

interface Explanation {
  main: string;
  others: Record<string, string>;
}

const explanations: Record<string, Explanation> = {
  Integrity: {
    main: "Integrity grounds your AI use in ethics and authenticity. It asks: Is this an appropriate use of AI? Am I being honest about how I'm using it? Does this align with my values and responsibilities?",
    others: {
      Intentionality: "Ensures your purpose aligns with your ethical responsibilities.",
      Inquiry: "Helps you question whether outputs meet your standards of honesty and quality.",
      Intuition: "Alerts you when something feels ethically off or inauthentic."
    }
  },
  Intuition: {
    main: "Intuition is your internal compass when working with AI. It's the feeling that something isn't quite right, or the sense that AI might help here. Learning to trust and investigate these signals makes you a better collaborator.",
    others: {
      Integrity: "Helps you examine what your gut feeling is actually telling you.",
      Intentionality: "Connects your instincts to your deeper purpose.",
      Inquiry: "Turns vague feelings into specific questions you can investigate."
    }
  },
  Inquiry: {
    main: "Inquiry is the questioning stance you bring to AI collaboration. It shapes how you prompt, how you evaluate outputs, and how you refine results. Good inquiry means staying curious and critical throughout.",
    others: {
      Intentionality: "Focuses your questions on what actually matters.",
      Integrity: "Ensures your investigation serves honest, ethical ends.",
      Intuition: "Prompts you to dig deeper when something feels incomplete."
    }
  },
  Intentionality: {
    main: "Intentionality means being clear about why you're using AI and what you want to achieve. It's the foundation that shapes everything else—without clear purpose, AI collaboration drifts.",
    others: {
      Integrity: "Checks whether your intentions align with your values.",
      Inquiry: "Translates your purpose into effective prompts and evaluation.",
      Intuition: "Helps you sense when you've lost sight of your original goal."
    }
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

export default function IModelExplainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 400, height: 300 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<Position | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [hoveredSupport, setHoveredSupport] = useState<string | null>(null);
  const [nearLock, setNearLock] = useState<boolean>(false);

  // Web on the right side - Moved further inward
  const webCenterX = dimensions.width - 250;
  const webCenterY = dimensions.height / 2;
  // Radius increased to make the section feel larger
  const radius = 90;

  // Explore zone on the left - Moved closer to center
  const lockZone = { x: 200, y: dimensions.height / 2 };
  const lockRadius = 60;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    // Initial update
    updateDimensions();
    // Add small delay to ensure container is fully rendered
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

  // Helper to calculate the 'Locked' layout based on which node is the lead
  const getTargetPositions = (leadLabel: string) => {
    const leadIndex = labels.indexOf(leadLabel);
    const oppositeIndex = (leadIndex + 2) % 4;
    const oppositeLabel = labels[oppositeIndex];
    
    // Get remaining two indices for the neighbors
    const neighborIndices = [0, 1, 2, 3].filter(i => i !== leadIndex && i !== oppositeIndex);
    
    // Sort neighbors by their vertical position in the original circle to avoid crossing paths.
    // 0 is Top (-1), 1 is Mid (0), 2 is Bottom (1), 3 is Mid (0).
    const getYScore = (i: number) => {
        if (i === 0) return -1;
        if (i === 2) return 1;
        return 0;
    };
    
    // Sort so the 'higher' neighbor in the circle goes to the top position
    neighborIndices.sort((a, b) => getYScore(a) - getYScore(b));
    
    const neighbor1Label = labels[neighborIndices[0]]; // Goes Top
    const neighbor2Label = labels[neighborIndices[1]]; // Goes Bottom

    return {
      [leadLabel]: { x: lockZone.x, y: lockZone.y },
      [oppositeLabel]: { x: lockZone.x + 260, y: lockZone.y },         // Far Right tip
      [neighbor1Label]: { x: lockZone.x + 140, y: lockZone.y - 90 },  // Top Right corner
      [neighbor2Label]: { x: lockZone.x + 140, y: lockZone.y + 90 }   // Bottom Right corner
    };
  };

  const getPositions = (): Record<string, Position> => {
    const rest = getRestPositions();

    if (locked) {
      // Get the target layout for this locked node
      const lockedPositions = getTargetPositions(locked);

      // If we are currently dragging the locked node (e.g. to reset it), override its position
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

      // Magnetic pull interpolation when near lock zone
      if (dist < lockRadius * 3.5) {
        // Calculate where everyone WOULD go if we locked this node right now
        const targets = getTargetPositions(dragging);
        const t = Math.max(0, 1 - dist / (lockRadius * 3.5));
        
        labels.forEach(label => {
          if (label === dragging) return; // This one follows mouse
          
          const start = rest[label];
          const end = targets[label]; // Interpolate towards specific target role
          
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
    // If locked, only allow dragging the active locked node (to dismiss it)
    if (locked && locked !== label) return;

    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragging(label);
      setDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      // Capture pointer to ensure we receive move events even if mouse leaves the element
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return; // Allow move if locked but dragging
    
    const rect = containerRef.current.getBoundingClientRect();
    // Increased boundary buffer to 45 to account for larger node size
    const newPos = {
      x: Math.max(45, Math.min(dimensions.width - 45, e.clientX - rect.left)),
      y: Math.max(45, Math.min(dimensions.height - 45, e.clientY - rect.top))
    };
    setDragPos(newPos);
    
    const dx = newPos.x - lockZone.x;
    const dy = newPos.y - lockZone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Update nearLock state
    if (locked) {
        // If locked, we are 'near' (connected) as long as we are within threshold
        setNearLock(dist < lockRadius * 2);
    } else {
        // If not locked, we are 'near' when entering the zone
        setNearLock(dist < lockRadius * 1.8);
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
              // If we are dragging the locked node out
              // Threshold to release is slightly larger to prevent accidental release
              if (dist > lockRadius * 2) {
                  handleReset();
              }
              // If dropped close to center, it snaps back automatically due to state remaining 'locked'
          } else {
              // Standard locking logic
              if (dist < lockRadius * 1.5) {
                setLocked(dragging);
              }
          }
        }
     }
    setDragging(null);
    setDragPos(null);
    setNearLock(false);
  };

  const handleReset = () => {
    setLocked(null);
    setDragging(null);
    setDragPos(null);
    setHoveredSupport(null);
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

  const transition = locked && dragging === locked ? 'none' : // Instant movement when dragging locked node
                     locked ? 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 
                     dragging ? 'all 0.08s ease-out' : 
                     'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}>
      {/* Header - Simplified */}
      <div className="text-center px-4 pt-8 pb-4 shrink-0 z-20 relative">
        <div className={`transition-opacity duration-300 ${!locked ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
           <p className="text-sm mt-2 text-slate-400">
            Drag an I to the Explore zone on the left
          </p>
        </div>
      </div>

      {/* Main interactive area */}
      <div
        ref={containerRef}
        className="flex-1 relative select-none touch-none mx-4 min-h-[300px]"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Explore zone on left */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: lockZone.x,
            top: lockZone.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: locked 
                ? (nearLock && dragging === locked) || !dragging // Show glow if locked and NOT dragging away (or close enough)
                    ? `radial-gradient(circle, ${colors[locked]}35 0%, transparent 65%)`
                    : 'transparent'
                : nearLock && dragging
                    ? `radial-gradient(circle, ${colors[dragging]}30 0%, transparent 65%)`
                    : 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
              transition: 'all 0.3s ease',
              opacity: locked && dragging === locked && !nearLock ? 0.2 : 1 // Fade out when dragging away
            }}
          />
          
          {/* Middle ring */}
          {!locked && (
            <div
              className="absolute rounded-full"
              style={{
                width: nearLock ? 110 : 100,
                height: nearLock ? 110 : 100,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: `1.5px solid ${nearLock && dragging ? colors[dragging] : 'rgba(99,102,241,0.3)'}`,
                boxShadow: nearLock && dragging 
                  ? `0 0 25px ${colors[dragging]}50, inset 0 0 15px ${colors[dragging]}20`
                  : '0 0 15px rgba(99,102,241,0.15)',
                transition: 'all 0.3s ease',
              }}
            />
          )}
          
          {/* Inner ring */}
          {!locked && (
            <div
              className="absolute rounded-full"
              style={{
                width: nearLock ? 70 : 60,
                height: nearLock ? 70 : 60,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: `1px solid ${nearLock && dragging ? colors[dragging] : 'rgba(99,102,241,0.2)'}`,
                transition: 'all 0.3s ease',
              }}
            />
          )}
          
          {/* Explore label */}
          {!locked && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span 
                className="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
                style={{
                  color: nearLock && dragging ? colors[dragging] : 'rgba(148,163,184,0.7)',
                }}
              >
                Explore
              </span>
            </div>
          )}

          {/* Pulse animation when near */}
          {nearLock && !locked && (
            <div
              className="absolute rounded-full animate-ping"
              style={{
                width: 110,
                height: 110,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: `2px solid ${dragging ? colors[dragging] : 'rgba(99,102,241,0.4)'}`,
                opacity: 0.4,
                animationDuration: '1.2s',
              }}
            />
          )}
        </div>

        {/* Connection lines */}
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

        {/* Nodes */}
        {labels.map((label) => {
          const pos = positions[label];
          if (!pos) return null;
          
          const isLead = locked === label;
          const isSupport = locked && locked !== label;
          const isHovered = hoveredSupport === label;
          const isDragging = dragging === label;

          return (
            <div
              key={label}
              onPointerDown={(e) => handlePointerDown(label, e)}
              onMouseEnter={() => isSupport && setHoveredSupport(label)}
              onMouseLeave={() => setHoveredSupport(null)}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                // Disable transition if we are actively dragging this specific node (smooth drag)
                transition: isDragging ? 'none' : transition,
                zIndex: isDragging || isLead ? 10 : isHovered ? 8 : 1,
                cursor: locked ? (isLead ? 'grab' : 'pointer') : 'grab',
              }}
            >
              <div
                className="rounded-full flex items-center justify-center text-white font-bold select-none"
                style={{
                  width: isLead ? 72 : isHovered ? 64 : 56,
                  height: isLead ? 72 : isHovered ? 64 : 56,
                  fontSize: isLead ? 24 : 18,
                  backgroundColor: colors[label],
                  boxShadow: `0 0 ${isLead ? 40 : isHovered ? 30 : 20}px ${colors[label]}${isLead ? '70' : isHovered ? '60' : '50'}`,
                  transition: 'all 0.2s ease',
                  fontFamily: 'Georgia, serif',
                  // Visual hint when dragging the locked node out
                  opacity: isDragging && isLead && !nearLock ? 0.6 : 1,
                  transform: isDragging && isLead && !nearLock ? 'scale(0.9)' : 'scale(1)',
                }}
              >
                I
              </div>
              <span
                className="mt-2 text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded select-none pointer-events-none"
                style={{
                  color: isLead || isHovered ? colors[label] : 'rgba(203,213,225,0.7)',
                  fontWeight: isLead || isHovered ? 600 : 400,
                  backgroundColor: isLead || isHovered ? `${colors[label]}25` : 'transparent',
                  transition: 'all 0.2s ease',
                  opacity: isDragging && isLead ? 0 : 1 // Hide label when dragging locked node
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanation area at bottom */}
      <div className="px-4 pb-8 shrink-0 relative z-20 min-h-[180px] flex flex-col justify-end">
        {locked && (
          <div
            className="rounded-xl p-6 animate-fadeIn w-full max-w-2xl mx-auto backdrop-blur-sm"
            style={{ 
              background: 'rgba(30, 41, 59, 0.8)',
              borderLeft: `3px solid ${colors[locked]}`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 20px ${colors[locked]}20`,
            }}
          >
            <p className="text-base leading-relaxed mb-4 text-slate-200">
              <span className="font-semibold text-lg mr-1" style={{ color: colors[locked] }}>{locked}:</span>
              {explanations[locked].main}
            </p>
            
            {hoveredSupport ? (
              <div 
                className="text-sm p-3 rounded-lg animate-fadeIn border border-transparent transition-colors"
                style={{ 
                    backgroundColor: `${colors[hoveredSupport]}18`,
                    borderColor: `${colors[hoveredSupport]}30`
                }}
              >
                <span className="font-bold mr-1" style={{ color: colors[hoveredSupport] }}>{hoveredSupport}:</span>
                <span className="text-slate-300">{explanations[locked].others[hoveredSupport]}</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-slate-400 italic">
                <span className="inline-block w-4 h-4 rounded-full border border-slate-500 mr-2 flex items-center justify-center text-[10px]">?</span>
                Hover over the other I's to see how they connect
              </div>
            )}
            
            {/* UPDATED RESET INSTRUCTION */}
            <p className="mt-5 text-sm font-medium text-center animate-pulse tracking-wide" style={{ color: '#818cf8' }}>
                ⟵ Drag the circle OUT to reset
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}