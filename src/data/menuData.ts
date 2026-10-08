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
    "name": "Olives",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "bruschetta-classic",
    "name": "Bruschetta Classic",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "French stick",
    "tastingNotes": ""
  },
  {
    "id": "patattini-fritte",
    "name": "Patattini Fritte",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "Or with tartufo",
    "tastingNotes": ""
  },
  {
    "id": "bruschetta-mushroom",
    "name": "Bruschetta Mushroom and Goat’s Cheese",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "French stick",
    "tastingNotes": ""
  },
  {
    "id": "zucchini-fritte",
    "name": "Zucchini Fritte",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "Courgette tempura with aioli sauce",
    "tastingNotes": ""
  },
  {
    "id": "fried-mozzarella",
    "name": "Fried Baby Mozzarella",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "tenderstem-broccoli",
    "name": "Tenderstem Broccoli",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "With garlic and chilli",
    "tastingNotes": ""
  },
  {
    "id": "caprese-salad",
    "name": "Caprese Salad",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "penne-arrabbiata",
    "name": "Penne Arrabbiata",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "ricotta-gnudi",
    "name": "Fried Ricotta & Herb Gnudi",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "Calabrian chilli marmellata",
    "tastingNotes": ""
  },
  {
    "id": "pan-fried-brie",
    "name": "Pan-Fried Brie",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "With slow-cooked pear and homemade jam",
    "tastingNotes": ""
  },
  {
    "id": "pan-fried-mushrooms",
    "name": "Pan-Fried Mushrooms",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "With chilli, garlic, white wine and Parmesan cheese",
    "tastingNotes": ""
  },
  {
    "id": "goats-cheese",
    "name": "Goat’s Cheese",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "With toasted ciabatta, mixed salad and red onion caramel",
    "tastingNotes": ""
  },
  {
    "id": "gnocchi",
    "name": "Gnocchi",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "Cooked in chilli, garlic, tomato and white wine sauce",
    "tastingNotes": ""
  },
  {
    "id": "ravioli",
    "name": "Spinach and Ricotta Ravioli",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "Served in smoked salmon and creamy tomato sauce",
    "tastingNotes": ""
  },
  {
    "id": "king-prawns",
    "name": "Butterflied King Prawns",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "In garlic, chilli and white wine sauce",
    "tastingNotes": ""
  },
  {
    "id": "chicken-popcorn",
    "name": "Chicken Popcorn",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "With homemade salsa sauce",
    "tastingNotes": ""
  },
  {
    "id": "chicken-satay",
    "name": "Chicken Satay",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "With dipping sauce",
    "tastingNotes": ""
  },
  {
    "id": "sicilian-arancini",
    "name": "Sicilian Arancini",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "Rice balls filled with beef ragù",
    "tastingNotes": ""
  },
  {
    "id": "bresaola",
    "name": "Bresaola e Foglie Amare",
    "category": "small-plates",
    "price": "3 for £10",
    "description": "Cured beef, Italian bitter leaves, focaccia croutons, Parmigiano Reggiano dressing",
    "tastingNotes": ""
  },
  {
    "id": "complimentary-olives",
    "name": "Olives",
    "category": "complimentary",
    "price": "Complimentary",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "complimentary-bruschetta-classic",
    "name": "Bruschetta Classic",
    "category": "complimentary",
    "price": "Complimentary",
    "description": "French stick",
    "tastingNotes": ""
  },
  {
    "id": "complimentary-bruschetta-mushroom",
    "name": "Bruschetta Mushroom and Goat’s Cheese",
    "category": "complimentary",
    "price": "Complimentary",
    "description": "French stick",
    "tastingNotes": ""
  },
  {
    "id": "complimentary-zucchini-fritte",
    "name": "Zucchini Fritte",
    "category": "complimentary",
    "price": "Complimentary",
    "description": "Courgette tempura with aioli sauce",
    "tastingNotes": ""
  },
  {
    "id": "pistachio-ice-cream",
    "name": "Pistachio Ice Cream",
    "category": "desserts",
    "price": "",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "fior-di-latte-ice-cream",
    "name": "Fior di Latte Ice Cream",
    "category": "desserts",
    "price": "",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "lime-ice-cream",
    "name": "Lime Ice Cream",
    "category": "desserts",
    "price": "",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "passionfruit-ice-cream",
    "name": "Passionfruit Ice Cream",
    "category": "desserts",
    "price": "",
    "description": "",
    "tastingNotes": ""
  },
  {
    "id": "affogato",
    "name": "Affogato",
    "category": "desserts",
    "price": "",
    "description": "Fior di Latte gelato, espresso",
    "tastingNotes": ""
  },
  {
    "id": "cannolo",
    "name": "Cannolo Siciliano con Ricotta, Pistachio e Cioccolato",
    "category": "desserts",
    "price": "",
    "description": "Sicilian cannolo, ricotta, pistachio, chocolate",
    "tastingNotes": ""
  },
  {
    "id": "tiramisu",
    "name": "Tiramisu",
    "category": "desserts",
    "price": "",
    "description": "",
    "tastingNotes": ""
  }
];
export const MENU_ITEMS: MenuItem[] = [...MENU_BASE, ...WINE_ITEMS];
