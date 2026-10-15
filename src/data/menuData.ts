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
    "name": "Olives, Darling",
    "category": "small-plates",
    "price": "4",
    "description": "Mixed olives",
    "tastingNotes": ""
  },
  {
    "id": "bruschetta-classic",
    "name": "Bruschetta al Fresco",
    "category": "small-plates",
    "price": "4",
    "description": "Tomato & basil on classic bruschetta",
    "tastingNotes": ""
  },
  {
    "id": "bruschetta-mushroom",
    "name": "Woodland Bruschetta",
    "category": "small-plates",
    "price": "5",
    "description": "Mushrooms & goat's cheese",
    "tastingNotes": ""
  },
  {
    "id": "bresaola-affair",
    "name": "The Bresaola Affair",
    "category": "small-plates",
    "price": "5",
    "description": "Bruschetta with rocket, stracciatella & bresaola",
    "tastingNotes": ""
  },
  {
    "id": "zucchini-fritte",
    "name": "Golden Zucchine Fritte",
    "category": "small-plates",
    "price": "5",
    "description": "Courgette tempura with aioli sauce",
    "tastingNotes": ""
  },
  {
    "id": "fried-mozzarella",
    "name": "Little Mozzarella Kisses",
    "category": "small-plates",
    "price": "4",
    "description": "Fried baby mozzarella",
    "tastingNotes": ""
  },
  {
    "id": "fries-benefits",
    "name": "Fries with Benefits",
    "category": "small-plates",
    "price": "4",
    "description": "Classic fries · Add truffle paste & Parmesan +1",
    "tastingNotes": ""
  },
  {
    "id": "tenderstem-broccoli",
    "name": "Broccoli with a Kick",
    "category": "small-plates",
    "price": "4",
    "description": "Tenderstem broccoli with chilli & white wine",
    "tastingNotes": ""
  },
  {
    "id": "penne-arrabbiata",
    "name": "Penne with Attitude",
    "category": "small-plates",
    "price": "5",
    "description": "Penne arrabbiata",
    "tastingNotes": ""
  },
  {
    "id": "pan-fried-brie",
    "name": "Brie Mine",
    "category": "small-plates",
    "price": "5",
    "description": "Pan-fried brie with slow-cooked pear & homemade jam",
    "tastingNotes": ""
  },
  {
    "id": "pan-fried-mushrooms",
    "name": "Midnight Mushrooms",
    "category": "small-plates",
    "price": "4",
    "description": "Pan-fried mushrooms with chilli, garlic, white wine & Parmesan",
    "tastingNotes": ""
  },
  {
    "id": "goats-cheese",
    "name": "Goat's Cheese, Please",
    "category": "small-plates",
    "price": "5",
    "description": "Toasted ciabatta, mixed salad & red onion caramel",
    "tastingNotes": ""
  },
  {
    "id": "gnocchi",
    "name": "Saucy Little Gnocchi",
    "category": "small-plates",
    "price": "5",
    "description": "Gnocchi in chilli, garlic, tomato & creamy white wine sauce",
    "tastingNotes": ""
  },
  {
    "id": "ravioli",
    "name": "Ravioli Romance",
    "category": "small-plates",
    "price": "5",
    "description": "Spinach & ricotta ravioli in creamy tomato sauce",
    "tastingNotes": ""
  },
  {
    "id": "king-prawns",
    "name": "King Prawns After Dark",
    "category": "small-plates",
    "price": "6",
    "description": "Butterflied king prawns with garlic, chilli & white wine",
    "tastingNotes": ""
  },
  {
    "id": "chicken-popcorn",
    "name": "Popcorn Chicken Crush",
    "category": "small-plates",
    "price": "5",
    "description": "Chicken popcorn with homemade vegetable sauce",
    "tastingNotes": ""
  },
  {
    "id": "chicken-satay",
    "name": "Skewered & Smitten",
    "category": "small-plates",
    "price": "5",
    "description": "Chicken skewers with dipping sauce",
    "tastingNotes": ""
  },
  {
    "id": "sicilian-arancini",
    "name": "Golden Sicilian Arancini",
    "category": "small-plates",
    "price": "4",
    "description": "Rice balls filled with beef ragù",
    "tastingNotes": ""
  },
  {
    "id": "bresaola",
    "name": "The Bresaola Trio",
    "category": "small-plates",
    "price": "6",
    "description": "Bresaola, Grana Padano, goat's cheese & fruit jam",
    "tastingNotes": ""
  },
  {
    "id": "affogato",
    "name": "Affogato Amore",
    "category": "desserts",
    "price": "5",
    "description": "Fior di latte gelato & espresso",
    "tastingNotes": ""
  },
  {
    "id": "cannolo",
    "name": "Cannoli Kisses",
    "category": "desserts",
    "price": "5",
    "description": "Sicilian cannoli with ricotta, pistachio & chocolate",
    "tastingNotes": ""
  },
  {
    "id": "tiramisu",
    "name": "Tiramisu Temptation",
    "category": "desserts",
    "price": "5",
    "description": "Classic tiramisu with espresso-soaked ladyfingers, mascarpone & cocoa",
    "tastingNotes": ""
  }
];
export const MENU_ITEMS: MenuItem[] = [...MENU_BASE, ...WINE_ITEMS];
