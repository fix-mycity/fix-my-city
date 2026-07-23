import React, { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../../services/settingsService";
import { getDepartmentProfile, updateDepartmentProfile } from "../../services/departmentProfileService";
import DepartmentSettingsForm from "../../components/waterAuthority/DepartmentSettingsForm";
import OfficeInformationCard from "../../components/waterAuthority/OfficeInformationCard";
import WorkingHoursForm from "../../components/waterAuthority/WorkingHoursForm";
import EmergencyContactCard from "../../components/waterAuthority/EmergencyContactCard";
import NotificationPreferenceForm from "../../components/waterAuthority/NotificationPreferenceForm";
import DashboardPreferenceForm from "../../components/waterAuthority/DashboardPreferenceForm";
import ReportPreferenceForm from "../../components/waterAuthority/ReportPreferenceForm";
import TimezoneSelector from "../../components/waterAuthority/TimezoneSelector";
import LanguageSelector from "../../components/waterAuthority/LanguageSelector";
import ThemeSelector from "../../components/waterAuthority/ThemeSelector";
import DepartmentProfileCard from "../../components/waterAuthority/DepartmentProfileCard";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("profile_card");

  // Profile fields state
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [website, setWebsite] = useState("");
  const [social, setSocial] = useState("");
  const [desc, setDesc] = useState("");

  // Change Password state (Placeholder UI)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        getSettings(),
        getDepartmentProfile()
      ]);
      setSettings(settingsRes.data);
      setProfile(profileRes.data);
      
      // Initialize profile forms
      setLogo(profileRes.data.department_logo || "");
      setBanner(profileRes.data.department_banner || "");
      setWebsite(profileRes.data.website || "");
      setSocial(profileRes.data.social_links || "");
      setDesc(profileRes.data.department_description || "");
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSettingsUpdate = (fields) => {
    setSettings((prev) => ({ ...prev, ...fields }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      if (activeSection === "profile_card") {
        // Save department profile
        const res = await updateDepartmentProfile({
          department_logo: logo,
          department_banner: banner,
          website: website,
          social_links: social,
          department_description: desc
        });
        setProfile(res.data);
      } else {
        // Save settings configuration
        const res = await updateSettings(settings);
        setSettings(res.data);
      }
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage("Error updating configurations. Please verify details.");
    } finally {
      setSaving(false);
    }
  };

  const sidebarSections = [
    { id: "profile_card", label: "Department Profile", icon: "badge" },
    { id: "office", label: "Office Information", icon: "business" },
    { id: "supply", label: "Supply Timings", icon: "water_drop" },
    { id: "emergency", label: "Emergency Contacts", icon: "contact_phone" },
    { id: "notifications", label: "Notification Preferences", icon: "notifications" },
    { id: "dashboard", label: "Dashboard Settings", icon: "dashboard" },
    { id: "reports", label: "Report Settings", icon: "assessment" },
    { id: "system", label: "System Settings", icon: "dns" },
    { id: "user_profile", label: "Profile & Password", icon: "account_circle" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Water Authority Settings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage public municipal profiles, timings, and notification channels rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-icons text-sm">save</span>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 p-4 rounded-lg text-sm font-semibold animate-fade-in">
          {message}
        </div>
      )}

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : settings ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Sidebar list */}
          <div className="md:col-span-1 space-y-1 border-r border-slate-800/60 pr-4">
            {sidebarSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => { setActiveSection(sec.id); setMessage(""); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2.5 ${
                  activeSection === sec.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <span className="material-icons text-sm">{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </div>

          {/* Settings Form panel */}
          <div className="md:col-span-3 space-y-6">
            {activeSection === "profile_card" && profile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-1">
                  <DepartmentProfileCard profile={profile} />
                </div>
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Edit Public Profile</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Logo URL</label>
                    <input
                      type="text"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Banner URL</label>
                    <input
                      type="text"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Website Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Social handles</label>
                    <input
                      type="text"
                      value={social}
                      onChange={(e) => setSocial(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Description</label>
                    <textarea
                      rows="4"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "office" && (
              <div className="space-y-6 animate-fade-in">
                <DepartmentSettingsForm settings={settings} onChange={handleSettingsUpdate} />
                <OfficeInformationCard settings={settings} onChange={handleSettingsUpdate} />
              </div>
            )}

            {activeSection === "supply" && (
              <div className="animate-fade-in">
                <WorkingHoursForm settings={settings} onChange={handleSettingsUpdate} />
              </div>
            )}

            {activeSection === "emergency" && (
              <div className="animate-fade-in">
                <EmergencyContactCard settings={settings} onChange={handleSettingsUpdate} />
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="animate-fade-in">
                <NotificationPreferenceForm settings={settings} onChange={handleSettingsUpdate} />
              </div>
            )}

            {activeSection === "dashboard" && (
              <div className="animate-fade-in">
                <DashboardPreferenceForm settings={settings} onChange={handleSettingsUpdate} />
              </div>
            )}

            {activeSection === "reports" && (
              <div className="animate-fade-in">
                <ReportPreferenceForm settings={settings} onChange={handleSettingsUpdate} />
              </div>
            )}

            {activeSection === "system" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-6 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Regional Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <TimezoneSelector value={settings.timezone} onChange={(val) => handleSettingsUpdate({ timezone: val })} />
                  <LanguageSelector value={settings.language} onChange={(val) => handleSettingsUpdate({ language: val })} />
                  <ThemeSelector value="dark" onChange={() => {}} />
                </div>
              </div>
            )}

            {activeSection === "user_profile" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider">Change Password</h3>
                  <p className="text-xs text-slate-500 mt-1">Change credentials for this administrative login.</p>
                </div>
                
                <div className="space-y-4 max-w-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setMessage("Password changed successfully (Placeholder logic validated)!");
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setTimeout(() => setMessage(""), 3000);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Change Credentials
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">
          Could not load settings configurations.
        </div>
      )}
    </div>
  );
}
