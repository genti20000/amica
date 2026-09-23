import React, { useState } from 'react';
import { X, Wine, Sparkles, Check, RefreshCw, Calendar } from 'lucide-react';
import { MENU_ITEMS } from '../data/menuData';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookTable: () => void;
}

export const AperitivoQuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onBookTable }) => {
  const [step, setStep] = useState<number>(1);
  const [flavor, setFlavor] = useState<string>('');
  const [vibe, setVibe] = useState<string>('');
  const [food, setFood] = useState<string>('');

  if (!isOpen) return null;

  const resetQuiz = () => {
    setStep(1);
    setFlavor('');
    setVibe('');
    setFood('');
  };

  // Find match based on answers
  const getRecommendation = () => {
    if (flavor === 'bitter-sweet') {
      return {
        drink: MENU_ITEMS.find((i) => i.id === 'oxblood-negroni') || MENU_ITEMS[1],
        food: MENU_ITEMS.find((i) => i.id === 'lac-gran-tagliere') || MENU_ITEMS[12],
        reasoning: 'The rich oak-cask aged Negroni beautifully cuts through the savoury fats of 24-month prosciutto and Gorgonzola.'
      };
    } else if (flavor === 'citrus-refreshing') {
      return {
        drink: MENU_ITEMS.find((i) => i.id === 'lac-signature-spritz') || MENU_ITEMS[0],
        food: MENU_ITEMS.find((i) => i.id === 'focaccia-rosemary') || MENU_ITEMS[9],
        reasoning: 'The effervescent Select Aperitivo and Castelvetrano olives pair effortlessly with warm olive oil focaccia.'
      };
    } else if (flavor === 'rich-herbal') {
      return {
        drink: MENU_ITEMS.find((i) => i.id === 'cocchi-torino') || MENU_ITEMS[4],
        food: MENU_ITEMS.find((i) => i.id === 'formaggi-selection') || MENU_ITEMS[13],
        reasoning: 'Chilled Cocchi Storico Vermouth elevates the sharp bite of 36-month Parmigiano and black truffle honey.'
      };
    } else {
      return {
        drink: MENU_ITEMS.find((i) => i.id === 'frith-street-americano') || MENU_ITEMS[2],
        food: MENU_ITEMS.find((i) => i.id === 'castelvetrano-olives') || MENU_ITEMS[10],
        reasoning: 'Low-ABV grapefruit crispness makes for an effortless post-work palate refresher at 23 Frith Street.'
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#121215] border border-[#C5A059]/50 rounded-xl p-6 sm:p-8 text-[#FDFBF7] shadow-2xl overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#FDFBF7]/60 hover:text-[#C5A059] p-1 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 text-[#DFBE7B] font-display text-xs uppercase tracking-widest mb-1">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>Interactive Aperitivo Finder</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FDFBF7] mb-6 tracking-wide">
          Find Your AMICA SOHO Pairing
        </h2>

        {/* Quiz Steps */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-[#DFBE7B]/80 font-sans">1. What palate profile are you craving tonight?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'citrus-refreshing', title: 'Bright & Spritzy', desc: 'Citrus, effervescent, light' },
                { id: 'bitter-sweet', title: 'Bold & Bittersweet', desc: 'Oak, Campari, deep cherry' },
                { id: 'rich-herbal', title: 'Rich & Botanical', desc: 'Vermouth, herbal, spice' },
                { id: 'low-abv', title: 'Low-ABV Palate Refresher', desc: 'Grapefruit, soda, crisp' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setFlavor(opt.id);
                    setStep(2);
                  }}
                  className={`p-4 rounded border text-left transition-all cursor-pointer ${
                    flavor === opt.id
                      ? 'border-[#C5A059] bg-[#1C1C26] shadow-md ring-1 ring-[#C5A059]'
                      : 'border-[#C5A059]/20 bg-[#181820] hover:border-[#C5A059]/60'
                  }`}
                >
                  <span className="block font-display text-base font-bold text-[#DFBE7B]">{opt.title}</span>
                  <span className="block text-xs text-[#FDFBF7]/70 mt-1 font-sans">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#DFBE7B]/80 font-sans">2. What atmosphere brings you to AMICA SOHO tonight?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'post-work', title: 'Post-Work Golden Hour', desc: 'Early evening unwind with colleagues' },
                { id: 'intimate-date', title: 'Candlelit Date Night', desc: 'Cozy leather vault corner' },
                { id: 'group-celebration', title: 'Soho Evening Out', desc: 'Sharing plates with friends' },
                { id: 'solo-wine', title: 'Solo Sommelier Session', desc: 'Quiet drink at the brass bar' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setVibe(opt.id);
                    setStep(3);
                  }}
                  className={`p-4 rounded border text-left transition-all cursor-pointer ${
                    vibe === opt.id
                      ? 'border-[#C5A059] bg-[#1C1C26] shadow-md ring-1 ring-[#C5A059]'
                      : 'border-[#C5A059]/20 bg-[#181820] hover:border-[#C5A059]/60'
                  }`}
                >
                  <span className="block font-display text-base font-bold text-[#DFBE7B]">{opt.title}</span>
                  <span className="block text-xs text-[#FDFBF7]/70 mt-1 font-sans">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-[#DFBE7B]/80 font-sans">3. What small plate sounds most alluring?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'charcuterie', title: 'Aged Prosciutto & Gnocco Fritto', desc: 'Rich cured meats' },
                { id: 'cheeses', title: 'Artisanal Italian Cheeses & Truffle Honey', desc: 'Sharp & creamy' },
                { id: 'focaccia', title: 'Warm Rosemary Focaccia & Olives', desc: 'Warm baked bread' },
                { id: 'seafood', title: 'Whipped Baccalà Crostini', desc: 'Venetian delicate bite' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setFood(opt.id);
                    setStep(4);
                  }}
                  className={`p-4 rounded border text-left transition-all cursor-pointer ${
                    food === opt.id
                      ? 'border-[#C5A059] bg-[#1C1C26] shadow-md ring-1 ring-[#C5A059]'
                      : 'border-[#C5A059]/20 bg-[#181820] hover:border-[#C5A059]/60'
                  }`}
                >
                  <span className="block font-display text-base font-bold text-[#DFBE7B]">{opt.title}</span>
                  <span className="block text-xs text-[#FDFBF7]/70 mt-1 font-sans">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-5 bg-[#181820] border border-[#C5A059]/40 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-[#DFBE7B] text-xs font-display uppercase tracking-wider">
                <Check className="w-4 h-4 text-[#C5A059]" />
                <span>Your Ideal AMICA SOHO Match</span>
              </div>

              {/* Recommended Drink */}
              <div className="flex items-start gap-3 border-b border-[#C5A059]/20 pb-3">
                <div className="p-2.5 bg-[#121215] rounded border border-[#C5A059]/30 text-[#C5A059]">
                  <Wine className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-display text-[#DFBE7B] tracking-wider">Selected Drink</span>
                  <h4 className="font-display text-lg font-bold text-[#FDFBF7]">{recommendation.drink.name}</h4>
                  <p className="text-xs text-[#FDFBF7]/70 mt-0.5 font-sans">{recommendation.drink.description}</p>
                </div>
              </div>

              {/* Recommended Food */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#121215] rounded border border-[#C5A059]/30 text-[#DFBE7B]">
                  <Sparkles className="w-5 h-5 text-[#C5A059]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-display text-[#DFBE7B] tracking-wider">Recommended Cicchetti</span>
                  <h4 className="font-display text-lg font-bold text-[#FDFBF7]">{recommendation.food.name}</h4>
                  <p className="text-xs text-[#FDFBF7]/70 mt-0.5 font-sans">{recommendation.food.description}</p>
                </div>
              </div>

              {/* Pairing Sommelier Note */}
              <p className="text-xs italic text-[#DFBE7B] bg-[#121215] p-3 rounded border border-[#C5A059]/20 font-sans">
                "{recommendation.reasoning}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  onBookTable();
                }}
                className="flex-1 py-3 btn-brass text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Table For This Pairing</span>
              </button>

              <button
                onClick={resetQuiz}
                className="py-3 px-4 btn-brass-outline text-xs rounded flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
