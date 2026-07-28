import { motion } from 'framer-motion';

import { getFoodImage } from '../utils/foodImageMap';

const Flame = ({ className, fill }: { className?: string; fill?: string }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2C9.243 6.44 8 9.5 8 12.5A4 4 0 0012 16a4 4 0 004-3.5c0-3-1.243-6.06-4-10.5z" />
    <path d="M12 18.5c-3.5-1-6-4-6-7.5 0-2.667 1.333-4.5 3-5.5-1.58 1.64-2.5 3.96-2.5 6.5A6 6 0 0012 19a6 6 0 006-7.5c0-2.54-.92-4.86-2.5-6.5 1.667 1 3 2.833 3 5.5 0 3.5-2.5 6.5-6 7.5z" />
  </svg>
);

interface FoodCardProps {
  foodName: string;
  category: string;
  image: string;
  spiceLevel: number;
  delay?: number;
}

const openSwiggy = (foodName: string, e: React.MouseEvent) => {
  e.stopPropagation();
  const query = encodeURIComponent(foodName.trim());
  window.open(`https://www.swiggy.com/search?query=${query}`, '_blank', 'noopener,noreferrer');
};

const openZomato = (foodName: string, e: React.MouseEvent) => {
  e.stopPropagation();
  const query = encodeURIComponent(foodName.trim());
  window.open(`https://www.zomato.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
};

const categoryFallbacks: Record<string, string> = {
  main_course: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
  snack:       "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
  starter:     "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800",
  dessert:     "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800",
  beverage:    "https://images.unsplash.com/photo-1544145945-f904253d0c71?q=80&w=800",
};

const FoodCard = ({ foodName, category, image, spiceLevel, delay = 0 }: FoodCardProps) => {
  const catLower = (category || '').toLowerCase();

  // Use getFoodImage for accurate, keyword-based image selection.
  // Falls back to the correct category image if no keyword match is found.
  const finalImage = getFoodImage(foodName, category, image) || categoryFallbacks[catLower] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800";

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="glass-card h-full min-h-[320px] rounded-3xl overflow-hidden relative group cursor-pointer"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${finalImage})` }}
      />
      
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/50 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay"></div>
      
      <div className="absolute top-4 right-4 z-20 flex space-x-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-text-main/10">
        {[...Array(3)].map((_, i) => (
          <Flame 
            key={i} 
            className={`w-4 h-4 ${i < spiceLevel ? 'text-orange-500' : 'text-text-muted'}`} 
            fill={i < spiceLevel ? 'currentColor' : 'none'}
          />
        ))}
      </div>
 
      <div className="absolute bottom-0 left-0 p-6 z-20 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-xs font-semibold px-3 py-1 bg-primary/30 rounded-full border border-primary/50 backdrop-blur-md inline-block mb-3 text-text-main shadow-[0_0_10px_rgba(170,59,255,0.3)]">
          {category}
        </span>
        <h3 className="text-xl font-bold mb-1 text-text-main truncate">{foodName}</h3>

        {/* Order Buttons — slide up on hover */}
        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => openSwiggy(foodName, e)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all duration-200"
            style={{ background: 'linear-gradient(135deg,#FC8019,#e86c0f)', color: '#fff', boxShadow: '0 0 14px rgba(252,128,25,0.45)' }}
          >
            🛵 Swiggy
          </button>
          <button
            onClick={(e) => openZomato(foodName, e)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all duration-200"
            style={{ background: 'linear-gradient(135deg,#E23744,#c42d3a)', color: '#fff', boxShadow: '0 0 14px rgba(226,55,68,0.45)' }}
          >
            🍽️ Zomato
          </button>
        </div>
      </div>
    </motion.div>
  );
};
 
export default FoodCard;
