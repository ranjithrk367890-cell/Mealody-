/**
 * foodImageMap.ts
 * Comprehensive keyword-to-image mapping for accurate food image selection.
 * Each food type has a dedicated array of relevant images.
 * 
 * RULES:
 * - Keywords are checked in ORDER of specificity (most specific first)
 * - Images in each array are all verified to show the correct food type
 * - Category fallbacks are used only when no keyword match is found
 * - DO NOT change IDs, moods, categories, or SQL schema
 */

// ─────────────────────────────────────────────
// DEDICATED IMAGE POOLS BY FOOD TYPE
// ─────────────────────────────────────────────

const images = {

  // ── BIRYANI / RICE DISHES ──────────────────
  biryani: [
    'https://images.unsplash.com/photo-1633940521590-171b1b44ec82?q=80&w=800',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800',
  ],

  // ── CURRY / MASALA ─────────────────────────
  curry: [
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800',
    'https://images.unsplash.com/photo-1545247181-516773cae754?q=80&w=800',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=800',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800',
  ],

  // ── PIZZA ──────────────────────────────────
  pizza: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800',
    'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=800',
  ],

  // ── BURGER ─────────────────────────────────
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800',
    'https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?q=80&w=800',
  ],

  // ── SOUP ───────────────────────────────────
  soup: [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800',
    'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?q=80&w=800',
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=800',
    'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=800',
  ],

  // ── SALAD ──────────────────────────────────
  salad: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
    'https://images.unsplash.com/photo-1532009324734-20a7a5813719?q=80&w=800',
  ],

  // ── PASTA / NOODLES ────────────────────────
  pasta: [
    'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?q=80&w=800',
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800',
  ],
  noodles: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=800',
    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=800',
  ],

  // ── SANDWICH / WRAP ────────────────────────
  sandwich: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800',
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=800',
  ],

  // ── TACOS ──────────────────────────────────
  tacos: [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800',
  ],

  // ── DOSA ───────────────────────────────────
  dosa: [
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800',
    'https://images.unsplash.com/photo-1640574978748-1d1d8b4e02db?q=80&w=800',
    'https://images.unsplash.com/photo-1589301760014-d929f39ce9de?q=80&w=800',
  ],

  // ── IDLI / VADA ────────────────────────────
  idli: [
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=800',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800',
  ],
  vada: [
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
  ],
  bonda: [
    '/mysore_bonda.png',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
  ],
  murukku: [
    '/crispy_murukku.png',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
  ],
  bhaji: [
    '/onion_bhaji.png',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
  ],

  // ── PONGAL / UPMA / KITCHARI ───────────────
  pongal: [
    'https://images.unsplash.com/photo-1589301760014-d929f39ce9de?q=80&w=800',
  ],
  upma: [
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=800',
  ],
  kitchari: [
    'https://images.unsplash.com/photo-1523987355523-c7b5b6f3c32b?q=80&w=800',
  ],

  // ── RICE DISHES ────────────────────────────
  rice: [
    'https://images.unsplash.com/photo-1512058556646-c4da40fba323?q=80&w=800',
    'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?q=80&w=800',
    'https://images.unsplash.com/photo-1549194388-d0d18d3e3a33?q=80&w=800',
  ],
  rasam: [
    'https://images.unsplash.com/photo-1589308078055-2857fc9dbf5b?q=80&w=800',
  ],
  curd: [
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800',
  ],

  // ── CHICKEN / MEAT ─────────────────────────
  chicken: [
    'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=800',
    'https://images.unsplash.com/photo-1598515214200-17c4ed87eef5?q=80&w=800',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800',
  ],
  tikka: [
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800',
    'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=800',
  ],
  kebab: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800',
  ],
  mutton: [
    'https://images.unsplash.com/photo-1545247181-516773cae754?q=80&w=800',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=800',
  ],

  // ── FISH / SEAFOOD ─────────────────────────
  fish: [
    'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800',
    'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?q=80&w=800',
  ],

  // ── PANEER ─────────────────────────────────
  paneer: [
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=800',
  ],
  creamymushroomroast: [
    'https://static.vecteezy.com/system/resources/thumbnails/075/142/959/small/creamy-mushroom-soup-bowl-gourmet-foodgraphy-photo.jpg',
  ],
  grilledbeefroast: [
    'https://t4.ftcdn.net/jpg/19/89/75/07/360_F_1989750796_Vdddg0nu7QIs66jtpTJzEY2kWbCEqAoA.jpg',
  ],
  grilledeggfry: [
    'https://www.sidechef.com/recipe/61730681-cd97-4264-953a-e90605f67599.jpg?d=1408x1120',
  ],
  crispyprawnbiryani: [
    'https://vismaifood.com/storage/app/uploads/public/0ae/185/cba/thumb__1200_0_0_0_auto.jpg',
  ],
  roastedchickenmasala: [
    'https://ichef.bbc.co.uk/ace/standard/1600/food/recipes/whole_roasted_masala_77631_16x9.jpg.webp',
  ],

  // ── PARATHA / ROTI / NAN ───────────────────
  paratha: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800',
  ],
  roti: [
    'https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?q=80&w=800',
  ],

  // ── SAMOSA / PUFFS ─────────────────────────
  samosa: [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
    'https://images.unsplash.com/photo-1626132647523-66c34d30a84d?q=80&w=800',
  ],

  // ── FRENCH FRIES ───────────────────────────
  fries: [
    'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=800',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800',
  ],

  // ── SHAWARMA / ROLL ────────────────────────
  shawarma: [
    'https://images.unsplash.com/photo-1561050501-8b4ade44f6b5?q=80&w=800',
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=800',
  ],

  // ── NACHOS ─────────────────────────────────
  nachos: [
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=800',
  ],

  // ─────────────────────────────────────────────
  // DESSERTS — NO SALAD/SAVORY IMAGES ALLOWED
  // ─────────────────────────────────────────────

  // ── GULAB JAMUN ────────────────────────────
  gulab: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTekGwxsZ1t-btZIi94EpFc0z9iffl9JkD_uw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTekGwxsZ1t-btZIi94EpFc0z9iffl9JkD_uw&s',
  ],

  // ── RASGULLA ───────────────────────────────
  rasgulla: [
    'https://i.pinimg.com/474x/37/cb/d5/37cbd5945b0947a3d48e99e4ca6622b8.jpg',
  ],

  // ── JALEBI ─────────────────────────────────
  jalebi: [
    'https://t4.ftcdn.net/jpg/09/76/94/83/360_F_976948359_rtVBTuf4BroTySr70mvosOlrA5etCO6v.jpg',
  ],

  // ── LADDU / LADDOO ─────────────────────────
  laddu: [
    'https://t4.ftcdn.net/jpg/05/95/86/23/360_F_595862367_Mq2DESdDGSeEyDEvY5swpZsDz8lXQ9DX.jpg',
  ],

  // ── KESARI / HALWA ─────────────────────────
  kesari: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ37BBVifwTTZsN5BgiXM7cIYJU7ITM_HZR_w&s',
  ],
  halwa: [
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800',
  ],

  // ── KHEER / PAYASAM ────────────────────────
  kheer: [
    'https://images.unsplash.com/photo-1571167366136-b57e069a1b86?q=80&w=800',
  ],
  payasam: [
    'https://images.unsplash.com/photo-1571167366136-b57e069a1b86?q=80&w=800',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800',
  ],

  // ── ICE CREAM ──────────────────────────────
  icecream: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=800',
    'https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=800',
  ],

  // ── JIGARTHANDA ────────────────────────────
  jigarthanda: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvi22Zh1mbBQKCgndFQxWL33r1VIclYHdAqQ&s',
  ],

  // ── KULFI ──────────────────────────────────
  kulfi: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzDXp7RK5wdj8ixRy-3g45Ithb6LGGkFIyUA&s',
  ],

  // ── PAAL PAYASAM ───────────────────────────
  paalpayasam: [
    'https://thumbs.dreamstime.com/b/delicious-payasam-kerala-cuisine-homemade-98980037.jpg',
  ],

  // ── SWEET TOFU SALAD ───────────────────────
  sweettofusalad: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAVqyDuGRmNC06lv_vkjtLS6GkCkphQHC5QA&s',
  ],

  // ── SWEET CHICKEN CURRY ────────────────────
  sweetchickencurry: [
    'https://www.shutterstock.com/image-photo/homemade-chicken-curry-pan-wooden-600nw-2476480287.jpg',
  ],

  // ── GRILLED VEGETABLE SALAD ────────────────
  grilledvegetablesalad: [
    'https://heatherchristo.com/wp-content/uploads/2016/08/Grilled-Vegetable-Salad-with-Roasted-Tomato-Vinaigrette-from-heatherchristo.com_.jpg',
  ],

  // ── BROWNIE / CAKE ─────────────────────────
  brownie: [
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800',
  ],
  cake: [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
  ],
  cheesecake: [
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800',
  ],

  // ── CHOCOLATE ──────────────────────────────
  chocolate: [
    'https://images.unsplash.com/photo-1505253219559-0a0b74d0c0ae?q=80&w=800',
    'https://images.unsplash.com/photo-1481391319762-47dff72954d9?q=80&w=800',
  ],

  // ── MYSORE PAK ─────────────────────────────
  mysorepak: [
    'https://www.shreemithai.com/cdn/shop/products/spl-mysore-pak-206182.jpg?v=1707820107&width=800',
  ],

  // ── BARFI / BURFI ──────────────────────────
  barfi: [
    'https://images.unsplash.com/photo-1637944394993-1f0bdcd57143?q=80&w=800',
  ],

  // ── FRUIT SALAD / FRESH FRUITS (dessert context) ──
  fruitdessert: [
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800',
  ],

  // ─────────────────────────────────────────────
  // BEVERAGES — ONLY DRINK IMAGES
  // ─────────────────────────────────────────────

  coffee: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800',
  ],
  tea: [
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800',
    'https://images.unsplash.com/photo-1606791405730-bea15cd92a51?q=80&w=800',
  ],
  greentea: [
    'https://media.istockphoto.com/id/597657478/photo/like-tea.jpg?s=612x612&w=0&k=20&c=PgfvY_uI6B1K3FYV_wNen0hC32JVk6Mhm0yKIrFn6tI=',
  ],
  lassi: [
    'https://images.unsplash.com/photo-1579954115545-a95591f280c2?q=80&w=800',
    'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800',
  ],
  milkshake: [
    'https://images.unsplash.com/photo-1572448862523-ee6f8c964847?q=80&w=800',
    'https://images.unsplash.com/photo-1572490122747-3968b25ce05c?q=80&w=800',
  ],
  strawberrymilkshake: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsEb1TSZzfhADYmeMQfWDmtVihRHaGNdSFYQ&s',
  ],
  rosemilk: [
    'https://thumbs.dreamstime.com/b/popular-ramazan-drink-i-e-rose-falooda-shake-transparent-glass-along-raw-milk-another-honey-syrup-essence-also-225549696.jpg',
  ],
  smoothie: [
    'https://media.istockphoto.com/id/904617420/photo/fresh-mango-smoothie-in-the-glass.jpg?s=612x612&w=0&k=20&c=ogIRn5AfahJNU4W8UmQIZ-mJqL9tgOm9yH_-5WJmkSQ=',
    'https://media.istockphoto.com/id/904617420/photo/fresh-mango-smoothie-in-the-glass.jpg?s=612x612&w=0&k=20&c=ogIRn5AfahJNU4W8UmQIZ-mJqL9tgOm9yH_-5WJmkSQ=',
  ],
  juice: [
    'https://images.unsplash.com/photo-1589182373715-0b0bbbe19000?q=80&w=800',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
  ],
  watermelonjuice: [
    'https://img.freepik.com/free-photo/cold-watermelon-smoothie-dark-background_1150-41818.jpg?semt=ais_hybrid&w=740&q=80',
  ],
  mojito: [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800',
    'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=800',
  ],
  milk: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=800',
  ],
  coconutwater: [
    'https://images.unsplash.com/photo-1567265826255-254b8283a8f4?q=80&w=800',
  ],
  soda: [
    'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=800',
  ],
  water: [
    'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=800',
  ],
  cooler: [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
  ],

  // ─────────────────────────────────────────────
  // CATEGORY FALLBACKS (used only when no keyword match)
  // ─────────────────────────────────────────────

  fallback_main_course: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800',
  fallback_snack:       'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800',
  fallback_starter:     'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800',
  fallback_dessert:     'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800',
  fallback_beverage:    'https://images.unsplash.com/photo-1544145945-f904253d0c71?q=80&w=800',
  fallback_generic:     'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800',
};

// ─────────────────────────────────────────────
// KEYWORD MATCHING RULES (most specific first)
// Each entry: [keyword, imageArrayKey]
// ─────────────────────────────────────────────

const keywordRules: Array<[string, keyof typeof images]> = [
  // Biryani (must come before 'rice')
  ['crispy prawn biryani', 'crispyprawnbiryani'],
  ['biryani',      'biryani'],
  ['biriyani',     'biryani'],
  ['dum rice',     'biryani'],

  // Specific curries / gravies
  ['paneer butter masala', 'paneer'],
  ['butter chicken',       'chicken'],
  ['chicken tikka masala', 'tikka'],
  ['pepper mutton',        'mutton'],
  ['mutton',               'mutton'],
  ['paneer',               'paneer'],
  ['tikka',                'tikka'],
  ['kebab',                'kebab'],

  // Pizza
  ['pizza',        'pizza'],

  // Burger
  ['burger',       'burger'],

  // Soup
  ['soup',         'soup'],
  ['rasam',        'rasam'],
  ['broth',        'soup'],

  // Salad
  ['salad',        'salad'],
  ['cucumber mint','salad'],

  // Pasta / Noodles
  ['pasta',        'pasta'],
  ['spaghetti',    'pasta'],
  ['noodle',       'noodles'],
  ['chowmein',     'noodles'],
  ['hakka',        'noodles'],

  // Sandwich / Wrap
  ['sandwich',     'sandwich'],
  ['wrap',         'sandwich'],
  ['shawarma',     'shawarma'],
  ['roll',         'shawarma'],

  // Tacos
  ['taco',         'tacos'],

  // South Indian
  ['masala dosa',  'dosa'],
  ['dosa',         'dosa'],
  ['idli',         'idli'],
  ['sambar',       'idli'],
  ['vada',         'vada'],
  ['pongal',       'pongal'],
  ['upma',         'upma'],
  ['adai',         'dosa'],
  ['avial',        'curry'],
  ['kitchari',     'kitchari'],
  ['kitchdi',      'kitchari'],

  // Rice dishes
  ['curd rice',    'curd'],
  ['rasam rice',   'rasam'],
  ['rice',         'rice'],
  ['pulao',        'rice'],
  ['thali',        'rice'],
  ['meals',        'rice'],

  // Bread
  ['paratha',      'paratha'],
  ['stuffed paratha','paratha'],
  ['roti',         'roti'],
  ['naan',         'roti'],
  ['nan',          'roti'],
  ['chapati',      'roti'],

  // Chicken / Meat
  ['roasted chicken masala', 'roastedchickenmasala'],
  ['chicken 65',   'chicken'],
  ['chicken',      'chicken'],
  ['fish',         'fish'],
  ['prawn',        'fish'],
  ['seafood',      'fish'],

  // Snacks
  ['samosa',       'samosa'],
  ['french fries', 'fries'],
  ['fries',        'fries'],
  ['nachos',       'nachos'],
  ['puffs',        'samosa'],
  ['manchurian',   'noodles'],
  ['spring roll',  'samosa'],
  ['onion bhaji',  'bhaji'],
  ['bhaji',        'bhaji'],
  ['onion pakoda', 'bhaji'],
  ['pakoda',       'vada'],
  ['pakora',       'vada'],
  ['bajji',        'vada'],
  ['crispy murukku','murukku'],
  ['murukku',      'murukku'],
  ['cutlet',       'samosa'],
  ['baby corn',    'salad'],

  ['creamy mushroom roast', 'creamymushroomroast'],
  ['grilled beef roast', 'grilledbeefroast'],
  ['grilled egg fry', 'grilledeggfry'],
  ['sweet tofu salad', 'sweettofusalad'],
  ['sweet chicken curry', 'sweetchickencurry'],
  ['grilled vegetable salad', 'grilledvegetablesalad'],
  ['masala',       'curry'],
  ['curry',        'curry'],
  ['gravy',        'curry'],
  ['roast',        'chicken'],
  ['fry',          'chicken'],

  // ── DESSERTS ──────────────────────────
  ['gulab jamun',  'gulab'],
  ['gulab',        'gulab'],
  ['rasgulla',     'rasgulla'],
  ['jalebi',       'jalebi'],
  ['laddu',        'laddu'],
  ['laddoo',       'laddu'],
  ['kesari',       'kesari'],
  ['rava kesari',  'kesari'],
  ['halwa',        'halwa'],
  ['kheer',        'kheer'],
  ['paal payasam',  'paalpayasam'],
  ['payasam',      'payasam'],
  ['jigarthanda',  'jigarthanda'],
  ['ice cream',    'icecream'],
  ['icecream',     'icecream'],
  ['kulfi',        'kulfi'],
  ['brownie',      'brownie'],
  ['cheesecake',   'cheesecake'],
  ['cake',         'cake'],
  ['dark chocolate','chocolate'],
  ['chocolate',    'chocolate'],
  ['mysore bonda', 'bonda'],
  ['bonda',        'bonda'],
  ['mysore pak',   'mysorepak'],
  ['mysorepak',    'mysorepak'],
  ['barfi',        'barfi'],
  ['burfi',        'barfi'],
  ['peda',         'barfi'],
  ['fruit salad',  'fruitdessert'],
  ['fresh fruit',  'fruitdessert'],

  // ── BEVERAGES ──────────────────────────
  ['filter coffee',   'coffee'],
  ['jaggery coffee',  'coffee'],
  ['cold coffee',     'coffee'],
  ['coffee',          'coffee'],
  ['lemon turmeric tea','tea'],
  ['tulsi',           'tea'],
  ['green tea',       'greentea'],
  ['bubble tea',      'tea'],
  ['ginger',          'tea'],
  ['chamomile',       'tea'],
  ['saffron milk',    'milk'],
  ['warm milk',       'milk'],
  ['rose milk',       'rosemilk'],
  ['lassi',           'lassi'],
  ['strawberry milkshake', 'strawberrymilkshake'],
  ['milkshake',       'milkshake'],
  ['shake',           'milkshake'],
  ['smoothie',        'smoothie'],
  ['beetroot juice',  'juice'],
  ['watermelon',      'watermelonjuice'],
  ['mango juice',     'juice'],
  ['juice',           'juice'],
  ['mojito',          'mojito'],
  ['cooler',          'cooler'],
  ['coconut water',   'coconutwater'],
  ['soda',            'soda'],
  ['tea',             'tea'],
  ['milk',            'milk'],
];

// ─────────────────────────────────────────────
// MAIN EXPORT: getFoodImage
// ─────────────────────────────────────────────

/**
 * Returns the most accurate image URL for a given food name + category.
 * Uses keyword matching first, then category fallbacks.
 * 
 * @param foodName   - The food's name (e.g. "Chettinad Biryani")
 * @param category   - The food's category (e.g. "main_course", "dessert", "beverage")
 * @param existingImage - The existing URL from the database (used if valid and not generic)
 */
export function getFoodImage(
  foodName: string,
  category: string,
  existingImage?: string
): string {
  const nameLower = (foodName || '').toLowerCase();
  const catLower  = (category  || '').toLowerCase();

  // 1. Keyword matching (name-based, most specific first)
  for (const [keyword, imageKey] of keywordRules) {
    if (nameLower.includes(keyword)) {
      const pool = images[imageKey];
      if (Array.isArray(pool) && pool.length > 0) {
        // Stable selection: use a hash of the food name to always pick the same image
        const hash = nameLower.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return pool[hash % pool.length];
      }
    }
  }

  // 2. Category fallback (clean, correct-category images only)
  if (catLower.includes('dessert') || catLower.includes('sweet')) {
    return images.fallback_dessert;
  }
  if (catLower.includes('beverage') || catLower.includes('drink') || catLower.includes('juice') || catLower.includes('shake') || catLower.includes('tea') || catLower.includes('coffee')) {
    return images.fallback_beverage;
  }
  if (catLower.includes('snack')) {
    return images.fallback_snack;
  }
  if (catLower.includes('starter') || catLower.includes('appetizer')) {
    return images.fallback_starter;
  }
  if (catLower.includes('main') || catLower.includes('course') || catLower.includes('meal')) {
    return images.fallback_main_course;
  }

  // 3. Use existing image only if it looks like a real Unsplash food URL
  if (existingImage && existingImage.includes('unsplash.com') && existingImage.length > 40) {
    return existingImage;
  }

  // 4. Final generic fallback
  return images.fallback_generic;
}

/**
 * Returns a correct beverage image for a given drink name.
 * Ensures beverages never get food images.
 */
export function getDrinkImage(drinkName: string, existingImage?: string): string {
  return getFoodImage(drinkName, 'beverage', existingImage);
}

/**
 * Returns a correct dessert image for a given dessert name.
 * Ensures desserts never get salad or savory images.
 */
export function getDessertImage(dessertName: string, existingImage?: string): string {
  return getFoodImage(dessertName, 'dessert', existingImage);
}
