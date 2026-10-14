import React, { useState, useEffect } from "react";
import {
  LuMessageCircleQuestion,
  LuChevronDown,
  LuChevronUp,
  LuSend,
  LuMail,
  LuClock,
  LuShieldCheck,
  LuCircleCheck,
  LuCircleAlert,
  LuCircleX,
  LuUser,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";

const faqs = [
  {
    q: "How accurate is my bill prediction?",
    a: "SlabGuard's forecasting model improves as more billing history is synced. Unusual loads (such as extra AC usage) can affect the prediction.",
  },
  {
    q: "When do peak hours start?",
    a: "According to MEPCO, peak hours change according to the season. Currently, they are from 6:00 PM to 10:00 PM. During these hours, the per-unit rate is significantly higher.",
  },
  {
    q: "What does a slab breach alert mean?",
    a: "This means your current usage is pushing you out of the 'Protected' slab (200 units), which could increase your per-unit rate.",
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "Open":
      return { icon: LuCircleAlert, color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" };
    case "In-Progress":
      return { icon: LuClock, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" };
    case "Resolved":
      return { icon: LuCircleCheck, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" };
    default:
      return { icon: LuCircleX, color: "text-gray-500 bg-gray-50 dark:bg-gray-500/10" };
  }
};

const Support = () => {
  const [activeTab, setActiveTab] = useState("new"); // "new" | "mine"
  const [openFaq, setOpenFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("Billing Discrepancy");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [myTickets, setMyTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);

  const fetchMyTickets = async () => {
    try {
      const res = await axiosServerInstance.get("/support-tickets/me");
      if (res.data.success) setMyTickets(res.data.tickets);
    } catch (error) {
      toast.error("Failed to load your tickets");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please describe your issue");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axiosServerInstance.post("/support-tickets", {
        category,
        message,
      });
      if (res.data.success) {
        setSubmitted(true);
        fetchMyTickets(); // refresh "My Tickets" so the new one shows up immediately
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setMessage("");
    setCategory("Billing Discrepancy");
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      {/* ================= SECTION HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue">
            <LuMessageCircleQuestion size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Help Center</h1>
            <p className="text-gray-500 font-medium">SlabGuard support is here to assist you 24/7</p>
          </div>
        </div>

        {/* TAB SWITCHER — new ticket vs my tickets */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
          {[
            { id: "new", label: "New Ticket" },
            { id: "mine", label: `My Tickets${myTickets.length ? ` (${myTickets.length})` : ""}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-brand-blue shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "new" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ================= LEFT: FAQs ================= */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl font-black dark:text-white mb-4 italic">Common Questions</h3>
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
                    <span className="font-bold text-gray-700 dark:text-gray-200">{faq.q}</span>
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

            <div className="bg-brand-gradient p-8 rounded-[40px] text-white shadow-xl shadow-blue-500/20">
              <h4 className="font-black text-xl mb-2 italic">Pro Tip!</h4>
              <p className="text-sm opacity-90 leading-relaxed font-medium">
                You can update your reference number from the dashboard settings if the bill is not being fetched.
              </p>
            </div>
          </div>

          {/* ================= RIGHT: SUPPORT FORM ================= */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#1E293B] p-8 md:p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden h-full">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <LuCircleCheck size={40} />
                  </div>
                  <h2 className="text-3xl font-black dark:text-white mb-2">Ticket Raised!</h2>
                  <p className="text-gray-500 max-w-xs mx-auto">Our Team will be contact you in next 24 hours.</p>
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleSubmitAnother}
                      className="text-brand-blue font-bold hover:underline italic underline-offset-8"
                    >
                      Submit another query
                    </button>
                    <button
                      onClick={() => setActiveTab("mine")}
                      className="text-gray-500 font-bold hover:underline italic underline-offset-8"
                    >
                      View my tickets
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black dark:text-white italic">Send us a Message</h3>
                    <p className="text-sm text-gray-400 font-medium">Briefly explain your issue or feedback.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                        Issue Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white font-bold appearance-none"
                      >
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
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your issue details here..."
                        className="w-full px-6 py-4 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue focus:ring-0 transition outline-none dark:text-white resize-none font-medium"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-gradient text-white py-5 rounded-full font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Ticket"} <LuSend size={20} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= MY TICKETS TAB — NEW ================= */
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoadingTickets ? (
            <p className="text-center text-gray-400 font-bold py-16">Loading your tickets...</p>
          ) : myTickets.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <LuMessageCircleQuestion size={50} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-bold">You haven't raised any tickets yet.</p>
              <button
                onClick={() => setActiveTab("new")}
                className="text-brand-blue font-bold hover:underline"
              >
                Raise your first ticket
              </button>
            </div>
          ) : (
            myTickets.map((ticket) => {
              const { icon: StatusIcon, color } = getStatusStyle(ticket.status);
              return (
                <div
                  key={ticket._id}
                  className="bg-white dark:bg-[#1E293B] p-6 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                        {ticket.category}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-full ${color}`}>
                        <StatusIcon size={10} /> {ticket.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{timeAgo(ticket.createdAt)}</span>
                  </div>

                  {/* User's own message */}
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none text-sm font-medium text-gray-700 dark:text-gray-300">
                      {ticket.message}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-1 ml-1">You</span>
                  </div>

                  {/* Admin reply, if any */}
                  {ticket.adminReply ? (
                    <div className="flex flex-col items-end max-w-[85%] ml-auto mt-4">
                      <div className="bg-brand-blue p-4 rounded-2xl rounded-tr-none text-sm font-medium text-white shadow-sm">
                        {ticket.adminReply}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 mt-1 mr-1 flex items-center gap-1">
                        <LuUser size={10} /> Support Team •{" "}
                        {ticket.repliedAt ? timeAgo(ticket.repliedAt) : ""}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-4">
                      Waiting for a response from our support team...
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= BOTTOM: CONTACT INFO CARDS ================= */}
      {activeTab === "new" && (
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
      )}
    </div>
  );
};

export default Support;