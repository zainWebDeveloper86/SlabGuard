import React, { useState } from "react";
import {
  LuMessageCircleQuestion,
  LuChevronDown,
  LuChevronUp,
  LuSend,
  LuMail,
  LuClock,
  LuShieldCheck,
  LuCircleCheck,
} from "react-icons/lu";

const Support = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // FAQ Data logic
  const faqs = [
    {
      q: "How accurate is my bill prediction?",
      a: "SlabGuard's AI model provides results with up to 95% accuracy if your usage pattern from the last 7 days remains consistent. Unusual loads (such as extra AC usage) can affect the prediction.",
    },
    {
      q: "When do peak hours start?",
      a: "According to MEPCO, peak hours change according to the season. Currently, they are from 6:00 PM to 10:00 PM. During these hours, the per-unit rate is significantly higher.",
    },
    {
      q: "What does a slab breach alert mean?",
      a: "This means your current usage is pushing you out of the 'Protected' slab (200 units) or the 'Next' slab, which could instantly double your per-unit rate.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Backend integration (POST request) yahan aayegi
  };

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      {/* ================= SECTION HEADER ================= */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue">
          <LuMessageCircleQuestion size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Help Center
          </h1>
          <p className="text-gray-500 font-medium">
            SlabGuard support is here to assist you 24/7
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ================= LEFT: FAQs (6 Columns) ================= */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-black dark:text-white mb-4 italic">
            Common Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden transition-all bg-white dark:bg-[#1E293B]"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    {faq.q}
                  </span>
                  {openFaq === index ? (
                    <LuChevronUp className="text-brand-blue" />
                  ) : (
                    <LuChevronDown className="text-gray-400" />
                  )}
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* QUICK HELP CARD */}
          <div className="bg-brand-gradient p-8 rounded-[40px] text-white shadow-xl shadow-blue-500/20">
            <h4 className="font-black text-xl mb-2 italic">Pro Tip!</h4>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              You can update your reference number from the dashboard settings if the bill is not being fetched.
            </p>
          </div>
        </div>

        {/* ================= RIGHT: SUPPORT FORM (7 Columns) ================= */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#1E293B] p-8 md:p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden h-full">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                  <LuCircleCheck size={40} />
                </div>
                <h2 className="text-3xl font-black dark:text-white mb-2">
                  Ticket Raised!
                </h2>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Hamari team aglay 24 ghanton mein aap se rabta karegi.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-brand-blue font-bold hover:underline italic underline-offset-8"
                >
                  Submit another query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-8">
                  <h3 className="text-2xl font-black dark:text-white italic">
                    Send us a Message
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Briefly explain your issue or feedback.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      Issue Category
                    </label>
                    <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white font-bold appearance-none">
                      <option>Billing Discrepancy</option>
                      <option>Technical Bug</option>
                      <option>Prediction Feedback</option>
                      <option>Other / General</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows="6"
                      placeholder="Write your issue details here..."
                      className="w-full px-6 py-4 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white resize-none font-medium"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-gradient text-white py-5 rounded-full font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
                >
                  Submit Ticket <LuSend size={20} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM: CONTACT INFO CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-50 dark:border-gray-800 flex items-center gap-4 group hover:border-brand-blue/30 transition">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-500">
            <LuMail size={24} />
          </div>
          <div>
            <h4 className="font-bold dark:text-white text-sm">Email Us</h4>
            <p className="text-xs text-gray-500">support@slabguard.com</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-50 dark:border-gray-800 flex items-center gap-4 group hover:border-brand-blue/30 transition">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-500">
            <LuClock size={24} />
          </div>
          <div>
            <h4 className="font-bold dark:text-white text-sm">Response Time</h4>
            <p className="text-xs text-gray-500">Under 24 Hours</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-50 dark:border-gray-800 flex items-center gap-4 group hover:border-brand-blue/30 transition">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-500">
            <LuShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold dark:text-white text-sm">Security</h4>
            <p className="text-xs text-gray-500">Encrypted Messaging</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
