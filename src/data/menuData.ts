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
    "price": "4",
    "description": "Mixed olives",
    "tastingNotes": ""
  },
  {
    "id": "bruschetta-classic",
    "name": "Classic bruschetta",
    "category": "small-plates",
    "price": "4",
    "description": "With tomato and basil",
    "tastingNotes": ""
  },
  {
    "id": "bruschetta-mushroom",
    "name": "Mushroom and goat’s cheese bruschetta",
    "category": "small-plates",
    "price": "5",
    "description": "Mushroom and goat’s cheese",
    "tastingNotes": ""
  },
  {
    "id": "bresaola-affair",
    "name": "Bruschetta",
    "category": "small-plates",
    "price": "5",
    "description": "Rocket, stracciatella cheese & bresaola (cured beef)",
    "tastingNotes": ""
  },
  {
    "id": "zucchini-fritte",
    "name": "Zucchini fritti",
    "category": "small-plates",
    "price": "5",
    "description": "Courgette tempura with aioli sauce",
    "tastingNotes": ""
  },
  {
    "id": "fries-benefits",
    "name": "Fries",
    "category": "small-plates",
    "price": "4",
    "description": "Add truffle paste and Parmesan +1",
    "tastingNotes": ""
  },
  {
    "id": "tenderstem-broccoli",
    "name": "Tenderstem broccoli",
    "category": "small-plates",
    "price": "4",
    "description": "With chilli and white wine",
    "tastingNotes": ""
  },
  {
    "id": "penne-arrabbiata",
    "name": "Penne arrabbiata",
    "category": "small-plates",
    "price": "5",
    "description": "Penne pasta cooked in tomato, chilli and garlic sauce",
    "tastingNotes": ""
  },
  {
    "id": "pan-fried-mushrooms",
    "name": "Pan-seared mushrooms",
    "category": "small-plates",
    "price": "4",
    "description": "In garlic, chilli and white wine sauce",
    "tastingNotes": ""
  },
  {
    "id": "pan-fried-brie",
    "name": "Pan-fried brie",
    "category": "small-plates",
    "price": "5",
    "description": "Served with slow-cooked pear and homemade jam",
    "tastingNotes": ""
  },
  {
    "id": "goats-cheese",
    "name": "Goat’s cheese",
    "category": "small-plates",
    "price": "5",
    "description": "Served with toasted ciabatta, mixed salad and red onion caramel",
    "tastingNotes": ""
  },
  {
    "id": "gnocchi",
    "name": "Gnocchi",
    "category": "small-plates",
    "price": "5",
    "description": "Cooked in chilli, garlic, tomato and creamy white wine sauce",
    "tastingNotes": ""
  },
  {
    "id": "ravioli",
    "name": "Spinach and ricotta ravioli",
    "category": "small-plates",
    "price": "5",
    "description": "Served in creamy tomato sauce",
    "tastingNotes": ""
  },
  {
    "id": "calamari",
    "name": "Calamari fritti",
    "category": "small-plates",
    "price": "6",
    "description": "Served with homemade tartare sauce",
    "tastingNotes": ""
  },
  {
    "id": "king-prawns",
    "name": "Butterflied king prawns",
    "category": "small-plates",
    "price": "6",
    "description": "In garlic, chilli and white wine sauce",
    "tastingNotes": ""
  },
  {
    "id": "chicken-popcorn",
    "name": "Chicken popcorn",
    "category": "small-plates",
    "price": "5",
    "description": "Served with homemade vegetable sauce",
    "tastingNotes": ""
  },
  {
    "id": "chicken-satay",
    "name": "Chicken skewers",
    "category": "small-plates",
    "price": "5",
    "description": "Served with dipping sauce",
    "tastingNotes": ""
  },
  {
    "id": "bresaola",
    "name": "Cheese & meat platter",
    "category": "small-plates",
    "price": "8",
    "description": "Bresaola, Gorgonzola, goat’s cheese and Grana Padano, served with toasted ciabatta and rocket",
    "tastingNotes": ""
  },
  {
    "id": "affogato",
    "name": "Affogato",
    "category": "desserts",
    "price": "5",
    "description": "Fior di latte gelato, espresso",
    "tastingNotes": ""
  },
  {
    "id": "tiramisu",
    "name": "Classic tiramisu",
    "category": "desserts",
    "price": "5",
    "description": "Espresso-soaked ladyfingers, creamy mascarpone and a dusting of cocoa",
    "tastingNotes": ""
  }
];
export const MENU_ITEMS: MenuItem[] = [...MENU_BASE, ...WINE_ITEMS];
