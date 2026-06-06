import React from 'react';
import { 
  LuLightbulb, 
  LuWind, 
  LuSnowflake, 
  LuZap, 
  LuCircleCheck, 
  LuTimer, 
  LuGauge 
} from "react-icons/lu";

const Tips = () => {
  const categories = [
    {
      title: "Air Conditioning",
      icon: <LuWind className="text-blue-500" />,
      tips: [
        "Set your AC to 26°C for the best balance of comfort and energy saving.",
        "Clean your AC filters every 2 weeks to reduce load by up to 15%.",
        "Keep doors and windows shut tightly while the AC is running."
      ],
      saving: "High Saving"
    },
    {
      title: "Refrigeration",
      icon: <LuSnowflake className="text-cyan-500" />,
      tips: [
        "Avoid keeping the fridge door open for too long.",
        "Don't put hot food directly into the fridge; let it cool down first.",
        "Ensure there is space behind the fridge for proper air circulation."
      ],
      saving: "Medium Saving"
    },
    {
      title: "Lighting & Electronics",
      icon: <LuLightbulb className="text-amber-500" />,
      tips: [
        "Switch to LED bulbs—they use 75% less energy than old bulbs.",
        "Turn off 'Vampire Loads' (standby lights on TVs and Chargers).",
        "Use natural sunlight during the day instead of indoor lights."
      ],
      saving: "Low Saving"
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <LuLightbulb className="text-brand-blue" /> Energy Saving Hacks
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          Small changes in your daily routine can lead to big savings in your monthly MEPCO bill.
        </p>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-[30px] border border-emerald-100 dark:border-emerald-500/20">
          <LuCircleCheck className="text-emerald-500 mb-3" size={28} />
          <h4 className="font-black text-emerald-900 dark:text-emerald-400">Target Slab</h4>
          <p className="text-xs text-emerald-700 font-bold uppercase">Stay under 200 Units</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-[30px] border border-amber-100 dark:border-amber-500/20">
          <LuTimer className="text-amber-500 mb-3" size={28} />
          <h4 className="font-black text-amber-900 dark:text-amber-400">Peak Hours</h4>
          <p className="text-xs text-amber-700 font-bold uppercase">6 PM - 10 PM (Avoid Heavy Load)</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-[30px] border border-blue-100 dark:border-blue-500/20">
          <LuGauge className="text-blue-500 mb-3" size={28} />
          <h4 className="font-black text-blue-900 dark:text-blue-400">Smart Monitoring</h4>
          <p className="text-xs text-blue-700 font-bold uppercase">Check SlabGuard Daily</p>
        </div>
      </div>

      {/* DETAILED TIPS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {categories.map((cat, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-[#1E293B] p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:scale-110 transition-transform">
                {React.cloneElement(cat.icon, { size: 32 })}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500">
                {cat.saving}
              </span>
            </div>
            
            <h3 className="text-xl font-black mb-4 dark:text-white">{cat.title}</h3>
            
            <ul className="space-y-4">
              {cat.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {tip}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* DID YOU KNOW BOX */}
      <div className="bg-brand-blue p-8 md:p-12 rounded-[50px] text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
        <LuZap className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 rotate-12" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-black mb-4">Did you know?</h2>
          <p className="text-blue-50 font-medium leading-relaxed">
            Switching from a 100W incandescent bulb to a 12W LED can save you nearly **Rs. 500 per bulb** annually on your electricity bill. Imagine the savings if you switch the whole house!
          </p>
        </div>
      </div>

    </div>
  );
};

export default Tips;