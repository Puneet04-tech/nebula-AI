
import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';

interface FlashcardDeckProps {
  content: string;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ content }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Parse the AI output to structured cards
    const parsedCards: Flashcard[] = [];
    const lines = content.split('\n');
    let currentCard: Partial<Flashcard> = {};

    lines.forEach(line => {
      if (line.includes('Front:')) currentCard.front = line.split('Front:')[1].trim();
      if (line.includes('Back:')) {
        currentCard.back = line.split('Back:')[1].trim();
        if (currentCard.front && currentCard.back) {
          parsedCards.push(currentCard as Flashcard);
          currentCard = {};
        }
      }
    });

    setCards(parsedCards);
  }, [content]);

  if (cards.length === 0) return null;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 300);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 perspective-1000">
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-80 transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-8 flex flex-col items-center justify-center backface-hidden shadow-2xl border border-white/10">
          <span className="text-indigo-200 uppercase tracking-widest text-xs font-bold mb-4">Card {currentIndex + 1}/{cards.length}</span>
          <h3 className="text-3xl font-bold text-white text-center">{cards[currentIndex].front}</h3>
          <p className="absolute bottom-6 text-white/50 text-sm">Tap to flip</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-2xl border border-white/10">
           <span className="text-emerald-400 uppercase tracking-widest text-xs font-bold mb-4">Answer</span>
           <p className="text-xl text-slate-200 text-center leading-relaxed">{cards[currentIndex].back}</p>
           <button 
             onClick={(e) => { e.stopPropagation(); handleNext(); }}
             className="absolute bottom-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-colors shadow-lg"
            >
             Next Card
           </button>
        </div>
      </div>
      
      {/* 3D Styles */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
