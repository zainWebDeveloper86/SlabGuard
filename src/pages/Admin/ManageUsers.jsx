import React, { useState } from "react";
import {
  LuSearch,
  LuFilter,
  LuUserCheck,
  LuUserX,
  LuEye,
  LuDownload,
  LuUsers,
  LuZap,
  LuTriangleAlert,
} from "react-icons/lu";
import { UserDetailModal } from "../../components/Admin";

const ManageUsers = () => {
  // Mock Data (Jab backend ready ho jaye to yahan fetch lagana)
  const [users] = useState([
    {
      id: 1,
      name: "Zain Ahmed",
      email: "zain@email.com",
      refNo: "14123456789012",
      role: "user",
      phase: "three",
      status: "active",
      joined: "2026-02-15",
    },
    {
      id: 2,
      name: "Admin Ali",
      email: "admin@slabguard.com",
      refNo: "14183416711912",
      role: "admin",
      phase: "single",
      status: "active",
      joined: "2025-12-01",
    },
    {
      id: 3,
      name: "Hamza Khan",
      email: "hamza@email.com",
      refNo: "14987654321098",
      role: "user",
      phase: "single",
      status: "pending",
      joined: "2026-04-10",
    },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);

  // Modal ko close karne ka function
  const handleCloseModal = () => setSelectedUser(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white italic">
            Manage Users
          </h1>
          <p className="text-gray-500 font-medium">
            System Control & Consumer Monitoring
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition cursor-pointer">
          <LuDownload size={20} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<LuUsers />}
          label="Total Users"
          value="1,284"
          color="blue"
        />
        <StatCard
          icon={<LuUserCheck />}
          label="Active Now"
          value="452"
          color="emerald"
        />
        <StatCard
          icon={<LuZap />}
          label="Three Phase"
          value="128"
          color="amber"
        />
        <StatCard
          icon={<LuTriangleAlert />}
          label="Flagged"
          value="12"
          color="red"
        />
      </div>

      {/* 2. Search & Filters */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <LuSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email or reference no..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 ring-brand-blue/20 border border-transparent transition"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:text-white border-none outline-none font-bold text-sm"
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <button className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-500 hover:text-brand-blue transition cursor-pointer">
            <LuFilter size={20} />
          </button>
        </div>
      </div>

      {/* 3. Main Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[35px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 text-xs uppercase tracking-widest">
                <th className="px-6 py-5 font-black">User Profile</th>
                <th className="px-6 py-5 font-black">Reference No</th>
                <th className="px-6 py-5 font-black text-center">Phase</th>
                <th className="px-6 py-5 font-black text-center">Status</th>
                <th className="px-6 py-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-bold dark:text-white text-sm">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">
                    {u.refNo || "---"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                          u.phase === "three"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {u.phase}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          u.status === "active"
                            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-brand-blue transition cursor-pointer"
                      >
                        <LuEye size={18} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-500 transition cursor-pointer">
                        <LuUserX size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedUser && (
            <UserDetailModal user={selectedUser} onClose={handleCloseModal} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---
const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-2xl text-white shadow-lg ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-2xl font-black dark:text-white">{value}</h3>
      </div>
    </div>
  );
};

export default ManageUsers;
