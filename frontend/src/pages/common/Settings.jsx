import React, { useState, useRef } from "react";
import {
  LuUser,
  LuZap,
  LuShieldCheck,
  LuCamera,
  LuSave,
  LuTrash2,
  LuTriangleAlert,
  LuBell,
  LuCpu,
  LuSnowflake,
  LuKey,
  LuCopy,
  LuUtensilsCrossed,
} from "react-icons/lu";
import { FaHome } from "react-icons/fa";
import toast from "react-hot-toast";
// import useravator from "../../assets/avator.jpg";
import { useAuth } from "../../hooks/useAuth";
import { axiosServerInstance, backend_url } from "../../axios.js";
import { useEffect } from "react";

const getPakistanToday = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

const Settings = () => {
  const { user, login } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("profile");
  const [savingTab, setSavingTab] = useState(null);

  // ---------------- IoT Device Pairing ----------------
  const [deviceKey, setDeviceKey] = useState(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const [profileForm, setProfileForm] = useState({ fullName: "", email: "" });
  const [electricityForm, setElectricityForm] = useState({
    referenceNo: "",
    meterType: "single",
    sanctionedLoad: 0,
    unitTarget: 300,
    readingSchedule: { lastConfirmedReadingDate: "", expectedDayFrom: "", expectedDayTo: "" },
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      fullName: user.fullName || "",
      email: user.email || "",
    });
    setElectricityForm({
      referenceNo: user.referenceNo || "",
      meterType: user.meterType || "single",
      sanctionedLoad: user.sanctionedLoad ?? 0,
      unitTarget: user.unitTarget ?? 300,
      readingSchedule: {
        lastConfirmedReadingDate: user.readingSchedule?.lastConfirmedReadingDate ?? "",
        expectedDayFrom: user.readingSchedule?.expectedDayFrom ?? "",
        expectedDayTo: user.readingSchedule?.expectedDayTo ?? "",
      },
    });
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await axiosServerInstance.patch("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        login({ ...user, ...res.data.user });
        toast.success("Avatar updated!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <LuUser size={18} /> },
    ...(!isAdmin
      ? [
          {
            id: "electricity",
            label: "Electricity",
            icon: <LuZap size={18} />,
          },
          { id: "appliances", label: "Appliances", icon: <LuCpu size={18} /> },
          { id: "device", label: "Device Key", icon: <LuKey size={18} /> },
          { id: "notifications", label: "Alerts", icon: <LuBell size={18} /> },
        ]
      : []),
    { id: "security", label: "Security", icon: <LuShieldCheck size={18} /> },
  ];

  // ---------------- Profile ----------------
  const saveProfile = async () => {
    if (!profileForm.fullName || !profileForm.email) {
      toast.error("Full name and email are required");
      return;
    }
    setSavingTab("profile");
    try {
      const res = await axiosServerInstance.patch("/user/profile", profileForm);
      if (res.data.success) {
        login({ ...user, ...res.data.user }); // sync AuthContext with new data
        toast.success("Profile updated!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingTab(null);
    }
  };

  // ---------------- Electricity (reuses the same endpoint ApplicationForm uses) ----------------
  const updateReadingSchedule = (field, value) => {
    setElectricityForm((previous) => ({
      ...previous,
      readingSchedule: { ...previous.readingSchedule, [field]: value },
    }));
  };

  const saveElectricity = async () => {
    const referenceNo = electricityForm.referenceNo.trim();
    const { meterType, sanctionedLoad } = electricityForm;
    if (!referenceNo || !meterType || sanctionedLoad === "") {
      toast.error(
        "Reference number, meter type and sanctioned load are required",
      );
      return;
    }
    const { lastConfirmedReadingDate, expectedDayFrom, expectedDayTo } = electricityForm.readingSchedule;
    if ((expectedDayFrom === "") !== (expectedDayTo === "")) {
      toast.error("Enter both expected reading days, or leave both blank");
      return;
    }
    if (expectedDayFrom !== "" && (
      !Number.isInteger(Number(expectedDayFrom)) || !Number.isInteger(Number(expectedDayTo)) ||
      Number(expectedDayFrom) < 1 || Number(expectedDayTo) > 31 ||
      Number(expectedDayFrom) > Number(expectedDayTo)
    )) {
      toast.error("Enter a reading window from 1 to 31, with the start day before or equal to the end day");
      return;
    }
    if (lastConfirmedReadingDate && lastConfirmedReadingDate > getPakistanToday()) {
      toast.error("Last confirmed reading date cannot be in the future");
      return;
    }
    setSavingTab("electricity");
    try {
      const res = await axiosServerInstance.patch("/user/application", {
        ...electricityForm,
        referenceNo,
        sanctionedLoad: Number(electricityForm.sanctionedLoad),
        unitTarget: Number(electricityForm.unitTarget),
      });
      if (res.data.success) {
        login({ ...user, ...res.data.user });
        toast.success("Electricity details updated!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update electricity details",
      );
    } finally {
      setSavingTab(null);
    }
  };

  // ---------------- Appliances ----------------

  // Inside Settings component, after electricityForm state
  const [applianceForm, setApplianceForm] = useState({
    ac_qty: 0,
    ac_type: "Inverter",
    ac_ton: "1.5",
    fridge_qty: 1,
    oven_type: "Microwave",
    water_pump_hrs: "1-2 Hours",
    geyser_type: "Gas",
    washing_machine_freq: "3 times a week",
    occupancy: "Occupied",
    consentToAlerts: false,
  });

  // Fetch existing appliance profile when tab becomes active
  useEffect(() => {
    if (activeTab === "appliances") {
      const fetchApplianceProfile = async () => {
        try {
          const res = await axiosServerInstance.get("/appliance-profile/me");
          if (res.data.success && res.data.hasProfile) {
            const profile = res.data.profile;

            // Map camelCase from DB → snake_case for frontend state
            setApplianceForm({
              ac_qty: profile.acQty || 0,
              ac_type: profile.acType || "Inverter",
              ac_ton: profile.acTonnage || "1.5",
              fridge_qty: profile.fridgeQty ?? 1,
              oven_type: profile.ovenType || "Microwave",
              water_pump_hrs: profile.waterPumpHours || "1-2 Hours",
              geyser_type: profile.geyserType || "Gas",
              washing_machine_freq:
                profile.washingMachineFreq || "3 times a week",
              occupancy: profile.occupancy || "Occupied",
              consentToAlerts: profile.consentToAlerts || false,
            });
          }
        } catch (error) {
          console.error("Failed to fetch appliance profile:", error);
        }
      };
      fetchApplianceProfile();
    }
  }, [activeTab]); // runs every time tab changes

  const saveAppliances = async () => {
    setSavingTab("appliances");
    try {
      const res = await axiosServerInstance.put("/appliance-profile", {
        acQty: Number(applianceForm.ac_qty),
        acType: applianceForm.ac_type,
        acTonnage: Number(applianceForm.ac_ton),
        fridgeQty: Number(applianceForm.fridge_qty),
        ovenType: applianceForm.oven_type,
        waterPumpHours: applianceForm.water_pump_hrs,
        geyserType: applianceForm.geyser_type,
        washingMachineFreq: applianceForm.washing_machine_freq,
        occupancy: applianceForm.occupancy,
        consentToAlerts: applianceForm.consentToAlerts,
      });
      if (res.data.success) {
        toast.success("Appliance details updated!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update appliances",
      );
    } finally {
      setSavingTab(null);
    }
  };

  // ---------------- Iot Device Key  ----------------

  const generateDeviceKey = async () => {
    setIsGeneratingKey(true);
    try {
      const res = await axiosServerInstance.post("/user/device-key/regenerate");
      if (res.data.success) {
        setDeviceKey(res.data.deviceApiKey);
        toast.success("Device key generated!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate device key",
      );
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyDeviceKey = async () => {
    try {
      await navigator.clipboard.writeText(deviceKey);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy. Please select and copy the key manually.");
    }
  };
  // ---------------- Security ----------------
  const savePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingTab("security");
    try {
      const res = await axiosServerInstance.patch("/user/change-password", {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSavingTab(null);
    }
  };

  const isSaving = savingTab !== null;
  // console.log(user.avatar)

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black dark:text-white italic">
          Account Settings
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your identity and SlabGuard preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR TABS */}
        <div className="lg:w-66 flex flex-row lg:flex-col gap-3 max-lg:overflow-x-auto pb-6 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`outline-none cursor-pointer flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-[40px] border border-gray-100 dark:border-gray-800 p-6 md:p-10 shadow-sm min-h-[500px] flex flex-col">
          <div className="flex-1">
            {/* --- PROFILE --- */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-50 dark:border-gray-800 pb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                      <img
                        src={`${backend_url}${user.avatar}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.fullName || "User",
                          )}&background=2F5FF6&color=fff&size=128`;
                        }}
                      />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full shadow-lg hover:scale-110 transition cursor-pointer disabled:opacity-70"
                    >
                      <LuCamera size={16} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-black dark:text-white italic">
                      Your Photo
                    </h3>
                    <p className="text-sm text-gray-500">
                      {uploadingAvatar
                        ? "Uploading..."
                        : "Allowed JPG, GIF or PNG. Max size of 3MB"}
                    </p>
                  </div>
                  {/* <div className="text-center sm:text-left">
                    <h3 className="text-xl font-black dark:text-white italic">
                      Your Photo
                    </h3>
                    <p className="text-sm text-gray-500">
                      Photo upload coming soon.
                    </p>
                  </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      Full Name
                    </label>
                    <input
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- ELECTRICITY --- */}
            {activeTab === "electricity" && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      MEPCO Reference No
                    </label>
                    <input
                      value={electricityForm.referenceNo}
                      onChange={(e) =>
                        setElectricityForm({
                          ...electricityForm,
                          referenceNo: e.target.value,
                        })
                      }
                      placeholder="14 Digit Number"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      Meter Type
                    </label>
                    <select
                      value={electricityForm.meterType}
                      onChange={(e) =>
                        setElectricityForm({
                          ...electricityForm,
                          meterType: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                    >
                      <option value="single">Single Phase</option>
                      <option value="three">Three Phase</option>
                    </select>
                  </div>

                  {electricityForm.meterType === "three" && (
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-900/30 animate-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                          Sanctioned Load (kW)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={electricityForm.sanctionedLoad}
                          onChange={(e) =>
                            setElectricityForm({
                              ...electricityForm,
                              sanctionedLoad: e.target.value,
                            })
                          }
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                        />
                        <p className="text-[10px] text-gray-400 ml-2 italic">
                          Mentioned on the top-right corner of your bill.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 p-4">
                        <LuTriangleAlert size={24} />
                        <p className="text-xs font-medium italic">
                          MDI penalties may apply if load exceeds the sanctioned
                          limit.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      Monthly Unit Target
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electricityForm.unitTarget}
                      onChange={(e) =>
                        setElectricityForm({
                          ...electricityForm,
                          unitTarget: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                    />
                  </div>
                </div>
                <fieldset className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <legend className="text-sm font-black dark:text-white px-2">
                    Meter Reading Schedule (Optional)
                  </legend>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the last date your utility reader actually recorded the meter, and the
                    day range when you usually expect the next reading. Use your own area's schedule.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="last-confirmed-reading" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Last Confirmed Reading Date
                      </label>
                      <input
                        id="last-confirmed-reading"
                        type="date"                
                        max={getPakistanToday()}
                        value={electricityForm.readingSchedule.lastConfirmedReadingDate}
                        onChange={(e) => updateReadingSchedule("lastConfirmedReadingDate", e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:text-white font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="expected-reading-from" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Expected Reading: From Day
                      </label>
                      <input
                        id="expected-reading-from"
                        type="number" min="1" max="31" step="1" placeholder="e.g. 20"
                        value={electricityForm.readingSchedule.expectedDayFrom}
                        onChange={(e) => updateReadingSchedule("expectedDayFrom", e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:text-white font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="expected-reading-to" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Expected Reading: To Day
                      </label>
                      <input
                        id="expected-reading-to"
                        type="number" min="1" max="31" step="1" placeholder="e.g. 24"
                        value={electricityForm.readingSchedule.expectedDayTo}
                        onChange={(e) => updateReadingSchedule("expectedDayTo", e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    For example, 20 to 24 means an expected reading between those dates each month.
                    These settings are saved for now; predictions still use calendar months.
                  </p>
                  <button
                    type="button"
                    onClick={() => setElectricityForm((previous) => ({
                      ...previous,
                      readingSchedule: { lastConfirmedReadingDate: "", expectedDayFrom: "", expectedDayTo: "" },
                    }))}
                    className="text-sm text-brand-blue underline cursor-pointer"
                  >
                    Clear reading schedule
                  </button>
                  <p className="text-xs text-gray-400">Use Save Changes below to save or clear these details.</p>
                </fieldset>
              </div>
            )}

            {/* --- APPLIANCES --- */}
            {activeTab === "appliances" && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                {/* Cooling Section */}
                <div>
                  <h4 className="text-sm font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LuSnowflake className="text-blue-500" /> Cooling Appliances
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Number of ACs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={applianceForm.ac_qty}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            ac_qty: Number(e.target.value),
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        AC Type
                      </label>
                      <select
                        value={applianceForm.ac_type}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            ac_type: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option>Inverter</option>
                        <option>Non-Inverter</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        AC Tonnage
                      </label>
                      <select
                        value={applianceForm.ac_ton}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            ac_ton: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option value="1.0">1.0</option>
                        <option value="1.5">1.5</option>
                        <option value="2.0">2.0</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Refrigerator Qty
                      </label>
                      <select
                        value={applianceForm.fridge_qty}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            fridge_qty: Number(e.target.value),
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3+</option>
                      </select>
                    </div> */}
                    {/* Number of ACs */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Number of ACs
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={applianceForm.ac_qty}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            ac_qty: Number(e.target.value),
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      />
                    </div>

                    {/* ✅ Sirf tab dikhein jab ACs hain */}
                    {applianceForm.ac_qty > 0 && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-gray-400 ml-2">
                            AC Type
                          </label>
                          <select
                            value={applianceForm.ac_type}
                            onChange={(e) =>
                              setApplianceForm({
                                ...applianceForm,
                                ac_type: e.target.value,
                              })
                            }
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                          >
                            <option>Inverter</option>
                            <option>Non-Inverter</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-gray-400 ml-2">
                            AC Tonnage
                          </label>
                          <select
                            value={applianceForm.ac_ton}
                            onChange={(e) =>
                              setApplianceForm({
                                ...applianceForm,
                                ac_ton: e.target.value,
                              })
                            }
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                          >
                            <option value="1.0">1.0</option>
                            <option value="1.5">1.5</option>
                            <option value="2.0">2.0</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Kitchen & Heavy Load */}
                <div>
                  <h4 className="text-sm font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LuUtensilsCrossed className="text-orange-500" /> Kitchen &
                    Heavy Load
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Oven Type
                      </label>
                      <select
                        value={applianceForm.oven_type}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            oven_type: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option>Microwave</option>
                        <option>Electric Oven (OTG)</option>
                        <option>Both</option>
                        <option>None</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Water Pump (Daily Use)
                      </label>
                      <select
                        value={applianceForm.water_pump_hrs}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            water_pump_hrs: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option>Less than 1 Hour</option>
                        <option>1-2 Hours</option>
                        <option>More than 2 Hours</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Geyser Type
                      </label>
                      {/* <select
                        value={applianceForm.geyser_type}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            geyser_type: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option>Gas</option>
                        <option>Electric</option>
                        <option>Solar</option>
                      </select> */}
                      <select
                        value={applianceForm.geyser_type}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            geyser_type: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option value="None">None</option> {/* ✅ ADDED */}
                        <option value="Gas">Gas</option>
                        <option value="Electric">Electric</option>
                        <option value="Solar">Solar</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Washing Machine Frequency
                      </label>
                      <select
                        value={applianceForm.washing_machine_freq}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            washing_machine_freq: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option>1 time a week</option>
                        <option>2-3 times a week</option>
                        <option>4-5 times a week</option>
                        <option>Daily</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <h4 className="text-sm font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaHome className="text-emerald-500" /> Lifestyle
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-2">
                        Home Occupancy
                      </label>
                      <select
                        value={applianceForm.occupancy}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            occupancy: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      >
                        <option value="Empty">Empty during day</option>
                        <option value="Occupied">Occupied during day</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                      <input
                        type="checkbox"
                        checked={applianceForm.consentToAlerts}
                        onChange={(e) =>
                          setApplianceForm({
                            ...applianceForm,
                            consentToAlerts: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-brand-blue rounded cursor-pointer"
                      />
                      <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                        I agree to receive AI-driven saving alerts.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- DEVICE PAIRING --- */}
            {activeTab === "device" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="p-6 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-3xl flex items-start gap-4">
                  <LuCpu className="text-brand-blue shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white mb-1">
                      IoT Device Pairing
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      This key lets your smart meter sensor (ESP32) — or the
                      developer simulator — securely send hourly usage readings
                      to your account, without ever using your password.
                    </p>
                  </div>
                </div>

                {deviceKey ? (
                  <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-sm">
                      <LuTriangleAlert size={18} /> Save this now — it won't be
                      shown again
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 border border-amber-200 dark:border-amber-500/20">
                      <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                        {deviceKey}
                      </code>
                      <button
                        onClick={copyDeviceKey}
                        className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                      >
                        <LuCopy size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
                      Paste this into your ESP32 firmware, or into{" "}
                      <code>.device-key.json</code> for the simulator.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 font-medium">
                    No key generated in this session yet. Click below to create
                    one.
                  </p>
                )}

                <button
                  onClick={generateDeviceKey}
                  disabled={isGeneratingKey}
                  className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-2xl font-black text-sm hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <LuKey size={16} />
                  {isGeneratingKey
                    ? "Generating..."
                    : deviceKey
                      ? "Regenerate Key"
                      : "Generate Device Key"}
                </button>

                <p className="text-[11px] text-gray-400 italic">
                  Regenerating invalidates any previously issued key — devices
                  using the old key will stop working until updated.
                </p>
              </div>
            )}

            {/* --- TAB 3: NOTIFICATIONS --- */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <ToggleRow
                  title="Slab Breach Alerts"
                  desc="Receive a notification when usage is close to the next slab."
                  active
                />
                <ToggleRow
                  title="Peak Hour Reminder"
                  desc="Reminder to turn off appliances at 6 PM."
                  active
                />
                {electricityForm.meterType === "three" && (
                  <ToggleRow
                    title="MDI Overload Alert"
                    desc="Get alerted when load exceeds 90% of the sanctioned load."
                    active
                  />
                )}
                <ToggleRow
                  title="Weekly Usage Report"
                  desc="Receive a weekly summary via email every Sunday."
                />
              </div>
            )}

            {/* --- SECURITY --- */}
            {activeTab === "security" && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-brand-blue outline-none dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SAVE BUTTON — knows exactly which tab it's saving */}
          {activeTab !== "device" && (
            <div className="max-lg:mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-end">
              <button
                onClick={
                  activeTab === "profile"
                    ? saveProfile
                    : activeTab === "electricity"
                      ? saveElectricity
                      : activeTab === "appliances"
                        ? saveAppliances
                        : savePassword
                }
                disabled={isSaving}
                className="bg-brand-gradient text-white px-10 py-4 rounded-full font-black flex items-center gap-3 hover:shadow-xl hover:-translate-y-1 transition active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSaving ? "Saving..." : "Save Changes"} <LuSave size={18} />
              </button>
            </div>
          )}

          {/* Danger Zone */}
          {activeTab === "security" && (
            <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-red-500 font-black italic mb-2">
                Danger Zone
              </h4>
              <button
                disabled
                title="Account deletion not available yet"
                className="flex items-center gap-2 text-sm font-bold text-gray-400 cursor-not-allowed"
              >
                Delete my SlabGuard account and data (coming soon)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ title, desc, active = false }) => (
  <div className="flex items-center justify-between p-6 rounded-3xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
    <div>
      <h4 className="font-bold dark:text-white">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
    <div
      className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  </div>
);

export default Settings;
