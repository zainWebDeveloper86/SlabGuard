import {
  LuLayoutDashboard,
  LuZap,
  LuChartLine,
  LuBell,
  LuLightbulb,
  LuUsers,
  LuShield,
  LuBrain,
  LuFileText,
  LuInfo,
  LuMessageCircleQuestion,
  LuTable,
  LuHistory,
  LuMegaphone,
} from "react-icons/lu";

export const sidebarMenuItems = {
  user: [
    {
      section: "Main",
      items: [{ name: "Dashboard", path: "/home", icon: LuLayoutDashboard }],
    },
    {
      section: "Energy",
      items: [
        { name: "Usage", path: "/usage", icon: LuZap },
        { name: "Bill Prediction", path: "/predict", icon: LuChartLine },
      ],
    },
    {
      section: "Insights",
      items: [
        { name: "History", path: "/history", icon: LuHistory },
        { name: "Alerts", path: "/alerts", icon: LuBell },
      ],
    },

    {
      section: "Resources",
      items: [
        { name: "Tariff Guide", path: "/tariff", icon: LuTable },
        { name: "Energy Saving Hacks", path: "/tips", icon: LuLightbulb },
        { name: "About SlabGuard", path: "/about-slabguard", icon: LuInfo },
      ],
    },
    {
      section: "Support",
      items: [
        {
          name: "Help & Support",
          path: "/support",
          icon: LuMessageCircleQuestion,
        },
      ],
    },
  ],

  admin: [
    {
      section: "Management",
      items: [
        { name: "Overview", path: "/admin", icon: LuShield },
        { name: "User Management", path: "/admin/manage-users", icon: LuUsers },
        {
          name: "Tariff & Slab Rates",
          path: "/admin/tariff-rates",
          icon: LuChartLine,
        },
      ],
    },
    {
      section: "System Intelligence",
      items: [
        { name: "AI Performance", path: "/admin/ai-performance", icon: LuBrain },
        { name: "OCR Validations", path: "/admin/ocr", icon: LuFileText },
      ],
    },
    {
      section: "Communication", // 🆕 Naya section broadcaster ke liye
      items: [
        { name: "Broadcaster", path: "/admin/broadcast", icon: LuMegaphone }, // Notification feature
        {
          name: "Support Tickets",
          path: "/admin/support",
          icon: LuMessageCircleQuestion,
        },
      ],
    },
    {
      section: "Security",
      items: [{ name: "System Logs", path: "/admin/logs", icon: LuFileText }],
    },
  ],
};
