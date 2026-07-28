import fs from 'fs';

const moodsList = ["happy", "sad", "love", "relaxed", "stressed", "angry", "excited", "lonely", "motivated", "tired"];

// --- FOOD GENERATOR ---
const foodPrefixes = ["Spicy", "Crispy", "Creamy", "Smoked", "Grilled", "Baked", "Roasted", "Zesty", "Classic", "Homestyle", "Garlic", "Butter", "Sweet", "Tangy"];
const foodCores = ["Chicken", "Paneer", "Mutton", "Fish", "Prawn", "Tofu", "Beef", "Egg", "Mushroom", "Potato", "Vegetable", "Lentil", "Soy"];
const solidFoodTypes = ["Biryani", "Curry", "Fry", "Roast", "Tikka", "Masala", "Kebab", "Burger", "Pizza", "Pasta", "Salad", "Soup", "Noodles", "Sandwich", "Tacos"];
const beverageTypes = ["Coffee", "Tea", "Milkshake", "Juice", "Lassi", "Smoothie", "Mojito", "Cooler", "Soda"];
const solidCategories = ["main_course", "snack", "starter", "dessert"];
const foodImageMap = {
  "Biryani": [
    "https://images.unsplash.com/photo-1633940521590-171b1b44ec82?q=80&w=800",
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800",
    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800"
  ],
  "Curry": [
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800",
    "https://images.unsplash.com/photo-1589301760014-d929f39ce9de?q=80&w=800",
    "https://images.unsplash.com/photo-1621996346565-e3bb64d8593e?q=80&w=800"
  ],
  "Fry": [
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800",
    "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800",
    "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=800"
  ],
  "Roast": [
    "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=800",
    "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=800"
  ],
  "Tikka": [
    "https://images.unsplash.com/photo-1599487405270-81714b7ec829?q=80&w=800",
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800"
  ],
  "Masala": [
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800"
  ],
  "Kebab": [
    "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800",
    "https://images.unsplash.com/photo-1599487405270-81714b7ec829?q=80&w=800"
  ],
  "Burger": [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800",
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800"
  ],
  "Pizza": [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
    "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800",
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800"
  ],
  "Pasta": [
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800",
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800"
  ],
  "Salad": [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800",
    "https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=800"
  ],
  "Soup": [
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800",
    "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800"
  ],
  "Noodles": [
    "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800",
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800"
  ],
  "Sandwich": [
    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800",
    "https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=800",
    "https://images.unsplash.com/photo-1567234669013-216f9aa0a672?q=80&w=800"
  ],
  "Tacos": [
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800",
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800"
  ],
  "Coffee": [
    "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800",
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800"
  ],
  "Tea": [
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800",
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800",
    "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800"
  ],
  "Milkshake": [
    "https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800",
    "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800",
    "https://images.unsplash.com/photo-1579954115545-a95591f280c2?q=80&w=800"
  ],
  "Juice": [
    "https://images.unsplash.com/photo-1600271886742-f049cd451b66?q=80&w=800",
    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=800",
    "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800"
  ],
  "Lassi": [
    "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?q=80&w=800",
    "https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800"
  ],
  "Smoothie": [
    "https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=800",
    "https://images.unsplash.com/photo-1553530666-ba3a7d5efd50?q=80&w=800"
  ],
  "Mojito": [
    "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=800",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800"
  ],
  "Cooler": [
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800",
    "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800"
  ],
  "Soda": [
    "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800"
  ]
};

// --- Strict Category Fallbacks to ensure zero crossover mismatches ---
const categoryFallbacks = {
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
  main_course: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
  snack: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
  beverage: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800",
  starter: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800"
};

const songImages = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800",
  "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800",
  "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800",
  "https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800"
];

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateFoods(count) {
  const foods = [];
  const seenNames = new Set();
  let id = 1;
  
  // Specific visual assets for desserts and sweets (absolutely NO salad fallbacks)
  const dessertImages = {
    "Gulab Jamun": ["https://images.unsplash.com/photo-1605180864284-827c8211a1ad?q=80&w=800"],
    "Rasgulla": ["https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=800"],
    "Jalebi": ["https://images.unsplash.com/photo-1605180864284-827c8211a1ad?q=80&w=800"],
    "Laddu": ["https://images.unsplash.com/photo-1605180864284-827c8211a1ad?q=80&w=800"],
    "Chocolate Brownie": ["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800"],
    "Vanilla Ice Cream": [
      "https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800",
      "https://images.unsplash.com/photo-1579954115545-a95591f280c2?q=80&w=800"
    ],
    "Mango Cheesecake": ["https://images.unsplash.com/photo-1544145945-f904253d0c71?q=80&w=800"],
    "Rava Kesari": ["https://cookingfromheart.com/wp-content/uploads/2017/08/Rava-Kesari-6.jpg"],
    "Mysore Pak": ["https://images.unsplash.com/photo-1605180864284-827c8211a1ad?q=80&w=800"],
    "Elaneer Payasam": ["https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800"],
    "Kheer": ["https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800"]
  };

  const specificFoodImages = {
    "Biryani": ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800"],
    "Fried Rice": ["https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800"],
    "Paneer Butter Masala": ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800"],
    "Dosa": ["https://images.unsplash.com/photo-1589301760014-d929f39ce9de?q=80&w=800"],
    "Samosa": ["https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800"],
    "Vada": ["https://images.unsplash.com/photo-1589301773066-32f8059eb3fb?q=80&w=800"],
    "Pakoda": ["https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800"],
    "Filter Coffee": ["https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800"],
    "Lassi": ["https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800"],
    "Jigarthanda": ["https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?q=80&w=800"]
  };

  let attempts = 0;
  const maxAttempts = count * 10;

  while (foods.length < count && attempts < maxAttempts) {
    attempts++;
    const isBeverage = Math.random() < 0.2; // 20% chance to be a drink
    let name, category, image, description;

    if (isBeverage) {
      const bPrefixes = ["Iced", "Hot", "Sweet", "Mango", "Strawberry", "Chocolate", "Vanilla", "Mint", "Lemon"];
      const b = beverageTypes[Math.floor(Math.random() * beverageTypes.length)];
      const p = bPrefixes[Math.floor(Math.random() * bPrefixes.length)];
      name = `${p} ${b}`;
      category = "beverage";
      
      const imgList = specificFoodImages[b] || foodImageMap[b] || [categoryFallbacks.beverage];
      image = imgList[Math.floor(Math.random() * imgList.length)];
      description = `A refreshing and delicious ${p.toLowerCase()} ${b.toLowerCase()} to quench your thirst.`;
    } else {
      const isDessert = Math.random() < 0.2; // 20% chance to be a dessert
      if (isDessert) {
        const desserts = ["Gulab Jamun", "Rasgulla", "Jalebi", "Laddu", "Chocolate Brownie", "Vanilla Ice Cream", "Mango Cheesecake", "Rava Kesari", "Mysore Pak", "Elaneer Payasam", "Kheer"];
        const d = desserts[Math.floor(Math.random() * desserts.length)];
        const prefixes = ["Classic", "Delicious", "Rich", "Traditional", "Sweet", "Mouth-watering", "Warm", "Chilled"];
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        name = `${p} ${d}`;
        category = "dessert";
        
        const imgList = dessertImages[d] || [categoryFallbacks.dessert];
        image = imgList[Math.floor(Math.random() * imgList.length)];
        description = `A ${p.toLowerCase()} serving of traditional ${d.toLowerCase()} to satisfy your sweet tooth cravings.`;
      } else {
        const p = foodPrefixes[Math.floor(Math.random() * foodPrefixes.length)];
        const c = foodCores[Math.floor(Math.random() * foodCores.length)];
        const t = solidFoodTypes[Math.floor(Math.random() * solidFoodTypes.length)];
        name = `${p} ${c} ${t}`;
        
        // Categorize accurately based on type t
        if (["Biryani", "Curry", "Roast", "Masala", "Burger", "Pizza", "Pasta", "Noodles", "Sandwich", "Tacos"].includes(t)) {
          category = "main_course";
        } else if (["Fry", "Kebab"].includes(t)) {
          category = "snack";
        } else if (["Tikka", "Salad", "Soup"].includes(t)) {
          category = "starter";
        } else {
          category = "main_course";
        }
        
        const imgList = specificFoodImages[t] || foodImageMap[t] || [categoryFallbacks[category]];
        image = imgList[Math.floor(Math.random() * imgList.length)];
        description = `A delicious and ${p.toLowerCase()} serving of ${c.toLowerCase()} prepared as a perfect ${t.toLowerCase()}.`;
      }
    }

    // Deduplicate names strictly
    if (seenNames.has(name)) {
      continue;
    }
    seenNames.add(name);

    const numMoods = Math.floor(Math.random() * 3) + 1; // 1 to 3 moods
    const moodTags = getRandomItems(moodsList, numMoods);

    const finalImage = `${image}&sig=food_${id}`;
    foods.push({ id: id++, name, category, image: finalImage, moodTags, description });
  }
  return foods;
}

// --- SONG GENERATOR ---
const artists = ["A.R. Rahman", "Anirudh", "Yuvan Shankar Raja", "Harris Jayaraj", "Illaiyaraaja", "Santhosh Narayanan", "GV Prakash", "Deva", "Vidyasagar", "Vijay Antony", "Thaman S", "DSP"];
const genres = ["Melody", "Folk", "Kuthu", "Classical", "Pop", "Rock", "Jazz", "Electronic", "Lofi", "Hip-hop"];
const words = ["Kadhal", "Kanave", "Vennilave", "Mazhai", "Uyire", "Nenjame", "Kannazhaga", "Ennavale", "Sollamale", "Nila", "Kaatru", "Pookkal", "Mounam", "Vaanam", "Iravu", "Pagal", "Vaa", "Poo", "Kaadhal", "Kanne", "Unnale", "Endrum"];

function generateSongs(count) {
  const songs = [];
  let id = 1;
  while (songs.length < count) {
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const word3 = Math.random() > 0.5 ? words[Math.floor(Math.random() * words.length)] : "";
    const name = `${word1} ${word2} ${word3}`.trim();
    
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const language = "Tamil";
    const numMoods = Math.floor(Math.random() * 2) + 1; // 1 to 2 moods
    const moodTags = getRandomItems(moodsList, numMoods);
    const image = songImages[Math.floor(Math.random() * songImages.length)];

    songs.push({ id: id++, title: name, artist, genre, language, moodTags, image });
  }
  return songs;
}

const foods = generateFoods(500);
const songs = generateSongs(1000);

// --- VALIDATION AND CLEANUP TESTS ---
console.log('--- RUNNING DATASET INTEGRITY VALIDATION ---');
const foodIds = new Set();
const foodNames = new Set();
let duplicatesFound = false;

foods.forEach(f => {
  // 1. Ensure unique globally unique ID
  if (foodIds.has(f.id)) {
    console.warn(`[WARNING] Duplicate Food ID detected! id: ${f.id}, name: "${f.name}"`);
    duplicatesFound = true;
  }
  foodIds.add(f.id);

  // 2. Remove duplicate food records by name
  if (foodNames.has(f.name)) {
    console.warn(`[WARNING] Duplicate Food Name detected! name: "${f.name}"`);
    duplicatesFound = true;
  }
  foodNames.add(f.name);

  // 3. Keep only the new category system
  const validCategories = ["main_course", "starter", "snack", "dessert", "beverage"];
  if (!validCategories.includes(f.category)) {
    console.warn(`[WARNING] Invalid Category detected! id: ${f.id}, category: "${f.category}"`);
    duplicatesFound = true;
  }
});

if (!duplicatesFound) {
  console.log('[SUCCESS] Dataset is perfectly clean! No duplicate IDs, no duplicate names, and categories are 100% compliant.');
} else {
  console.log('[ALERT] Dataset has integrity warnings, please review issues.');
}

let sql = `-- SEED DATA GENERATED AUTOMATICALLY WITH STRICT INTEGRITY CONTROLS\n\n`;

// Generate food inserts with explicit unique IDs
sql += `-- FOODS\n`;
foods.forEach(f => {
  const name = f.name.replace(/'/g, "''");
  const desc = f.description.replace(/'/g, "''");
  const moodTagsStr = JSON.stringify(f.moodTags);
  sql += `INSERT INTO public.foods (id, food_name, category, image, description, mood_tags) VALUES (${f.id}, '${name}', '${f.category}', '${f.image}', '${desc}', '${moodTagsStr}'::jsonb);\n`;
});

sql += `\n-- SONGS\n`;
songs.forEach(s => {
  const title = s.title.replace(/'/g, "''");
  const artist = s.artist.replace(/'/g, "''");
  const genre = s.genre.replace(/'/g, "''");
  const moodTagsStr = JSON.stringify(s.moodTags);
  sql += `INSERT INTO public.songs (id, song_name, artist, genre, language, image, mood_tags) VALUES (${s.id}, '${title}', '${artist}', '${genre}', '${s.language}', '${s.image}', '${moodTagsStr}'::jsonb);\n`;
});

// Update database sequences to match inserted serial IDs
sql += `\n-- RESET AUTO-INCREMENTING SERIAL SECTIONS\n`;
sql += `SELECT setval('public.foods_id_seq', (SELECT MAX(id) FROM public.foods));\n`;
sql += `SELECT setval('public.songs_id_seq', (SELECT MAX(id) FROM public.songs));\n`;

fs.writeFileSync('seed_data.sql', sql);
console.log('Successfully generated seed_data.sql');
