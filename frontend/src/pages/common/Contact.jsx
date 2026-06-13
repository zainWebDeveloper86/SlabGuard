// import { useState } from "react";
// import {
//   LuMail, LuMessageCircle, LuMapPin,
//   LuSend, LuCircleCheck, LuCircleHelp
// } from "react-icons/lu";

// const Contact = () => {
//   const [submitted, setSubmitted] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setSubmitted(true);
//     // Add your form submission logic here
//   };

//   const faqs = [
//     {
//       q: "Is my MEPCO data safe?",
//       a: "Absolutely. We only use your 14-digit reference number to fetch public billing data. We never ask for sensitive personal or financial passwords."
//     },
//     {
//       q: "Does it work for other companies like LESCO?",
//       a: "Currently, we are optimized for MEPCO (Multan Electric Power Company). Support for LESCO, FESCO, and K-Electric is coming soon in Q3 2026."
//     },
//     {
//       q: "Is SlabGuard free to use?",
//       a: "Yes! Our core tracking and prediction features are 100% free for individual households."
//     }
//   ];

//   return (
//     <div className="bg-white dark:bg-[#0B1220] min-h-screen">
//       {/* ================= HEADER ================= */}
//       <section className="pt-24 pb-12 px-6 text-center">
//         <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
//           Get in <span className="text-brand-blue">Touch</span>
//         </h1>
//         <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
//           Have questions about your bill predictions or need technical support?
//           We're here to help you save energy and money.
//         </p>
//       </section>

//       <section className="py-16 px-6 max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

//           {/* ================= LEFT: CONTACT INFO & FAQ ================= */}
//           <div className="space-y-12">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div className="p-6 rounded-3xl bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800">
//                 <LuMail className="text-brand-blue mb-4 w-8 h-8" />
//                 <h4 className="font-bold dark:text-white">Email Us</h4>
//                 <p className="text-sm text-gray-500">support@slabguard.com</p>
//               </div>
//               <div className="p-6 rounded-3xl bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800">
//                 <LuMessageCircle className="text-brand-green mb-4 w-8 h-8" />
//                 <h4 className="font-bold dark:text-white">Live Chat</h4>
//                 <p className="text-sm text-gray-500">Available Mon-Fri, 9am-6pm</p>
//               </div>
//             </div>

//             {/* FAQs */}
//             <div className="space-y-6">
//               <h3 className="text-2xl font-black dark:text-white flex items-center gap-2">
//                 <LuCircleHelp className="text-brand-blue" /> Common Questions
//               </h3>
//               <div className="space-y-4">
//                 {faqs.map((faq, i) => (
//                   <div key={i} className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0F172A] shadow-sm">
//                     <h4 className="font-bold mb-2 dark:text-white">{faq.q}</h4>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* ================= RIGHT: CONTACT FORM ================= */}
//           <div className="relative">
//             <div className="absolute -inset-1 bg-brand-gradient rounded-[40px] blur opacity-20"></div>
//             <div className="relative bg-white dark:bg-[#1E293B] p-8 md:p-12 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800">
//               {submitted ? (
//                 <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
//                   <LuCircleCheck className="w-20 h-20 text-green-500 mx-auto mb-6" />
//                   <h2 className="text-3xl font-black dark:text-white mb-2">Message Sent!</h2>
//                   <p className="text-gray-500">Our team will get back to you within 24 hours.</p>
//                   <button
//                     onClick={() => setSubmitted(false)}
//                     className="mt-8 text-brand-blue font-bold hover:underline"
//                   >
//                     Send another message
//                   </button>
//                 </div>
//               ) : (
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="text-sm font-bold dark:text-gray-300 ml-2">Full Name</label>
//                       <input
//                         required
//                         type="text"
//                         placeholder="Zain Ahmed"
//                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-sm font-bold dark:text-gray-300 ml-2">Email Address</label>
//                       <input
//                         required
//                         type="email"
//                         placeholder="zain@email.com"
//                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white"
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-bold dark:text-gray-300 ml-2">Subject</label>
//                     <input
//                       required
//                       type="text"
//                       placeholder="How can we help?"
//                       className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-bold dark:text-gray-300 ml-2">Message</label>
//                     <textarea
//                       required
//                       rows="4"
//                       placeholder="Tell us more about your inquiry..."
//                       className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white resize-none"
//                     ></textarea>
//                   </div>
//                   <button
//                     type="submit"
//                     className="w-full bg-brand-gradient text-white py-4 rounded-full font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
//                   >
//                     Send Message <LuSend size={20} />
//                   </button>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ================= MAP PLACEHOLDER / SOCIALS ================= */}
//       <section className="py-20 px-6 text-center border-t border-gray-100 dark:border-gray-800">
//         <div className="max-w-2xl mx-auto space-y-6">
//           <LuMapPin className="mx-auto text-brand-blue w-10 h-10 opacity-30" />
//           <h3 className="text-2xl font-bold dark:text-white">Based in Sahiwal, Pakistan</h3>
//           <p className="text-gray-500">Helping the nation save energy, one household at a time.</p>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Contact;

import { useState } from "react";
import {
  LuMail,
  LuMessageCircle,
  LuMapPin,
  LuSend,
  LuCircleCheck,
  LuCircleHelp,
} from "react-icons/lu";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "Is my MEPCO data safe?",
      a: "We only use your reference number to fetch public billing data. We never access sensitive information like passwords or bank details.",
    },
    {
      q: "Does it work for other companies?",
      a: "Currently optimized for MEPCO. We are expanding support for LESCO, FESCO, and K-Electric soon.",
    },
    {
      q: "Is SlabGuard free?",
      a: "Yes, core features are completely free for households.",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0B1220] min-h-screen">
      {/* ================= HEADER ================= */}
      <section className="pt-28 pb-14 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-5">
          Get in <span className="text-brand-blue">Touch</span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Have questions or need help? Our team is here to help you understand
          and reduce your electricity costs.
        </p>
      </section>

      {/* ================= MAIN ================= */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* LEFT SIDE */}
          <div className="space-y-10">
            {/* CONTACT CARDS */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                <LuMail className="text-brand-blue w-7 h-7 mb-4" />
                <h4 className="font-bold dark:text-white mb-1">Email</h4>
                <p className="text-sm text-gray-500">support@slabguard.com</p>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                <LuMessageCircle className="text-brand-green w-7 h-7 mb-4" />
                <h4 className="font-bold dark:text-white mb-1">Live Chat</h4>
                <p className="text-sm text-gray-500">Mon–Fri, 9AM–6PM</p>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-2xl font-black dark:text-white flex items-center gap-2 mb-6">
                <LuCircleHelp className="text-brand-blue" />
                FAQs
              </h3>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800"
                  >
                    <h4 className="font-bold dark:text-white mb-2">{faq.q}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="relative">
            {/* glow */}
            <div className="absolute -inset-1 bg-brand-gradient rounded-[40px] blur opacity-20"></div>

            <div className="relative bg-white dark:bg-[#1E293B] p-8 md:p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl">
              {submitted ? (
                <div className="text-center py-16">
                  <LuCircleCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />

                  <h2 className="text-3xl font-black dark:text-white mb-2">
                    Message Sent!
                  </h2>

                  <p className="text-gray-500">We’ll reply within 24 hours.</p>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-brand-blue font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* NAME + EMAIL */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white transition"
                    />

                    <input
                      required
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white transition"
                    />
                  </div>

                  <input
                    required
                    type="text"
                    placeholder="Subject"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white transition"
                  />

                  <textarea
                    required
                    rows="5"
                    placeholder="Your message..."
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white resize-none transition"
                  />

                  <button
                    type="submit"
                    className="relative flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-brand-gradient text-white font-bold overflow-hidden group hover:shadow-2xl  transition-all duration-300 cursor-pointer w-full"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Send Message
                      <LuSend size={18} />
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition duration-700"></span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= LOCATION ================= */}
      <section className="py-20 px-6 text-center border-t border-gray-100 dark:border-gray-800">
        <LuMapPin className="mx-auto text-brand-blue w-10 h-10 opacity-40 mb-4" />

        <h3 className="text-2xl font-bold dark:text-white">
          Based in Sahiwal, Pakistan
        </h3>

        <p className="text-gray-500 mt-2">
          Building smart energy solutions for Pakistan 🇵🇰
        </p>
      </section>
    </div>
  );
};

export default Contact;
