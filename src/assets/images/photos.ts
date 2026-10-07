// AMICA SOHO — 10 Signature Photographic Assets
import amicaEntranceDome from './amica_entrance_dome_1789585318196.jpg';
import amicaFacadeNight from './amica_facade_night_1789585172921.jpg';
import amicaCrimsonBar from './regenerated_image_1791335300586.png';
import amicaVaultBooth from './amica_vault_booth_1789585211456.jpg';
import amicaArchBooth from './amica_arch_booth_1789585228527.jpg';
import amicaOxbloodLounge from './amica_oxblood_lounge_1789585263002.jpg';
import amicaNeonLounge from './regenerated_image_1791335296225.png';
import amicaBarDisplay from './amica_bar_display_1789585281172.jpg';
import amicaMirrorSconces from './amica_mirror_sconce_1789585298658.jpg';
import amicaPowderRoom from './amica_powder_room_1789585137502.jpg';
import amicaComingSoonFacade from './regenerated_image_1790200582456.png';

export {
  amicaEntranceDome,
  amicaFacadeNight,
  amicaCrimsonBar,
  amicaVaultBooth,
  amicaArchBooth,
  amicaOxbloodLounge,
  amicaNeonLounge,
  amicaBarDisplay,
  amicaMirrorSconces,
  amicaPowderRoom,
  amicaComingSoonFacade,
};

export interface VenueGalleryImage {
  id: string;
  title: string;
  subtitle: string;
  category: 'exterior' | 'bar' | 'vaults' | 'lounge' | 'amenities';
  src: string;
  alt: string;
}

export const AMICA_PHOTOS: VenueGalleryImage[] = [
  {
    id: 'facade-night',
    title: '23 Frith Street Entrance',
    subtitle: 'Wedge Canopy & Ribbed Brass Sconces',
    category: 'exterior',
    src: amicaFacadeNight,
    alt: 'Art Deco Amica Soho Entrance at Night — 23 Frith Street, Soho London',
  },
  {
    id: 'entrance-dome',
    title: 'The Burgundy Dome Canopy',
    subtitle: 'Aperitivo • Music • Late',
    category: 'exterior',
    src: amicaEntranceDome,
    alt: 'Amica Soho Burgundy Nightlife Entrance at Night with Glowing Sconces',
  },
  {
    id: 'crimson-bar',
    title: 'The Crimson Speakeasy Bar',
    subtitle: 'Fluted Walnut Counter & Backlit Spirits',
    category: 'bar',
    src: amicaCrimsonBar,
    alt: 'Crimson LED Speakeasy Bar with Red Glow and Bartender Trolley',
  },
  {
    id: 'vault-booth',
    title: 'Barrel-Vaulted Dining Arch',
    subtitle: 'Tufted Leather & Amber Cove Glow',
    category: 'vaults',
    src: amicaVaultBooth,
    alt: 'Moody Art Deco Restaurant Vault Booth with Warm Golden Lighting',
  },
  {
    id: 'arch-booth',
    title: 'The Private Scalloped Alcove',
    subtitle: 'Burgundy Fan Wallpaper & Champagne Service',
    category: 'vaults',
    src: amicaArchBooth,
    alt: 'Moody Art Deco Speakeasy Booth with Backlit Fan Motif Wallpaper',
  },
  {
    id: 'oxblood-lounge',
    title: 'The Oxblood Cocktail Lounge',
    subtitle: 'Arched Wine Displays & Leather Chesterfield',
    category: 'lounge',
    src: amicaOxbloodLounge,
    alt: 'Oxblood Art Deco Cocktail Lounge with Golden Wine Cellar Alcoves',
  },
  {
    id: 'neon-lounge',
    title: 'Soho After Dark Neon Wall',
    subtitle: 'Cocktails & Mischief Till Late',
    category: 'lounge',
    src: amicaNeonLounge,
    alt: 'Neon Soho After Dark Lounge with Glowing Red Neon Typography Signs',
  },
  {
    id: 'bar-display',
    title: 'The Curated Back-Bar Cabinet',
    subtitle: 'Mercury Glass & Vintage Coupe Collection',
    category: 'bar',
    src: amicaBarDisplay,
    alt: 'Art Deco Cocktail Lounge Display with Illuminated Mirrored Shelves',
  },
  {
    id: 'mirror-sconces',
    title: 'Deep Midnight Wall & Pivot Mirror',
    subtitle: 'Fluted Tube Sconces & Amber Reflections',
    category: 'amenities',
    src: amicaMirrorSconces,
    alt: 'Moody Brass Mirror and Fluted Sconces against Midnight Blue Wall',
  },
  {
    id: 'powder-room',
    title: 'The Art Deco Powder Room',
    subtitle: 'Burgundy Ginkgo Motif & Polished Brass Fixtures',
    category: 'amenities',
    src: amicaPowderRoom,
    alt: 'Art Deco Burgundy Powder Room with Fan Pattern Wallpaper and Brass Sconces',
  },
];
