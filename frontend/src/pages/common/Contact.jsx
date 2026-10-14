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
