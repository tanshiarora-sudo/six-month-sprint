// Built-in food database — per-unit calories & protein (approximate, Indian + gym staples)
// u = display unit, c = kcal per unit, p = protein g per unit, a = aliases
window.FOODS = [
  // Eggs & breakfast
  { n: "Egg (whole, boiled)", u: "egg", c: 78, p: 6.3, a: ["egg", "eggs", "boiled egg", "whole egg"] },
  { n: "Egg white", u: "egg white", c: 17, p: 3.6, a: ["egg white", "egg whites", "white"] },
  { n: "Omelette (2-egg)", u: "omelette", c: 200, p: 13, a: ["omelette", "omelet", "masala omelette"] },
  { n: "Bread slice (white)", u: "slice", c: 70, p: 2.3, a: ["bread", "white bread", "bread slice", "toast"] },
  { n: "Brown bread slice", u: "slice", c: 75, p: 3.5, a: ["brown bread", "wheat bread", "multigrain bread"] },
  { n: "Peanut butter", u: "tbsp", c: 95, p: 4, a: ["peanut butter", "pb"] },
  { n: "Oats (cooked bowl)", u: "bowl", c: 160, p: 6, a: ["oats", "oatmeal", "masala oats"] },
  { n: "Poha", u: "plate", c: 250, p: 5, a: ["poha"] },
  { n: "Upma", u: "plate", c: 230, p: 6, a: ["upma"] },
  { n: "Idli", u: "idli", c: 60, p: 2, a: ["idli", "idlis"] },
  { n: "Dosa (plain)", u: "dosa", c: 170, p: 4, a: ["dosa", "plain dosa"] },
  { n: "Masala dosa", u: "dosa", c: 290, p: 6, a: ["masala dosa"] },
  { n: "Uttapam", u: "piece", c: 200, p: 5, a: ["uttapam"] },
  { n: "Paratha (plain)", u: "paratha", c: 180, p: 4, a: ["paratha", "plain paratha"] },
  { n: "Aloo paratha", u: "paratha", c: 290, p: 6, a: ["aloo paratha"] },
  { n: "Paneer paratha", u: "paratha", c: 320, p: 11, a: ["paneer paratha"] },
  { n: "Besan chilla", u: "chilla", c: 130, p: 6, a: ["chilla", "cheela", "besan chilla", "besan cheela"] },
  { n: "Moong dal chilla", u: "chilla", c: 120, p: 7, a: ["moong chilla", "moong dal chilla"] },
  { n: "Cornflakes with milk", u: "bowl", c: 220, p: 7, a: ["cornflakes", "corn flakes"] },
  { n: "Muesli with milk", u: "bowl", c: 250, p: 9, a: ["muesli"] },

  // Rotis & rice
  { n: "Roti / chapati", u: "roti", c: 100, p: 3, a: ["roti", "rotis", "chapati", "chapatis", "phulka", "fulka"] },
  { n: "Multigrain roti", u: "roti", c: 110, p: 4, a: ["multigrain roti", "missi roti"] },
  { n: "Naan", u: "naan", c: 260, p: 7, a: ["naan", "butter naan"] },
  { n: "Rice (cooked)", u: "bowl", c: 200, p: 4, a: ["rice", "white rice", "bowl rice", "steamed rice", "plain rice"] },
  { n: "Brown rice (cooked)", u: "bowl", c: 180, p: 4.5, a: ["brown rice"] },
  { n: "Jeera rice", u: "bowl", c: 250, p: 4.5, a: ["jeera rice"] },
  { n: "Veg pulao", u: "bowl", c: 280, p: 6, a: ["pulao", "pulav", "veg pulao"] },
  { n: "Veg biryani", u: "plate", c: 400, p: 9, a: ["veg biryani"] },
  { n: "Chicken biryani", u: "plate", c: 480, p: 25, a: ["chicken biryani", "biryani"] },
  { n: "Curd rice", u: "bowl", c: 250, p: 7, a: ["curd rice"] },
  { n: "Khichdi", u: "bowl", c: 220, p: 9, a: ["khichdi", "kichdi", "dal khichdi"] },

  // Dals & curries
  { n: "Dal (bowl)", u: "bowl", c: 150, p: 9, a: ["dal", "daal", "dal tadka", "yellow dal", "toor dal", "moong dal", "bowl dal"] },
  { n: "Dal makhani", u: "bowl", c: 280, p: 11, a: ["dal makhani"] },
  { n: "Rajma (bowl)", u: "bowl", c: 220, p: 12, a: ["rajma", "kidney beans"] },
  { n: "Chole (bowl)", u: "bowl", c: 250, p: 12, a: ["chole", "chana", "chickpea curry", "chana masala", "chickpeas"] },
  { n: "Sambar", u: "bowl", c: 130, p: 6, a: ["sambar", "sambhar"] },
  { n: "Kadhi", u: "bowl", c: 180, p: 7, a: ["kadhi"] },
  { n: "Palak paneer", u: "bowl", c: 280, p: 14, a: ["palak paneer"] },
  { n: "Paneer butter masala", u: "bowl", c: 370, p: 14, a: ["paneer butter masala", "paneer makhani"] },
  { n: "Mixed veg sabzi", u: "bowl", c: 150, p: 4, a: ["sabzi", "sabji", "mix veg", "mixed veg", "vegetable curry", "bhindi", "aloo gobi", "veg"] },
  { n: "Chicken curry", u: "bowl", c: 280, p: 24, a: ["chicken curry", "chicken gravy"] },
  { n: "Butter chicken", u: "bowl", c: 400, p: 26, a: ["butter chicken", "chicken makhani"] },
  { n: "Egg curry (2 eggs)", u: "bowl", c: 250, p: 14, a: ["egg curry", "anda curry"] },
  { n: "Fish curry", u: "bowl", c: 240, p: 22, a: ["fish curry"] },

  // Protein sources
  { n: "Paneer (100g)", u: "100g", c: 265, p: 18, a: ["paneer", "cottage cheese"] },
  { n: "Paneer bhurji (bowl)", u: "bowl", c: 290, p: 17, a: ["paneer bhurji"] },
  { n: "Tofu (100g)", u: "100g", c: 76, p: 8, a: ["tofu"] },
  { n: "Chicken breast (100g, cooked)", u: "100g", c: 165, p: 31, a: ["chicken breast", "grilled chicken", "chicken"] },
  { n: "Chicken tikka (6 pcs)", u: "plate", c: 280, p: 32, a: ["chicken tikka", "tikka"] },
  { n: "Tandoori chicken (quarter)", u: "quarter", c: 260, p: 30, a: ["tandoori chicken", "tandoori"] },
  { n: "Fish (grilled, 100g)", u: "100g", c: 150, p: 25, a: ["fish", "grilled fish"] },
  { n: "Prawns (100g, cooked)", u: "100g", c: 99, p: 24, a: ["prawns", "prawn", "shrimp", "jhinga"] },
  { n: "Chicken sausage (2 pcs)", u: "2 pcs", c: 160, p: 14, a: ["chicken sausage", "sausage"] },
  { n: "Chicken keema (bowl)", u: "bowl", c: 300, p: 25, a: ["chicken keema", "keema", "minced chicken"] },
  { n: "Mutton curry (bowl)", u: "bowl", c: 350, p: 24, a: ["mutton curry", "mutton", "lamb curry", "gosht"] },
  { n: "Soya chunks (50g dry)", u: "50g", c: 170, p: 26, a: ["soya", "soya chunks", "soybean", "soya bean"] },
  { n: "Sprouts (bowl)", u: "bowl", c: 120, p: 9, a: ["sprouts", "moong sprouts", "sprout salad"] },

  // Mushroom
  { n: "Mushroom (sautéed, 100g)", u: "100g", c: 50, p: 3.5, a: ["mushroom", "mushrooms", "sauteed mushroom", "button mushroom"] },
  { n: "Mushroom curry (bowl)", u: "bowl", c: 200, p: 7, a: ["mushroom curry", "mushroom masala", "matar mushroom", "mushroom gravy"] },
  { n: "Chicken mushroom (bowl)", u: "bowl", c: 300, p: 28, a: ["chicken mushroom", "mushroom chicken", "chicken with mushroom"] },
  { n: "Paneer mushroom (bowl)", u: "bowl", c: 320, p: 16, a: ["paneer mushroom", "mushroom paneer"] },
  { n: "Whey protein (1 scoop)", u: "scoop", c: 120, p: 15, a: ["protein shake", "whey", "protein", "whey protein", "scoop whey", "protein scoop", "shake"] },
  { n: "Protein bar", u: "bar", c: 200, p: 20, a: ["protein bar"] },
  { n: "Peanuts (30g)", u: "30g", c: 170, p: 7.5, a: ["peanuts", "groundnut", "moongfali"] },
  { n: "Almonds (10)", u: "10 pcs", c: 70, p: 2.6, a: ["almonds", "almond", "badam"] },
  { n: "Walnuts (4 halves)", u: "4 halves", c: 52, p: 1.2, a: ["walnuts", "walnut", "akhrot"] },
  { n: "Cashews (10)", u: "10 pcs", c: 90, p: 2.4, a: ["cashews", "cashew", "kaju"] },
  { n: "Chana (roasted, 30g)", u: "30g", c: 110, p: 6, a: ["roasted chana", "bhuna chana"] },
  { n: "Makhana (30g, roasted)", u: "30g", c: 105, p: 3, a: ["makhana", "fox nuts"] },

  // Dairy
  { n: "Milk (toned, glass 250ml)", u: "glass", c: 120, p: 8, a: ["milk", "glass milk", "toned milk"] },
  { n: "Milk (full cream, 250ml)", u: "glass", c: 165, p: 8.5, a: ["full cream milk", "whole milk"] },
  { n: "Curd / dahi (bowl)", u: "bowl", c: 100, p: 5.5, a: ["curd", "dahi", "yogurt", "yoghurt"] },
  { n: "Greek yogurt (100g)", u: "100g", c: 70, p: 10, a: ["greek yogurt", "greek yoghurt", "epigamia"] },
  { n: "Buttermilk (glass)", u: "glass", c: 40, p: 2.5, a: ["buttermilk", "chaas", "chhach"] },
  { n: "Lassi (sweet)", u: "glass", c: 220, p: 6, a: ["lassi", "sweet lassi"] },
  { n: "Cheese slice", u: "slice", c: 60, p: 4, a: ["cheese", "cheese slice"] },

  // Fruits & veg
  { n: "Banana", u: "banana", c: 105, p: 1.3, a: ["banana", "bananas", "kela"] },
  { n: "Apple", u: "apple", c: 95, p: 0.5, a: ["apple", "apples", "seb"] },
  { n: "Orange", u: "orange", c: 62, p: 1.2, a: ["orange", "oranges", "santra", "mosambi"] },
  { n: "Mango", u: "mango", c: 200, p: 2.8, a: ["mango", "mangoes", "aam"] },
  { n: "Papaya (bowl)", u: "bowl", c: 60, p: 0.9, a: ["papaya", "papita"] },
  { n: "Watermelon (bowl)", u: "bowl", c: 46, p: 0.9, a: ["watermelon", "tarbooz"] },
  { n: "Grapes (bowl)", u: "bowl", c: 100, p: 1, a: ["grapes", "angoor"] },
  { n: "Pomegranate (bowl)", u: "bowl", c: 120, p: 2.4, a: ["pomegranate", "anar"] },
  { n: "Salad (mixed bowl)", u: "bowl", c: 60, p: 2, a: ["salad", "green salad", "kachumber"] },
  { n: "Cucumber", u: "cucumber", c: 16, p: 0.7, a: ["cucumber", "kheera"] },
  { n: "Boiled corn (cup)", u: "cup", c: 130, p: 4.5, a: ["corn", "boiled corn", "sweet corn", "bhutta"] },
  { n: "Boiled potato", u: "potato", c: 110, p: 2.5, a: ["potato", "boiled potato", "aloo"] },
  { n: "Sweet potato (boiled)", u: "piece", c: 115, p: 2, a: ["sweet potato", "shakarkandi"] },

  // Vegetables (raw / simple cooked)
  { n: "Carrot (medium)", u: "carrot", c: 25, p: 0.6, a: ["carrot", "carrots", "gajar"] },
  { n: "Tomato", u: "tomato", c: 22, p: 1.1, a: ["tomato", "tomatoes", "tamatar"] },
  { n: "Beetroot", u: "piece", c: 42, p: 1.6, a: ["beetroot", "beet", "chukandar"] },
  { n: "Capsicum", u: "piece", c: 24, p: 1, a: ["capsicum", "bell pepper", "shimla mirch"] },
  { n: "Broccoli (steamed bowl)", u: "bowl", c: 55, p: 3.7, a: ["broccoli"] },
  { n: "Palak / spinach (cooked bowl)", u: "bowl", c: 41, p: 5, a: ["spinach", "palak", "saag"] },
  { n: "Green peas (bowl)", u: "bowl", c: 120, p: 8, a: ["peas", "matar", "green peas"] },
  { n: "Green beans (bowl)", u: "bowl", c: 44, p: 2.4, a: ["beans", "green beans", "french beans"] },
  { n: "Lauki sabzi (bowl)", u: "bowl", c: 80, p: 2, a: ["lauki", "bottle gourd", "ghiya", "doodhi"] },
  { n: "Pumpkin sabzi (bowl)", u: "bowl", c: 90, p: 2, a: ["pumpkin", "kaddu"] },
  { n: "Onion", u: "onion", c: 40, p: 1.1, a: ["onion", "pyaaz"] },
  { n: "Radish / mooli", u: "piece", c: 20, p: 0.8, a: ["radish", "mooli"] },

  // More fruits
  { n: "Kiwi", u: "kiwi", c: 42, p: 0.8, a: ["kiwi"] },
  { n: "Pear", u: "pear", c: 100, p: 0.6, a: ["pear", "nashpati"] },
  { n: "Guava", u: "guava", c: 68, p: 2.6, a: ["guava", "amrood"] },
  { n: "Pineapple (bowl)", u: "bowl", c: 82, p: 0.9, a: ["pineapple", "ananas"] },
  { n: "Strawberries (bowl)", u: "bowl", c: 50, p: 1, a: ["strawberry", "strawberries"] },
  { n: "Peach / plum", u: "piece", c: 60, p: 1, a: ["peach", "plum", "aadu", "aloo bukhara"] },
  { n: "Chikoo", u: "piece", c: 80, p: 0.7, a: ["chikoo", "chiku", "sapota"] },
  { n: "Litchi (6 pcs)", u: "6 pcs", c: 60, p: 0.7, a: ["litchi", "lychee"] },
  { n: "Muskmelon (bowl)", u: "bowl", c: 53, p: 1.3, a: ["muskmelon", "kharbuja", "melon"] },
  { n: "Blueberries (bowl)", u: "bowl", c: 85, p: 1.1, a: ["blueberries", "berries", "blueberry"] },
  { n: "Avocado (half)", u: "half", c: 120, p: 1.5, a: ["avocado"] },

  // Snacks & junk (tracked honestly)
  { n: "Samosa", u: "samosa", c: 260, p: 4, a: ["samosa", "samosas"] },
  { n: "Kachori", u: "kachori", c: 190, p: 3, a: ["kachori"] },
  { n: "Pakora (6 pcs)", u: "plate", c: 280, p: 6, a: ["pakora", "pakoda", "bhajiya"] },
  { n: "Vada pav", u: "piece", c: 290, p: 6, a: ["vada pav", "vada pao"] },
  { n: "Pav bhaji", u: "plate", c: 400, p: 9, a: ["pav bhaji"] },
  { n: "Momos (6, steamed)", u: "plate", c: 250, p: 9, a: ["momos", "momo", "steamed momos"] },
  { n: "Maggi (1 packet)", u: "packet", c: 310, p: 7, a: ["maggi", "noodles", "instant noodles"] },
  { n: "Pizza slice", u: "slice", c: 285, p: 11, a: ["pizza", "pizza slice"] },
  { n: "Burger (veg)", u: "burger", c: 350, p: 9, a: ["burger", "veg burger"] },
  { n: "Burger (chicken)", u: "burger", c: 420, p: 20, a: ["chicken burger"] },
  { n: "French fries (medium)", u: "serving", c: 340, p: 4, a: ["fries", "french fries"] },
  { n: "Sandwich (veg)", u: "sandwich", c: 250, p: 7, a: ["sandwich", "veg sandwich"] },
  { n: "Grilled chicken sandwich", u: "sandwich", c: 330, p: 22, a: ["chicken sandwich", "grilled sandwich"] },
  { n: "Biscuits (2, marie)", u: "2 pcs", c: 56, p: 1, a: ["biscuit", "biscuits", "marie"] },
  { n: "Parle-G (4)", u: "4 pcs", c: 130, p: 2, a: ["parle g", "parle-g", "parleg"] },
  { n: "Chips (small pack)", u: "pack", c: 280, p: 3, a: ["chips", "lays", "wafers"] },
  { n: "Kurkure (small pack)", u: "pack", c: 220, p: 2.5, a: ["kurkure"] },
  { n: "Protein chips (60g)", u: "pack", c: 286, p: 10, a: ["protein chips", "rite bite chips", "max protein chips"] },
  { n: "Yogabar protein bar", u: "bar", c: 220, p: 20, a: ["yogabar", "yoga bar"] },
  { n: "Bhujia / namkeen (30g)", u: "30g", c: 160, p: 3.5, a: ["bhujia", "namkeen", "sev", "mixture", "aloo bhujia"] },
  { n: "Khakhra", u: "piece", c: 120, p: 3, a: ["khakhra"] },
  { n: "Popcorn (bowl)", u: "bowl", c: 100, p: 2, a: ["popcorn"] },
  { n: "Murmura / puffed rice (bowl)", u: "bowl", c: 110, p: 2, a: ["murmura", "puffed rice", "muri"] },
  { n: "Peanut chikki", u: "piece", c: 115, p: 2.5, a: ["chikki", "peanut chikki", "gajak"] },

  // Indian street snacks
  { n: "Bhel puri (plate)", u: "plate", c: 225, p: 5, a: ["bhel", "bhel puri", "bhelpuri"] },
  { n: "Sev puri (6 pcs)", u: "plate", c: 210, p: 4, a: ["sev puri", "sevpuri"] },
  { n: "Pani puri (6 pcs)", u: "plate", c: 180, p: 3, a: ["pani puri", "panipuri", "golgappa", "gol gappa", "puchka"] },
  { n: "Aloo tikki", u: "piece", c: 150, p: 2.5, a: ["aloo tikki", "tikki"] },
  { n: "Dabeli", u: "piece", c: 280, p: 5, a: ["dabeli"] },
  { n: "Veg kathi roll", u: "roll", c: 320, p: 8, a: ["kathi roll", "veg roll", "frankie", "veg frankie"] },
  { n: "Chicken kathi roll", u: "roll", c: 400, p: 22, a: ["chicken roll", "chicken kathi roll", "chicken frankie"] },
  { n: "Spring rolls (2 pcs)", u: "plate", c: 240, p: 5, a: ["spring roll", "spring rolls"] },
  { n: "Veg cutlet (2 pcs)", u: "plate", c: 220, p: 4, a: ["cutlet", "veg cutlet"] },
  { n: "Bread pakora", u: "piece", c: 260, p: 6, a: ["bread pakora"] },
  { n: "Medu vada", u: "piece", c: 145, p: 3, a: ["medu vada", "vada"] },
  { n: "Poori", u: "piece", c: 110, p: 1.5, a: ["poori", "puri"] },
  { n: "Pav (1 pc)", u: "piece", c: 100, p: 3, a: ["pav", "ladi pav"] },
  { n: "Chole bhature (plate)", u: "plate", c: 600, p: 14, a: ["chole bhature", "chola bhatura", "bhature"] },
  { n: "Fried momos (6 pcs)", u: "plate", c: 320, p: 9, a: ["fried momos", "fried momo"] },
  { n: "Chana chaat (bowl)", u: "bowl", c: 180, p: 9, a: ["chana chaat", "chaat"] },
  { n: "Fruit chaat (bowl)", u: "bowl", c: 120, p: 1.5, a: ["fruit chaat", "fruit salad"] },
  { n: "Chocolate (small bar)", u: "bar", c: 230, p: 3, a: ["chocolate", "dairy milk", "kitkat"] },
  { n: "Ice cream (scoop)", u: "scoop", c: 140, p: 2.5, a: ["ice cream", "icecream"] },
  { n: "Gulab jamun", u: "piece", c: 150, p: 2, a: ["gulab jamun"] },
  { n: "Jalebi (100g)", u: "100g", c: 300, p: 3, a: ["jalebi"] },
  { n: "Cake slice", u: "slice", c: 270, p: 3.5, a: ["cake", "pastry"] },

  // Drinks
  { n: "Tea with milk & sugar", u: "cup", c: 60, p: 1.5, a: ["tea", "chai", "cutting chai"] },
  { n: "Tea (no sugar)", u: "cup", c: 35, p: 1.5, a: ["sugarless tea", "tea no sugar", "chai no sugar"] },
  { n: "Black coffee", u: "cup", c: 5, p: 0.3, a: ["black coffee", "americano", "espresso"] },
  { n: "Coffee with milk", u: "cup", c: 90, p: 3, a: ["coffee", "milk coffee", "cappuccino", "latte"] },
  { n: "Green tea", u: "cup", c: 2, p: 0, a: ["green tea"] },
  { n: "Coconut water", u: "glass", c: 45, p: 1.7, a: ["coconut water", "nariyal pani"] },
  { n: "Fresh juice (glass)", u: "glass", c: 120, p: 1, a: ["juice", "orange juice", "fruit juice"] },
  { n: "Cold drink (can)", u: "can", c: 140, p: 0, a: ["cold drink", "coke", "pepsi", "soft drink", "soda"] },
  { n: "Diet coke", u: "can", c: 1, p: 0, a: ["diet coke", "coke zero", "diet soda", "diet pepsi"] },
  { n: "Red Bull (250ml)", u: "can", c: 110, p: 1, a: ["red bull", "redbull", "energy drink"] },
  { n: "Red Bull Sugarfree (250ml)", u: "can", c: 13, p: 0, a: ["red bull sugarfree", "sugarfree redbull", "redbull sugar free", "sugar free red bull"] },
  { n: "ORS / electrolyte", u: "glass", c: 50, p: 0, a: ["ors", "electral", "electrolyte"] },

  // Meals & misc
  { n: "Thali (veg, standard)", u: "thali", c: 650, p: 18, a: ["thali", "veg thali"] },
  { n: "Rasam", u: "bowl", c: 60, p: 2, a: ["rasam"] },
  { n: "Soup (veg)", u: "bowl", c: 90, p: 3, a: ["soup", "veg soup", "tomato soup"] },
  { n: "Chicken soup", u: "bowl", c: 130, p: 12, a: ["chicken soup"] },
  { n: "Dhokla (2 pcs)", u: "2 pcs", c: 160, p: 5, a: ["dhokla"] },
  { n: "Ghee", u: "tsp", c: 45, p: 0, a: ["ghee"] },
  { n: "Butter", u: "tsp", c: 36, p: 0, a: ["butter"] },
  { n: "Honey", u: "tsp", c: 21, p: 0, a: ["honey"] },
  { n: "Sugar", u: "tsp", c: 16, p: 0, a: ["sugar"] },
  { n: "Dates (2)", u: "2 pcs", c: 130, p: 0.8, a: ["dates", "khajur", "date"] },
  { n: "Raisins (20g)", u: "20g", c: 60, p: 0.6, a: ["raisins", "kishmish"] },
  { n: "Chia seeds (1 tbsp)", u: "tbsp", c: 58, p: 2, a: ["chia", "chia seeds"] },
  { n: "Flax seeds (1 tbsp)", u: "tbsp", c: 55, p: 1.9, a: ["flax", "flax seeds", "alsi"] },
];

// ---- matching & parsing ----------------------------------------------------
(function () {
  const WORD_NUM = { half: 0.5, quarter: 0.25, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, dozen: 12 };
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9. ]/g, " ").replace(/\s+/g, " ").trim();
  const sing = (s) => s.replace(/(\w)s\b/g, "$1"); // crude de-pluralizer for matching

  // Built-in foods plus anything the user has saved as a custom item this device.
  const pool = () => window.FOODS.concat((window.S && window.S.customFoods) || []);

  // Remember a custom item so it shows up in search next time. Deduped by name.
  function saveCustomFood({ name, cal, p, unit }) {
    if (!window.S) return;
    const nm = String(name || "").trim();
    if (!nm) return;
    window.S.customFoods = window.S.customFoods || [];
    const key = nm.toLowerCase();
    const existing = window.S.customFoods.find((f) => f.n.toLowerCase() === key);
    const entry = { n: nm, u: unit || "serving", c: Math.round(cal) || 0, p: Math.round((p || 0) * 10) / 10, a: [key], custom: true };
    if (existing) Object.assign(existing, entry);
    else window.S.customFoods.push(entry);
    if (window.saveState) window.saveState();
  }

  function matchFood(query) {
    const q = sing(norm(query));
    if (!q) return null;
    let best = null, bestLen = 0;
    for (const f of pool()) {
      for (const alias of f.a) {
        const al = sing(norm(alias));
        if (al === q) return f; // exact alias wins immediately
        if ((q.includes(al) || al.includes(q)) && al.length > bestLen) { best = f; bestLen = al.length; }
      }
    }
    return best;
  }

  function searchFoods(query, limit = 6) {
    const q = sing(norm(query));
    if (!q) return [];
    const scored = [];
    for (const f of pool()) {
      let s = 0;
      for (const alias of f.a) {
        const al = sing(norm(alias));
        if (al === q) s = Math.max(s, 100);
        else if (al.startsWith(q)) s = Math.max(s, 80);
        else if (al.includes(q)) s = Math.max(s, 60);
      }
      if (sing(norm(f.n)).includes(q)) s = Math.max(s, 50);
      if (s) scored.push([s, f]);
    }
    return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
  }

  // "2 eggs", "1.5 bowl rice", "half roti" -> { qty, food } | null
  function parseFoodEntry(text) {
    let t = norm(text);
    let qty = 1;
    const numMatch = t.match(/^(\d+(?:\.\d+)?)\s*/);
    if (numMatch) { qty = parseFloat(numMatch[1]); t = t.slice(numMatch[0].length); }
    else {
      const first = t.split(" ")[0];
      if (WORD_NUM[first] != null) { qty = WORD_NUM[first]; t = t.split(" ").slice(1).join(" "); }
    }
    const food = matchFood(t);
    return food ? { qty, food } : null;
  }

  // emoji per food, picked by keyword (order matters)
  function emojiFor(name) {
    const n = String(name).toLowerCase();
    const rules = [
      [/egg white|omelette/, "🍳"], [/egg/, "🥚"],
      [/whey|protein shake/, "🥤"], [/protein bar/, "🍫"],
      [/chicken|tandoori|tikka/, "🍗"], [/fish/, "🐟"],
      [/paneer|cheese|tofu/, "🧀"],
      [/milk\b|full cream/, "🥛"], [/curd|dahi|yogurt|yoghurt|lassi|buttermilk|chaas/, "🥣"],
      [/roti|chapati|naan|paratha|missi/, "🫓"], [/bread|toast|sandwich/, "🍞"],
      [/rice|pulao|biryani|khichdi/, "🍚"],
      [/dal|sambar|rajma|chole|chana masala|kadhi|curry|makhani|sabzi|bhurji|soup|rasam/, "🍲"],
      [/idli|dhokla/, "🍘"], [/dosa|uttapam|chilla/, "🥞"],
      [/poha|upma|oats|muesli|cornflakes/, "🥣"],
      [/banana/, "🍌"], [/apple/, "🍎"], [/orange/, "🍊"], [/mango/, "🥭"],
      [/watermelon|muskmelon|melon/, "🍉"], [/grape/, "🍇"], [/pineapple/, "🍍"],
      [/strawberr|blueberr|litchi|chikoo|peach|plum|papaya|pomegranate|kiwi|pear|guava|fruit chaat/, "🍓"],
      [/avocado/, "🥑"], [/tomato/, "🍅"],
      [/carrot|beetroot|radish/, "🥕"],
      [/broccoli|spinach|palak|peas|green beans|lauki|pumpkin|capsicum|onion/, "🥦"],
      [/salad|cucumber/, "🥗"], [/corn|popcorn/, "🌽"], [/potato/, "🥔"],
      [/red bull|energy drink/, "⚡"],
      [/kurkure|bhujia|namkeen|khakhra|chikki|murmura|protein chips/, "🍿"],
      [/bhel|chaat|pani puri|sev puri|tikki|dabeli|kathi|frankie|cutlet|spring roll|bread pakora|chole bhature|poori|pav\b/, "🥙"],
      [/yogabar/, "🍫"],
      [/peanut|almond|walnut|cashew|makhana|raisin|dates|chia|flax|roasted chana/, "🥜"],
      [/samosa|kachori|pakora|vada|momo/, "🥟"], [/pizza/, "🍕"], [/burger/, "🍔"], [/fries/, "🍟"],
      [/maggi|noodle/, "🍜"], [/biscuit|parle/, "🍪"], [/chips/, "🍿"],
      [/chocolate/, "🍫"], [/ice cream/, "🍦"], [/cake|jamun|jalebi/, "🍰"],
      [/tea|chai/, "🍵"], [/coffee/, "☕"],
      [/juice|coconut water|ors/, "🧃"], [/cold drink|diet coke/, "🥤"],
      [/thali/, "🍱"], [/ghee|butter/, "🧈"], [/honey|sugar/, "🍯"],
      [/pav|bhaji/, "🥙"], [/soya|sprout/, "🌱"],
    ];
    for (const [re, e] of rules) if (re.test(n)) return e;
    return "🍽️";
  }

  window.FoodDB = { matchFood, searchFoods, parseFoodEntry, emojiFor, saveCustomFood };
})();
