export interface Food {
  id: number;
  food_name: string;
  category: string;
  image: string;
  mood: string;
  mood_tags?: string[];
  spice_level: number;
  region: string;
}

export interface Song {
  id: number;
  song_name: string;
  movie_name: string;
  hero: string;
  music_director: string;
  artist?: string;
  genre?: string;
  mood: string;
  mood_tags?: string[];
  image: string;
  youtube_link: string;
  spotify_link?: string;
}

export const mockFoods: Food[] = [
  // === STARTERS ===
  { id: 101, food_name: 'Gobi 65', category: 'starter', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800', mood: 'energetic', mood_tags: ['energetic', 'spicy'], spice_level: 2, region: 'South India' },
  { id: 102, food_name: 'Paneer Tikka', category: 'starter', image: 'https://images.unsplash.com/photo-1599487405270-81714b7ec829?q=80&w=800', mood: 'happy', mood_tags: ['happy', 'creamy'], spice_level: 1, region: 'North India' },
  { id: 103, food_name: 'Chicken Lollipop', category: 'starter', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800', mood: 'excited', mood_tags: ['excited', 'spicy'], spice_level: 3, region: 'Indo-Chinese' },
  { id: 104, food_name: 'Onion Pakoda', category: 'starter', image: '/onion_bhaji.png', mood: 'relaxed', mood_tags: ['relaxed', 'monsoon'], spice_level: 1, region: 'South India' },
  { id: 105, food_name: 'Samosa Chat', category: 'starter', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800', mood: 'stressed', mood_tags: ['stressed', 'tangy'], spice_level: 2, region: 'North India' },
  { id: 106, food_name: 'Crispy Spring Rolls', category: 'starter', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800', mood: 'happy', mood_tags: ['happy', 'crunchy'], spice_level: 1, region: 'Indo-Chinese' },

  // === MAIN COURSES ===
  { id: 1, food_name: 'Chettinad Biryani', category: 'main_course', image: 'https://images.unsplash.com/photo-1633940521590-171b1b44ec82?q=80&w=800', mood: 'energetic', mood_tags: ['energetic', 'motivated', 'spicy'], spice_level: 3, region: 'Chettinad' },
  { id: 2, food_name: 'Butter Chicken', category: 'main_course', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800', mood: 'love', mood_tags: ['love', 'rich'], spice_level: 1, region: 'Punjab' },
  { id: 3, food_name: 'Mutton Curry', category: 'main_course', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?q=80&w=800', mood: 'energetic', mood_tags: ['energetic', 'bold'], spice_level: 3, region: 'South India' },
  { id: 4, food_name: 'Masala Dosa', category: 'main_course', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800', mood: 'happy', mood_tags: ['happy', 'relaxed', 'morning'], spice_level: 1, region: 'South India' },
  { id: 5, food_name: 'Pongal', category: 'main_course', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9de?q=80&w=800', mood: 'happy', mood_tags: ['happy', 'comfort'], spice_level: 0, region: 'Tamil Nadu' },
  { id: 8, food_name: 'Idli Sambar', category: 'main_course', image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=800', mood: 'relaxed', mood_tags: ['relaxed', 'healthy'], spice_level: 0, region: 'South India' },
  { id: 9, food_name: 'Adai Avial', category: 'main_course', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=800', mood: 'relaxed', mood_tags: ['relaxed', 'traditional'], spice_level: 1, region: 'Kerala' },
  { id: 10, food_name: 'Rasam Rice', category: 'main_course', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800', mood: 'sad', mood_tags: ['sad', 'healing'], spice_level: 1, region: 'South India' },
  { id: 11, food_name: 'Curd Rice', category: 'main_course', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800', mood: 'sad', mood_tags: ['sad', 'comfort'], spice_level: 0, region: 'South India' },
  { id: 13, food_name: 'Paneer Butter Masala', category: 'main_course', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800', mood: 'romantic', mood_tags: ['romantic', 'creamy'], spice_level: 1, region: 'North India' },
  { id: 15, food_name: 'Stuffed Paratha', category: 'main_course', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800', mood: 'romantic', mood_tags: ['romantic', 'sharing'], spice_level: 0, region: 'Punjab' },
  { id: 16, food_name: 'Hydrabadi Biryani', category: 'main_course', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800', mood: 'excited', mood_tags: ['excited', 'spicy'], spice_level: 3, region: 'Hyderabad' },
  { id: 17, food_name: 'Malai Kofta', category: 'main_course', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800', mood: 'love', mood_tags: ['love', 'rich'], spice_level: 1, region: 'North India' },

  // === SAVORY SNACKS ===
  { id: 12, food_name: 'Medu Vada', category: 'snack', image: 'https://images.unsplash.com/photo-1589301773066-32f8059eb3fb?q=80&w=800', mood: 'sad', mood_tags: ['sad', 'crunchy'], spice_level: 1, region: 'South India' },
  { id: 201, food_name: 'Onion Bhaji', category: 'snack', image: '/onion_bhaji.png', mood: 'relaxed', mood_tags: ['relaxed', 'monsoon'], spice_level: 1, region: 'South India' },
  { id: 202, food_name: 'Crispy Murukku', category: 'snack', image: '/crispy_murukku.png', mood: 'happy', mood_tags: ['happy', 'crunchy'], spice_level: 0, region: 'South India' },
  { id: 203, food_name: 'Mysore Bonda', category: 'snack', image: '/mysore_bonda.png', mood: 'stressed', mood_tags: ['stressed', 'comfort'], spice_level: 1, region: 'Karnataka' },
  { id: 204, food_name: 'Aloo Samosa', category: 'snack', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800', mood: 'sad', mood_tags: ['sad', 'crunchy'], spice_level: 1, region: 'North India' },
  { id: 205, food_name: 'Bhel Puri', category: 'snack', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800', mood: 'tired', mood_tags: ['tired', 'tangy'], spice_level: 2, region: 'Mumbai' },

  // === SWEET DELIGHTS (DESSERTS) ===
  { id: 6, food_name: 'Jigarthanda', category: 'dessert', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800', mood: 'happy', mood_tags: ['happy', 'sweet'], spice_level: 0, region: 'Madurai' },
  { id: 301, food_name: 'Gulab Jamun', category: 'dessert', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTekGwxsZ1t-btZIi94EpFc0z9iffl9JkD_uw&s', mood: 'sad', mood_tags: ['sad', 'sweet'], spice_level: 0, region: 'South India' },
  { id: 302, food_name: 'Rava Kesari', category: 'dessert', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ37BBVifwTTZsN5BgiXM7cIYJU7ITM_HZR_w&s', mood: 'relaxed', mood_tags: ['relaxed', 'sweet'], spice_level: 0, region: 'Tamil Nadu' },
  { id: 303, food_name: 'Mysore Pak', category: 'dessert', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTekGwxsZ1t-btZIi94EpFc0z9iffl9JkD_uw&s', mood: 'happy', mood_tags: ['happy', 'sweet'], spice_level: 0, region: 'Karnataka' },
  { id: 304, food_name: 'Elaneer Payasam', category: 'dessert', image: 'https://thumbs.dreamstime.com/b/delicious-payasam-kerala-cuisine-homemade-98980037.jpg', mood: 'relaxed', mood_tags: ['relaxed', 'sweet'], spice_level: 0, region: 'Kerala' },
  { id: 305, food_name: 'Mango Ice Cream', category: 'dessert', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800', mood: 'excited', mood_tags: ['excited', 'sweet'], spice_level: 0, region: 'South India' },
  { id: 306, food_name: 'Laddu', category: 'dessert', image: 'https://t4.ftcdn.net/jpg/05/95/86/23/360_F_595862367_Mq2DESdDGSeEyDEvY5swpZsDz8lXQ9DX.jpg', mood: 'happy', mood_tags: ['happy', 'sweet'], spice_level: 0, region: 'South India' },
  { id: 307, food_name: 'Rasgulla', category: 'dessert', image: 'https://i.pinimg.com/474x/37/cb/d5/37cbd5945b0947a3d48e99e4ca6622b8.jpg', mood: 'sad', mood_tags: ['sad', 'sweet'], spice_level: 0, region: 'Kolkata' },
  { id: 308, food_name: 'Chocolate Brownie', category: 'dessert', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800', mood: 'stressed', mood_tags: ['stressed', 'sweet'], spice_level: 0, region: 'Global' },

  // === BEVERAGES ===
  { id: 7, food_name: 'Filter Coffee', category: 'beverage', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800', mood: 'relaxed', mood_tags: ['relaxed', 'calm'], spice_level: 0, region: 'South India' },
  { id: 14, food_name: 'Chocolate Lassi', category: 'beverage', image: 'https://images.unsplash.com/photo-1579954115545-a95591f280c2?q=80&w=800', mood: 'romantic', mood_tags: ['romantic', 'sweet'], spice_level: 0, region: 'Punjab' },
  { id: 401, food_name: 'Mango Lassi', category: 'beverage', image: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?q=80&w=800', mood: 'happy', mood_tags: ['happy', 'sweet'], spice_level: 0, region: 'Punjab' },
  { id: 402, food_name: 'Lemon Mint Cooler', category: 'beverage', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800', mood: 'energetic', mood_tags: ['energetic', 'cooling'], spice_level: 0, region: 'South India' },
  { id: 403, food_name: 'Rose Milk', category: 'beverage', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800', mood: 'love', mood_tags: ['love', 'sweet'], spice_level: 0, region: 'South India' },
  { id: 404, food_name: 'Masala Chai', category: 'beverage', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800', mood: 'tired', mood_tags: ['tired', 'spiced'], spice_level: 1, region: 'North India' },
  { id: 405, food_name: 'Cold Coffee', category: 'beverage', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800', mood: 'stressed', mood_tags: ['stressed', 'caffeine'], spice_level: 0, region: 'Global' }
];

export const mockSongs: Song[] = [
  // romantic songs
  { id: 1, song_name: 'Ennavale Adi Ennavale', movie_name: 'Kadhalan', hero: 'Prabhu Deva', music_director: 'A.R. Rahman', artist: 'Unnikrishnan', genre: 'Melody', mood: 'romantic', mood_tags: ['romantic', 'classic', 'melody'], image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=VBcFh8CJQHM', spotify_link: 'https://open.spotify.com/track/62gYIu0T1G53q7k7oNchvP' },
  { id: 2, song_name: 'Munbe Vaa', movie_name: 'Sillunu Oru Kadhal', hero: 'Suriya', music_director: 'A.R. Rahman', artist: 'Naresh Iyer', genre: 'Melody', mood: 'romantic', mood_tags: ['romantic', 'soulful', 'popular'], image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=lD3hBXVBaKk', spotify_link: 'https://open.spotify.com/track/1fR4JpM74t25U25aX2Z0Cq' },
  { id: 3, song_name: 'Vennilave Vennilave', movie_name: 'Minsara Kanavu', hero: 'Arvind Swamy', music_director: 'A.R. Rahman', artist: 'Hariharan', genre: 'Melody', mood: 'romantic', mood_tags: ['romantic', 'moonlight', 'classic'], image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=oOzl9I3XHLU', spotify_link: 'https://open.spotify.com/track/3s74K39YxRngpL73fR5FmE' },
  
  // energetic songs
  { id: 4, song_name: 'Naa Ready', movie_name: 'Leo', hero: 'Vijay', music_director: 'Anirudh', artist: 'Anirudh', genre: 'Kuthu', mood: 'energetic', mood_tags: ['energetic', 'dance', 'mass'], image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=7wKRj-axSFI', spotify_link: 'https://open.spotify.com/track/5j2jK05yKqGj6s6P8H55Jz' },
  { id: 5, song_name: 'Arabic Kuthu', movie_name: 'Beast', hero: 'Vijay', music_director: 'Anirudh', artist: 'Anirudh', genre: 'Kuthu', mood: 'energetic', mood_tags: ['energetic', 'vibe', 'trendy'], image: 'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=r7OiS71NElA', spotify_link: 'https://open.spotify.com/track/0528e0L9a6bUqIuhJgSPhu' },
  { id: 6, song_name: 'Vaathi Coming', movie_name: 'Master', hero: 'Vijay', music_director: 'Anirudh', artist: 'Anirudh', genre: 'Kuthu', mood: 'energetic', mood_tags: ['energetic', 'party', 'beats'], image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=8cw4OW7T8cA', spotify_link: 'https://open.spotify.com/track/5T8LshTki986kX0164m6Rk' },
  
  // sad songs
  { id: 7, song_name: 'Thenpandi Cheemayile', movie_name: 'Nayakan', hero: 'Kamal Haasan', music_director: 'Ilaiyaraaja', artist: 'Ilaiyaraaja', genre: 'Classic', mood: 'sad', mood_tags: ['sad', 'emotional', 'classic'], image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=XCXHpQHb0_U', spotify_link: 'https://open.spotify.com/track/25S6vEUt91B1U2pB52N6v1' },
  { id: 8, song_name: 'Kannazhaga', movie_name: 'Mouna Ragam', hero: 'Karthik', music_director: 'Ilaiyaraaja', artist: 'S. Janaki', genre: 'Melody', mood: 'sad', mood_tags: ['sad', 'melancholy', 'night'], image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=XCXHpQHb0_U', spotify_link: 'https://open.spotify.com/track/2tH8XJzYJjGj6s6P8H55Jz' },
  { id: 9, song_name: 'Uyire', movie_name: 'Bombay', hero: 'Arvind Swamy', music_director: 'A.R. Rahman', artist: 'Hariharan', genre: 'Melody', mood: 'sad', mood_tags: ['sad', 'soulful', 'separation'], image: 'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=iVfWMBUqKT8', spotify_link: 'https://open.spotify.com/track/0XyK05yKqGj6s6P8H55Jz' },
  
  // happy songs
  { id: 10, song_name: 'Aalaporan Tamizhan', movie_name: 'Mersal', hero: 'Vijay', music_director: 'A.R. Rahman', artist: 'Kailash Kher', genre: 'Folk', mood: 'happy', mood_tags: ['happy', 'proud', 'folk'], image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=HxVfOPgA3DA', spotify_link: 'https://open.spotify.com/track/4XyK05yKqGj6s6P8H55Jz' },
  { id: 11, song_name: 'Verithanam', movie_name: 'Bigil', hero: 'Vijay', music_director: 'A.R. Rahman', artist: 'Vijay', genre: 'Kuthu', mood: 'happy', mood_tags: ['happy', 'energetic', 'celebration'], image: 'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=u2VTIKzV1D0', spotify_link: 'https://open.spotify.com/track/3XyK05yKqGj6s6P8H55Jz' },
  { id: 12, song_name: 'Surviva', movie_name: 'Thalapathy 63', hero: 'Vijay', music_director: 'A.R. Rahman', artist: 'Anirudh', genre: 'Rock', mood: 'happy', mood_tags: ['happy', 'motivational', 'rock'], image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=9zHMEAnVvpk', spotify_link: 'https://open.spotify.com/track/2XyK05yKqGj6s6P8H55Jz' },
  
  // relaxed songs
  { id: 13, song_name: 'Vellai Pookal', movie_name: 'Kannathil Muthamittal', hero: 'Madhavan', music_director: 'A.R. Rahman', artist: 'A.R. Rahman', genre: 'Melody', mood: 'relaxed', mood_tags: ['relaxed', 'peace', 'nature'], image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=gPl8T_VeCKA', spotify_link: 'https://open.spotify.com/track/1XyK05yKqGj6s6P8H55Jz' },
  { id: 14, song_name: 'Nenjame', movie_name: 'Soorarai Pottru', hero: 'Suriya', music_director: 'G.V. Prakash', artist: 'G.V. Prakash', genre: 'Soul', mood: 'relaxed', mood_tags: ['relaxed', 'soulful', 'journey'], image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=3P2qCHvKaV0', spotify_link: 'https://open.spotify.com/track/5XyK05yKqGj6s6P8H55Jz' },
  { id: 15, song_name: 'Kanave Kanave', movie_name: 'David', hero: 'Vikram', music_director: 'Anirudh', artist: 'Anirudh', genre: 'Melody', mood: 'relaxed', mood_tags: ['relaxed', 'melancholy', 'soft'], image: 'https://images.unsplash.com/photo-1619983081563-430f53602796?q=80&w=800', youtube_link: 'https://www.youtube.com/watch?v=T0wifTMrxV8', spotify_link: 'https://open.spotify.com/track/6XyK05yKqGj6s6P8H55Jz' }
];
