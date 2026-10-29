import React, { useState, useEffect, useRef } from "react";
import {
  LuSearch,
  LuFilter,
  LuUserCheck,
  LuUserX,
  LuEye,
  LuDownload,
  LuUsers,
  LuZap,
  LuLink,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { axiosServerInstance } from "../../axios.js";
import { UserDetailModal } from "../../components/Admin";
import { useAuth } from "../../hooks/useAuth";

const ManageUsers = () => {
  const { user: currentAdmin } = useAuth();
  const statusLock = useRef(false);
  const mounted = useRef(true);
  const [statusBusy, setStatusBusy] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    let active = true;
    mounted.current = true;
    axiosServerInstance.get("/admin/users").then((res) => {
      if (active && res.data.success) setUsers(res.data.users);
    }).catch((error) => {
      if (active) toast.error(error.response?.data?.message || "Failed to load users");
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; mounted.current = false; };
  }, []);

  const handleToggleStatus = async (id) => {
    if (statusLock.current) return;
    statusLock.current = true;
    setStatusBusy(true);
    try {
      const res = await axiosServerInstance.patch(`/admin/users/${id}/status`);
      if (!mounted.current) return;
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers((previous) => previous.map((user) => user._id === id ? res.data.user : user));
        setSelectedUser((previous) => previous?._id === id ? res.data.user : previous);
      }
    } catch (error) {
      if (mounted.current) toast.error(error.response?.data?.message || "Failed to update status");
    } finally { statusLock.current = false; if (mounted.current) setStatusBusy(false); }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.referenceNo?.includes(searchTerm);
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const threePhaseUsers = users.filter((u) => u.meterType === "three").length;
  const notLinkedUsers = users.filter((u) => !u.referenceNo).length;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-bold">
        Loading users...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white italic">
            Manage Users
          </h1>
          <p className="text-gray-500 font-medium">
            System Control & Consumer Monitoring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<LuUsers />}
          label="Total Users"
          value={totalUsers}
          color="blue"
        />
        <StatCard
          icon={<LuUserCheck />}
          label="Active"
          value={activeUsers}
          color="emerald"
        />
        <StatCard
          icon={<LuZap />}
          label="Three Phase"
          value={threePhaseUsers}
          color="amber"
        />
        <StatCard
          icon={<LuLink />}
          label="Not Linked"
          value={notLinkedUsers}
          color="red"
        />
      </div>

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
        <select
          className=" cursor-pointer px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:text-white border-none outline-none font-bold text-sm"
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

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
              {filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                        {u.fullName?.[0]}
                      </div>
                      <div>
                        <div className="font-bold dark:text-white text-sm">
                          {u.fullName}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">
                    {u.referenceNo || "---"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${u.meterType === "three" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {u.meterType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${u.isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-gray-400"}`}
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
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        disabled={statusBusy || u._id === currentAdmin?._id}
                        aria-label={u.isActive ? `Deactivate ${u.fullName}` : `Activate ${u.fullName}`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <LuUserX size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedUser && (
            <UserDetailModal
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onToggleStatus={handleToggleStatus}
              statusBusy={statusBusy}
              currentAdminId={currentAdmin?._id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

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
