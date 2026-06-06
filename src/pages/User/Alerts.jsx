import React, { useState } from 'react';
import { 
  LuBell, 
  LuTriangleAlert, 
  LuZap, 
  LuInfo, 
  LuCheckCheck, 
  LuTrash2, 
  LuBellOff 
} from "react-icons/lu";

const Alerts = () => {
  // 1. Simple State for Alerts Data
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Slab Breach Warning',
      desc: 'You are at 292 units. Only 8 units left before you jump to the 300+ slab (Rs. 42/unit).',
      time: '5 mins ago',
      isRead: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Peak Hours Active',
      desc: 'Peak hours (6 PM - 10 PM) are currently active. Rates are 25% higher during this window.',
      time: '1 hour ago',
      isRead: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Monthly Goal Update',
      desc: 'Great job! You are using 12% less energy compared to the same date last month.',
      time: 'Yesterday',
      isRead: true
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  // 2. Logic: Filter and Actions
  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'critical') return alert.type === 'critical';
    if (activeTab === 'unread') return !alert.isRead;
    return true;
  });

  const markAsRead = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  // Helper to get Icon based on Type
  const getIcon = (type) => {
    switch (type) {
      case 'critical': return <LuTriangleAlert className="text-red-500" size={24} />;
      case 'warning': return <LuZap className="text-amber-500" size={24} />;
      default: return <LuInfo className="text-brand-blue" size={24} />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <LuBell className="text-brand-blue" /> Alerts & Notifications
          </h1>
          <p className="text-gray-500 font-medium">Actionable insights to save your bill</p>
        </div>
        <button 
          onClick={() => setAlerts([])}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition flex items-center gap-1"
        >
          <LuTrash2 size={14} /> Clear All
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        {['all', 'critical', 'unread'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
              ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ALERTS LIST */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`group relative bg-white dark:bg-[#1E293B] p-6 rounded-[30px] border transition-all duration-300 ${
                alert.isRead 
                ? 'border-gray-100 dark:border-gray-800 opacity-70' 
                : 'border-brand-blue/20 shadow-md ring-1 ring-brand-blue/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  alert.type === 'critical' ? 'bg-red-50' : 
                  alert.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                } dark:bg-gray-800`}>
                  {getIcon(alert.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-black text-lg ${alert.isRead ? 'text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                      {alert.title}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                    {alert.desc}
                  </p>
                  
                  {/* ACTIONS */}
                  <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!alert.isRead && (
                      <button 
                        onClick={() => markAsRead(alert.id)}
                        className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg"
                      >
                        <LuCheckCheck size={12} /> Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"
                    >
                      <LuTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* EMPTY STATE */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-full text-gray-300">
              <LuBellOff size={60} />
            </div>
            <div>
              <h3 className="text-xl font-black dark:text-white">All caught up!</h3>
              <p className="text-gray-500 font-medium italic">No new alerts or slab warnings at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;