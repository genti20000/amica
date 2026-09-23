import { PrivateHirePackage } from '../types';

export const VENUE_INFO = {
  name: 'AMICA SOHO',
  locationName: 'Soho, London',
  address: '23 Frith Street, Soho, London W1D 4RR',
  neighbourhood: 'Soho, West End',
  nearestTubes: ['Tottenham Court Road (3 mins)', 'Leicester Square (4 mins)', 'Piccadilly Circus (6 mins)'],
  openingHours: [
    { days: 'Tuesday – Thursday', hours: '17:00 – 00:00' },
    { days: 'Friday', hours: '16:30 – 01:30' },
    { days: 'Saturday', hours: '16:00 – 01:30' },
    { days: 'Sunday', hours: '16:00 – 23:00' },
    { days: 'Monday', hours: 'Closed for Private Vault Hire' }
  ],
  contactEmail: 'reservations@amicasoho.com',
  phone: '+44 20 7437 2323',
  instagram: '@amicasoho',
  description: 'Marked by its iconic burgundy curved awning and amber reeded doors at 23 Frith Street, AMICA SOHO is an intimate subterranean cocktail bar, music lounge, and private nocturnal haven in the heart of London. Celebrating bespoke aperitivi, rare spirits, artisanal cicchetti, and late-night vinyl soundscapes in candlelit brick vaults.',
  heritageNotes: 'Behind the brass plaque and fluted amber doors of 23 Frith Street, AMICA SOHO blends nocturnal West End hedonism with the timeless aperitivo ritual. By pairing cask-aged spirits, analog vinyl jazz, and hand-carved Venetian cicchetti, AMICA SOHO offers an unhurried sanctuary where cocktails, music, and conversation thrive late into the night.',
};

export const PRIVATE_HIRE_PACKAGES: PrivateHirePackage[] = [
  {
    id: 'vault-alcove',
    title: 'The Vault Alcove at AMICA SOHO',
    capacity: 'Up to 14 Guests (Seated / Semi-Private)',
    minimumSpend: 'From £500',
    description: 'An intimate arched brick vault lined with rare wine bottles and soft leather seating beneath 23 Frith Street. Perfect for birthday aperitivi, celebrations, or private tastings.',
    includes: [
      'Dedicated host & sommelier',
      'Welcome round of AMICA Soho Signature Spritzes',
      'Artisanal Charcuterie & Cicchetti Sharing Boards',
      'Custom vinyl background music playback'
    ],
    recommendedFor: 'Intimate birthdays, cocktail lovers & small gatherings'
  },
  {
    id: 'full-basement-buyout',
    title: 'Full AMICA SOHO Venue Buyout',
    capacity: 'Up to 60 Standing / 40 Seated',
    minimumSpend: 'From £2,000 (Weekdays) / £3,500 (Weekends)',
    description: 'Exclusive hire of the entire subterranean AMICA SOHO venue. Complete access to the main bar, cocktail lounge, vault alcoves, DJ booth, and private Frith Street entry.',
    includes: [
      'Exclusive private venue entry on Frith Street beneath the AMICA SOHO awning',
      'Custom cocktail bar setup & sommelier team',
      'Unlimited seasonal cicchetti, hot small plates & dessert bites',
      'Full analog DJ setup & sound system access',
      'Bespoke menu printing with corporate or personal branding'
    ],
    recommendedFor: 'Milestone celebrations, brand launches & private late-night parties'
  },
  {
    id: 'masterclass-package',
    title: 'AMICA SOHO Cocktail & Vermouth Masterclass',
    capacity: '10 to 25 Guests',
    minimumSpend: '£55.00 per person',
    description: 'A 90-minute interactive workshop guided by our Head Bartender. Guests craft bespoke cocktails and blend their own barrel-aged vermouth bottle to take home.',
    includes: [
      'Guided tasting of rare vermouths & amari',
      'Hands-on cocktail mixing workstations',
      'Take-home personalized 200ml blended vermouth bottle',
      'Paired artisan cheese & prosciutto platters'
    ],
    recommendedFor: 'Team celebrations, special gatherings & cocktail enthusiasts'
  }
];
