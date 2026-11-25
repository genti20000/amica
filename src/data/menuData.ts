import { MenuItem } from '../types';
import { WINE_ITEMS } from './wineData';
// Transcribed from the user’s final cocktail PDF and supplied food-menu images.
const MENU_BASE: MenuItem[] = [
  {
    "id": "ex-factor",
    "name": "The Ex Factor",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Gin · Passion Fruit · Sloe Gin · Tonic · Lemon",
    "tastingNotes": "Bright. Juicy. A little dangerous."
  },
  {
    "id": "little-miss-perfect",
    "name": "Little Miss Perfect",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Vodka · Sauvignon Blanc · Elderflower · Mint · Lemon",
    "tastingNotes": "Cool, crisp and effortlessly elegant."
  },
  {
    "id": "izzy-picante",
    "name": "Izzy Picante",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Tequila · Agave · Lime · Spices · Red Bull Peach Edition",
    "tastingNotes": "Sweet heat with a little attitude."
  },
  {
    "id": "lucy-colada",
    "name": "Lucy Colada",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Spiced Rum · Lychee · Lime · Coconut",
    "tastingNotes": "Tropical, silky and seriously easy to love."
  },
  {
    "id": "sophie-in-soho",
    "name": "Sophie in Soho",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Hendrick’s Gin · Cucumber · Lemon",
    "tastingNotes": "Fresh, cool and made for Soho nights."
  },
  {
    "id": "peachy-pamela",
    "name": "Peachy Pamela",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Jack Daniel’s No. 7 · Peach · Lemon",
    "tastingNotes": "Smooth, peachy and dangerously refreshing."
  },
  {
    "id": "dirty-diana",
    "name": "Dirty Diana",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Mezcal · Martini Rosso · Campari",
    "tastingNotes": "Smoky. Bitter. Beautifully bad."
  },
  {
    "id": "deep-rum-debbie",
    "name": "Deep Rum Debbie",
    "category": "cocktails",
    "price": "£14.90",
    "description": "Bacardi Oro · Carta Blanca · Almond · Orange · Pineapple",
    "tastingNotes": "Tropical romance in a glass."
  },
  {
    "id": "olivia-old-fashioned",
    "name": "Olivia Old Fashioned",
    "category": "cocktails",
    "price": "£15.50",
    "description": "Woodford Reserve · Orange Bitters · Angostura · Brown Sugar",
    "tastingNotes": "Old school. Never out of style. Allow 5–7 minutes."
  },
  {
    "id": "espresso-emily",
    "name": "Espresso Emily",
    "category": "cocktails",
    "price": "£15.50",
    "description": "Diplomático Rum · Espresso · Kahlúa",
    "tastingNotes": "Dark, smooth and made for after midnight."
  },
  {
    "id": "holly-bloom",
    "name": "Holly Bloom",
    "category": "spritz",
    "price": "£14.50",
    "description": "Elderflower · Mint · Prosecco",
    "tastingNotes": "Floral. Fresh. Effortlessly cool."
  },
  {
    "id": "rosa-sarti",
    "name": "Rosa Sarti",
    "category": "spritz",
    "price": "£14.50",
    "description": "Sarti Rosa · Prosecco · Soda",
    "tastingNotes": "Fruity, floral and beautifully pink."
  },
  {
    "id": "aperol-olivia",
    "name": "Aperol Olivia",
    "category": "spritz",
    "price": "£14.50",
    "description": "Aperol · Prosecco · Soda",
    "tastingNotes": "The one everyone knows. The one everyone loves."
  },
  {
    "id": "campari-carla",
    "name": "Campari Carla",
    "category": "spritz",
    "price": "£14.50",
    "description": "Campari · Prosecco · Soda",
    "tastingNotes": "Bitter. Bold. Italian."
  },
  {
    "id": "shirley-temple",
    "name": "Shirley Temple",
    "category": "zero",
    "price": "£7.00",
    "description": "Grenadine · Lime · Ginger Ale",
    "tastingNotes": "Sweet, sparkling and iconic."
  },
  {
    "id": "minty-molly",
    "name": "Minty Molly",
    "category": "zero",
    "price": "£7.00",
    "description": "Mint · Lime · Apple · Soda",
    "tastingNotes": "Fresh. Clean. No regrets."
  },
  {
    "id": "passionate-amy",
    "name": "Passionate Amy",
    "category": "zero",
    "price": "£7.00",
    "description": "Apple · Passion Fruit · Lime · Agave",
    "tastingNotes": "Tropical, bright and full of flavour."
  },
  {
    "id": "olives",
    "name": "Mixed olives",
    "category": "small-plates",
    "price": "£4",
    "description": "Mixed olives",
    "tags": [
      "VG",
      "DF"
    ]
  },
  {
    "id": "fries",
    "name": "Fries",
    "category": "small-plates",
    "price": "£4",
    "description": "Fries",
    "tags": [
      "VG"
    ]
  },
  {
    "id": "truffle-parmesan-fries",
    "name": "Truffle and Parmesan fries",
    "category": "small-plates",
    "price": "£5",
    "description": "Truffle and Parmesan fries",
    "tags": [
      "V"
    ]
  },
  {
    "id": "padron-peppers",
    "name": "Padron peppers",
    "category": "small-plates",
    "price": "£5",
    "description": "Padron peppers",
    "tags": [
      "VG"
    ]
  },
  {
    "id": "bruschetta-classic",
    "name": "Classic bruschetta",
    "category": "small-plates",
    "price": "£4",
    "description": "Tomato, basil, red onion and seasoning",
    "tags": [
      "VG",
      "DF"
    ]
  },
  {
    "id": "bruschetta-mushroom-goat-cheese",
    "name": "Mushroom and goat’s cheese bruschetta",
    "category": "small-plates",
    "price": "£5",
    "description": "Pan-seared mushrooms, goat’s cheese, cherry tomatoes and truffle seasoning",
    "tags": [
      "V"
    ]
  },
  {
    "id": "burrata",
    "name": "Burrata",
    "category": "small-plates",
    "price": "£6",
    "description": "Burratina served with rocket salad, cherry tomatoes and Italian seasoning",
    "tags": [
      "V"
    ]
  },
  {
    "id": "zucchini-fritti",
    "name": "Zucchini fritti",
    "category": "small-plates",
    "price": "£5",
    "description": "Courgette tempura served with aioli sauce and Parmesan shavings",
    "tags": [
      "V"
    ]
  },
  {
    "id": "tenderstem-broccoli",
    "name": "Tenderstem broccoli",
    "category": "small-plates",
    "price": "£4",
    "description": "Steamed in garlic and butter sauce",
    "tags": [
      "V",
      "GF"
    ]
  },
  {
    "id": "penne-arrabbiata",
    "name": "Penne arrabbiata",
    "category": "small-plates",
    "price": "£5",
    "description": "Penne pasta cooked in tomato, chilli and garlic sauce",
    "tags": [
      "VG",
      "DF"
    ]
  },
  {
    "id": "pan-seared-mushrooms",
    "name": "Pan-seared mushrooms",
    "category": "small-plates",
    "price": "£5",
    "description": "In garlic, chilli and white wine sauce",
    "tags": [
      "VG",
      "DF"
    ]
  },
  {
    "id": "deep-fried-brie",
    "name": "Deep-fried brie",
    "category": "small-plates",
    "price": "£6",
    "description": "Served with homemade jam",
    "tags": [
      "V"
    ]
  },
  {
    "id": "burrata-pinca",
    "name": "Burrata Pinca",
    "category": "small-plates",
    "price": "£6",
    "description": "Neapolitan pinca with seasoned tomato sauce and burrata cheese",
    "tags": [
      "V"
    ]
  },
  {
    "id": "gnocchi",
    "name": "Gnocchi",
    "category": "small-plates",
    "price": "£5",
    "description": "Cooked in chilli, garlic, tomato and creamy white wine sauce",
    "tags": [
      "V"
    ]
  },
  {
    "id": "spinach-ricotta-ravioli",
    "name": "Spinach and ricotta ravioli",
    "category": "small-plates",
    "price": "£7",
    "description": "Served in creamy tomato sauce",
    "tags": [
      "V"
    ]
  },
  {
    "id": "calamari-fritti",
    "name": "Calamari fritti",
    "category": "small-plates",
    "price": "£7",
    "description": "Served with homemade tartare sauce",
    "tags": [
      "DF"
    ]
  },
  {
    "id": "butterflied-king-prawns",
    "name": "Butterflied king prawns",
    "category": "small-plates",
    "price": "£9",
    "description": "In garlic, chilli and white wine sauce",
    "tags": [
      "GF"
    ]
  },
  {
    "id": "beef-tagliata",
    "name": "Beef tagliata",
    "category": "small-plates",
    "price": "£9.90",
    "description": "Sliced rib-eye steak, rocket and shaved Parmesan",
    "tags": [
      "GF"
    ]
  },
  {
    "id": "lamb-cutlets",
    "name": "Lamb cutlets",
    "category": "small-plates",
    "price": "£9.90",
    "description": "Pan-seared with rosemary seasoning",
    "tags": [
      "GF",
      "DF"
    ]
  },
  {
    "id": "cheese-meat-platter",
    "name": "Cheese & meat platter",
    "category": "small-plates",
    "price": "£9.90",
    "description": "Bresaola, Gorgonzola, goat’s cheese and Grana Padano, served with toasted ciabatta and rocket",
    "tags": [
      "ASK"
    ]
  },
  {
    "id": "goats-cheese-salad",
    "name": "Goat’s cheese salad",
    "category": "small-plates",
    "price": "£7",
    "description": "Served with mixed salad and Italian dressing",
    "tags": [
      "V"
    ]
  },
  {
    "id": "affogato",
    "name": "Affogato",
    "category": "desserts",
    "price": "£5",
    "description": "Fior di latte gelato, espresso and cantuccine almond biscuit",
    "tags": [
      "V"
    ]
  },
  {
    "id": "classic-tiramisu",
    "name": "Classic tiramisu",
    "category": "desserts",
    "price": "£5",
    "description": "Espresso-soaked ladyfingers, creamy mascarpone and a dusting of cocoa",
    "tags": [
      "V"
    ]
  }
];
export const MENU_ITEMS: MenuItem[] = [...MENU_BASE, ...WINE_ITEMS];
