import React, { useState, useEffect } from "react";
import { getDepartmentProfile, updateDepartmentProfile } from "../../services/departmentProfileService";
import DepartmentProfileCard from "../../components/waterAuthority/DepartmentProfileCard";

export default function DepartmentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentProfile();
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load department profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = (fields) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await updateDepartmentProfile(profile);
      setProfile(res.data);
      setMessage("Branding Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setMessage("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Department Branding Profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            Customize logos, banner images, and descriptions displayed to public citizen portals.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-icons text-sm font-bold">save</span>
          {saving ? "Saving..." : "Save Branding"}
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
      ) : profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DepartmentProfileCard profile={profile} />
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Edit Branding Materials</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Logo URL</label>
              <input
                type="text"
                value={profile.department_logo || ""}
                onChange={(e) => handleUpdate({ department_logo: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Banner Image URL</label>
              <input
                type="text"
                value={profile.department_banner || ""}
                onChange={(e) => handleUpdate({ department_banner: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Website URL</label>
              <input
                type="text"
                value={profile.website || ""}
                onChange={(e) => handleUpdate({ website: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Social Links</label>
              <input
                type="text"
                value={profile.social_links || ""}
                onChange={(e) => handleUpdate({ social_links: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Department Description</label>
              <textarea
                rows="4"
                value={profile.department_description || ""}
                onChange={(e) => handleUpdate({ department_description: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">
          Could not load branding settings.
        </div>
      )}
    </div>
  );
}
