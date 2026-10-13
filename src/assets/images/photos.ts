// AMICA SOHO — real photographs supplied by the venue
import photoBar from './amica-bar.webp';
import photoCocktail from './amica-cocktail.webp';
import photoMenuHat from './amica-menu-hat.webp';
import photoMenus from './amica-menus.webp';
import photoChampagne from './amica-champagne.webp';
import photoCheeseBoard from './amica-cheese-board.webp';
import photoOlives from './amica-olives.webp';
import photoMozzarellaSalmon from './amica-mozzarella-salmon.webp';
import photoSilverTier from './amica-silver-tier.webp';
import photoSalmonTier from './amica-salmon-tier.webp';
import photoGoldTier from './amica-gold-tier.webp';

export {
  photoBar,
  photoCocktail,
  photoMenuHat,
  photoMenus,
  photoChampagne,
  photoCheeseBoard,
  photoOlives,
  photoMozzarellaSalmon,
  photoSilverTier,
  photoSalmonTier,
  photoGoldTier,
};

export interface VenueGalleryImage {
  id: string;
  title: string;
  subtitle: string;
  category: 'bar' | 'drinks' | 'food';
  src: string;
  alt: string;
}

export const AMICA_PHOTOS: VenueGalleryImage[] = [
  { id: 'bar', title: 'The Bar', subtitle: 'Red fringe lamps & leather bar stools', category: 'bar', src: photoBar, alt: 'The AMICA bar with red fringed lamp shades, leather stools and a marble counter' },
  { id: 'menu-hat', title: 'Aperitivo · Music · Late', subtitle: '23 Frith Street, Soho', category: 'bar', src: photoMenuHat, alt: 'AMICA menu card and an orange fedora on a marble table in a velvet booth' },
  { id: 'menus', title: 'Good Drinks, Good Food, Good Company', subtitle: 'Aperitivo · Wine · Bar', category: 'bar', src: photoMenus, alt: 'Burgundy AMICA menus on the marble bar' },
  { id: 'cocktail', title: 'House Cocktails', subtitle: 'Served on the marble bar', category: 'drinks', src: photoCocktail, alt: 'A red cocktail on ice beside a glowing red lamp' },
  { id: 'champagne', title: 'Champagne Service', subtitle: 'Armand de Brignac on ice', category: 'drinks', src: photoChampagne, alt: 'Armand de Brignac champagne bucket under red light' },
  { id: 'gold-tier', title: 'Aperitivo Tower', subtitle: 'Chicken, bruschetta & skewers', category: 'food', src: photoGoldTier, alt: 'Three-tier stand of crispy chicken, bruschetta and chicken skewers' },
  { id: 'silver-tier', title: 'Sharing Stand', subtitle: 'Bruschetta, crispy bites & skewers', category: 'food', src: photoSilverTier, alt: 'Silver three-tier sharing stand with bruschetta and chicken skewers' },
  { id: 'salmon-tier', title: 'Smoked Salmon Rolls', subtitle: 'With cream cheese & leaves', category: 'food', src: photoSalmonTier, alt: 'Two-tier stand of smoked salmon rolls with basil and salad' },
  { id: 'mozzarella-salmon', title: 'Mozzarella & Salmon', subtitle: 'Balsamic, basil & smoked salmon', category: 'food', src: photoMozzarellaSalmon, alt: 'Two-tier stand of mozzarella with balsamic and smoked salmon skewers' },
  { id: 'cheese-board', title: 'Cheese Board', subtitle: 'Italian cheeses, dip & grapes', category: 'food', src: photoCheeseBoard, alt: 'Wooden board of cheeses with a dip and green grapes' },
  { id: 'olives', title: 'Marinated Olives', subtitle: 'Chilli, garlic & herbs', category: 'food', src: photoOlives, alt: 'Bowl of marinated green and black olives' },
];
