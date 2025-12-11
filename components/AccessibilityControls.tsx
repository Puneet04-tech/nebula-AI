import React from 'react';
import { AccessibilitySettings } from '../types';

interface AccessibilityControlsProps {
  settings: AccessibilitySettings;
  onUpdate: (settings: AccessibilitySettings) => void;
  onClose: () => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ settings, onUpdate, onClose }) => {
  
  const toggle = (key: keyof AccessibilitySettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const setFilter = (filter: AccessibilitySettings['colorFilter']) => {
    onUpdate({ ...settings, colorFilter: filter });
  };

  const setTextSize = (size: AccessibilitySettings['textSize']) => {
    onUpdate({ ...settings, textSize: size });
  };

  return (
    <div className="absolute top-20 right-4 z-50 w-72 glass p-6 rounded-2xl shadow-2xl animate-fade-in border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          Accessibility
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Dyslexia Mode */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Dyslexia Font</span>
          <button 
            onClick={() => toggle('dyslexiaFont')}
            className={`w-12 h-6 rounded-full relative transition-colors ${settings.dyslexiaFont ? 'bg-indigo-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.dyslexiaFont ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">High Contrast</span>
          <button 
            onClick={() => toggle('highContrast')}
            className={`w-12 h-6 rounded-full relative transition-colors ${settings.highContrast ? 'bg-yellow-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.highContrast ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Reading Ruler */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Reading Ruler</span>
          <button 
            onClick={() => toggle('readingRuler')}
            className={`w-12 h-6 rounded-full relative transition-colors ${settings.readingRuler ? 'bg-indigo-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.readingRuler ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Text Size */}
        <div>
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Text Size</span>
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(['normal', 'large', 'xlarge'] as const).map(size => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={`flex-1 py-1 rounded text-xs transition-colors ${settings.textSize === size ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {size === 'normal' ? 'Aa' : size === 'large' ? 'Aa+' : 'Aa++'}
              </button>
            ))}
          </div>
        </div>

        {/* Color Blindness */}
        <div>
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Color Filter</span>
          <select 
            value={settings.colorFilter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full bg-slate-800 text-slate-300 text-sm rounded-lg p-2 border border-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="none">None</option>
            <option value="protanopia">Protanopia (Red-Blind)</option>
            <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
            <option value="tritanopia">Tritanopia (Blue-Blind)</option>
          </select>
        </div>
      </div>
    </div>
  );
};