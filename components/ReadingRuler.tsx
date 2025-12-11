import React, { useEffect, useState } from 'react';

interface ReadingRulerProps {
  active: boolean;
}

export const ReadingRuler: React.FC<ReadingRulerProps> = ({ active }) => {
  const [y, setY] = useState(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setY(e.clientY);
    };

    if (active) {
      window.addEventListener('mousemove', handleMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, [active]);

  if (!active) return null;

  const rulerHeight = 60; // Height of the clear area

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Top Dimmer */}
      <div 
        className="absolute left-0 right-0 top-0 bg-black/60 transition-none"
        style={{ height: Math.max(0, y - rulerHeight / 2) }}
      ></div>
      
      {/* Ruler Guide Lines */}
      <div
        className="absolute left-0 right-0 border-t-2 border-b-2 border-yellow-400/30"
        style={{ top: y - rulerHeight / 2, height: rulerHeight }}
      ></div>

      {/* Bottom Dimmer */}
      <div 
        className="absolute left-0 right-0 bottom-0 bg-black/60 transition-none"
        style={{ top: y + rulerHeight / 2 }}
      ></div>
    </div>
  );
};