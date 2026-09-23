import React, { useState } from 'react';
import { PageId, MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { Wine, Search, Heart, Sparkles, Filter, Check, Calendar, Info, Share2 } from 'lucide-react';

interface DrinksFoodPageProps {
  onNavigate: (page: PageId) => void;
  savedPairings: string[];
  onToggleSavedPairing: (id: string) => void;
  onOpenQuiz: () => void;
}

export const DrinksFoodPage: React.FC<DrinksFoodPageProps> = ({
  onNavigate,
  savedPairings,
  onToggleSavedPairing,
  onOpenQuiz
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Offerings' },
    { id: 'aperitivi', label: 'Aperitivi & Cocktails' },
    { id: 'vermouth', label: 'Vermouth & Bitters' },
    { id: 'wines', label: 'Wines by Glass & Bottle' },
    { id: 'small-plates', label: 'Small Plates & Cicchetti' },
    { id: 'charcuterie', label: 'Charcuterie & Cheese' },
    { id: 'digestivi', label: 'Digestivi & Cellar Afters' },
  ];

  const tagsList = ['All Tags', 'Signature', 'Low-ABV', 'GF', 'VG', 'V', 'Sommelier Pick'];

  // Filter logic
  const filteredItems = MENU_ITEMS.filter((item) => {
    // Saved filter
    if (showSavedOnly && !savedPairings.includes(item.id)) return false;

    // Category filter
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;

    // Tag filter
    if (tagFilter !== 'all' && tagFilter !== 'All Tags') {
      if (!item.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase())) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchItalian = item.italianName?.toLowerCase().includes(q);
      const matchTasting = item.tastingNotes?.toLowerCase().includes(q);
      return matchName || matchDesc || matchItalian || matchTasting;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[#DFBE7B] text-xs font-display uppercase tracking-widest block">
          CURATED MENU · AMICA SOHO LONDON
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#FDFBF7] tracking-wide">
          Drinks, Cocktails & Cicchetti
        </h1>
        <p className="text-xs sm:text-sm text-[#DFBE7B]/80 leading-relaxed font-sans">
          Explore our Italian botanical aperitivi, cask-rested house Negronis, artisanal vermouths, and Venetian cicchetti. Select your favorites to build a personal pairing list for your visit to 23 Frith Street.
        </p>

        {/* Quiz Banner */}
        <div className="pt-2">
          <button
            onClick={onOpenQuiz}
            className="inline-flex items-center gap-2 px-6 py-3 btn-brass-outline text-xs tracking-wider uppercase rounded shadow-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Not sure what to order? Take the Aperitivo Finder Quiz</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Categories + Search + Saved Toggle */}
      <div className="bg-[#121215] border border-[#C5A059]/30 rounded-xl p-4 sm:p-6 space-y-4 shadow-xl">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#C5A059]/20">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setShowSavedOnly(false);
              }}
              className={`px-4 py-2 text-xs font-display tracking-wider whitespace-nowrap rounded-md transition-all cursor-pointer ${
                activeCategory === cat.id && !showSavedOnly
                  ? 'bg-[#C5A059] text-[#0B0B0C] font-bold shadow-md'
                  : 'text-[#FDFBF7]/80 hover:text-[#DFBE7B] hover:bg-[#181820]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Second Row: Search + Tag Filters + Saved Pairings Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#C5A059]" />
            <input
              type="text"
              placeholder="Search Spritz, Negroni, Prosciutto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#181820] border border-[#C5A059]/30 rounded text-xs text-[#FDFBF7] placeholder-[#FDFBF7]/40 focus:outline-none focus:border-[#C5A059] font-sans"
            />
          </div>

          {/* Tags Dropdown / Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-[#DFBE7B] font-display whitespace-nowrap flex items-center gap-1 tracking-wider">
              <Filter className="w-3 h-3" /> Filter Tag:
            </span>
            <div className="flex items-center gap-1.5">
              {tagsList.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag === tagFilter ? 'all' : tag)}
                  className={`px-2.5 py-1 text-[11px] rounded font-display tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                    tagFilter === tag || (tag === 'All Tags' && tagFilter === 'all')
                      ? 'bg-[#22222D] text-[#FFEAA7] border border-[#C5A059]/60 font-semibold'
                      : 'bg-[#181820] text-[#FDFBF7]/60 hover:text-[#FDFBF7] border border-transparent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Shortlist Button */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`px-4 py-2 text-xs font-display tracking-wider rounded border transition-all flex items-center gap-1.5 whitespace-nowrap w-full sm:w-auto justify-center cursor-pointer ${
              showSavedOnly
                ? 'bg-[#C5A059] text-[#0B0B0C] border-[#C5A059] font-bold'
                : 'bg-[#181820] text-[#DFBE7B] border-[#C5A059]/40 hover:border-[#C5A059]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${savedPairings.length > 0 ? 'fill-current' : ''}`} />
            <span>My Visit Pairings ({savedPairings.length})</span>
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] border border-[#C5A059]/20 rounded-xl space-y-4">
          <Info className="w-8 h-8 text-[#C5A059] mx-auto" />
          <h3 className="font-display text-2xl font-bold text-[#FDFBF7]">No Items Found</h3>
          <p className="text-xs text-[#DFBE7B]/70 font-sans">Try clearing your search query or adjusting your filters.</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setTagFilter('all');
              setShowSavedOnly(false);
            }}
            className="px-4 py-2 btn-brass text-xs rounded uppercase tracking-wider cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isSaved = savedPairings.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-gradient-to-b from-[#16161C] to-[#101014] border border-[#C5A059]/30 hover:border-[#C5A059] rounded-xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-[0_10px_30px_rgba(197,160,89,0.15)] relative group"
              >
                {/* Save Heart Button (Minimum 44x44px touch target) */}
                <button
                  onClick={() => onToggleSavedPairing(item.id)}
                  className="absolute top-3.5 right-3.5 min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-[#121215]/90 border border-[#C5A059]/50 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0B0B0C] transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-lg"
                  title={isSaved ? 'Remove from My Visit Pairings' : 'Save to My Visit Pairings'}
                  aria-label="Toggle pairing bookmark"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-[#C5A059] hover:text-[#0B0B0C]' : 'text-[#DFBE7B]'}`} />
                </button>

                <div className="space-y-3 pr-10">
                  {/* Category / Italian Name */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-display text-[#DFBE7B] uppercase tracking-wider font-semibold">
                      {item.italianName || item.category.replace('-', ' ')}
                    </span>
                    {item.tags?.map((t) => (
                      <span key={t} className="text-[9px] px-2 py-0.5 bg-[#1E1E28] text-[#FFEAA7] border border-[#C5A059]/30 rounded font-display tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Name & Price */}
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-[#FDFBF7] group-hover:text-[#FFEAA7] transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <span className="font-display text-lg font-bold text-[#C5A059] block">
                    {item.price}
                  </span>

                  <p className="text-xs text-[#E8D5C4] leading-relaxed font-sans">
                    {item.description}
                  </p>

                  {item.tastingNotes && (
                    <div className="p-3 bg-[#131317] rounded-lg border border-[#C5A059]/30 text-[11px] text-[#DFBE7B] font-display italic shadow-inner">
                      <span className="font-display text-[9px] text-[#C5A059] uppercase not-italic block font-bold mb-0.5 tracking-wider">Sommelier Notes:</span>
                      "{item.tastingNotes}"
                    </div>
                  )}
                </div>

                {/* Footer pairing advice */}
                <div className="pt-4 mt-4 border-t border-[#C5A059]/25 flex items-center justify-between text-xs">
                  {item.pairingRecommendation ? (
                    <span className="text-[11px] text-[#DFBE7B] italic flex items-center gap-1 font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="line-clamp-1">Pairs with: {item.pairingRecommendation}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#DFBE7B]/60 font-display tracking-wider">23 Frith St · Soho</span>
                  )}

                  <button
                    onClick={() => onToggleSavedPairing(item.id)}
                    className={`min-h-[36px] px-3 py-1 rounded text-[11px] font-display uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                      isSaved ? 'bg-[#C5A059] text-[#0B0B0C] font-bold shadow' : 'bg-[#181820] text-[#DFBE7B] hover:bg-[#C5A059] hover:text-[#0B0B0C] border border-[#C5A059]/40'
                    }`}
                  >
                    {isSaved ? 'Saved ✓' : '+ Add Pairing'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Sticky Bar if pairings exist */}
      {savedPairings.length > 0 && (
        <div className="fixed bottom-6 right-6 z-30 bg-[#121215] border-2 border-[#C5A059] rounded-xl p-4 shadow-2xl flex items-center gap-4 text-[#FDFBF7] animate-bounce-short">
          <div className="space-y-0.5">
            <span className="font-display text-sm font-bold text-[#FFEAA7] block">
              {savedPairings.length} Saved Menu Pairing{savedPairings.length > 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-[#DFBE7B]/70 block font-sans">Ready to try them at 23 Frith Street?</span>
          </div>

          <button
            onClick={() => onNavigate('book')}
            className="px-4 py-2 btn-brass text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Table</span>
          </button>
        </div>
      )}
    </div>
  );
};
