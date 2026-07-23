import React, { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../../services/settingsService";
import NotificationPreferenceForm from "../../components/waterAuthority/NotificationPreferenceForm";

export default function NotificationSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = (fields) => {
    setSettings((prev) => ({ ...prev, ...fields }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await updateSettings(settings);
      setSettings(res.data);
      setMessage("Notification preferences updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage("Error updating notification settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Notification Settings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure system broad alert dispatch rules and active delivery channels.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-icons text-sm">save</span>
          {saving ? "Saving..." : "Save Preferences"}
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
        <div className="max-w-2xl">
          <NotificationPreferenceForm settings={settings} onChange={handleUpdate} />
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">
          Could not load notification preferences.
        </div>
      )}
    </div>
  );
}
