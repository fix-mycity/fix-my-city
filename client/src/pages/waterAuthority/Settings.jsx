import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import { getSettings, updateSettings } from "../../services/settingsService";
import { getDepartmentProfile, updateDepartmentProfile } from "../../services/departmentProfileService";

import DepartmentProfileCard from "../../components/waterAuthority/DepartmentProfileCard";
import OfficeInformationCard from "../../components/waterAuthority/OfficeInformationCard";
import WorkingHoursForm from "../../components/waterAuthority/WorkingHoursForm";
import EmergencyContactCard from "../../components/waterAuthority/EmergencyContactCard";
import NotificationPreferenceForm from "../../components/waterAuthority/NotificationPreferenceForm";
import DashboardPreferenceForm from "../../components/waterAuthority/DashboardPreferenceForm";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile_card");

  // Profile fields state
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [website, setWebsite] = useState("");
  const [social, setSocial] = useState("");
  const [desc, setDesc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        getSettings(),
        getDepartmentProfile()
      ]);
      setSettings(settingsRes.data);
      setProfile(profileRes.data);
      
      setLogo(profileRes.data.department_logo || "");
      setBanner(profileRes.data.department_banner || "");
      setWebsite(profileRes.data.website || "");
      setSocial(profileRes.data.social_links || "");
      setDesc(profileRes.data.department_description || "");
    } catch (err) {
      console.error("Failed to load settings data:", err);
      toast.error("Failed to load settings.");
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
    try {
      if (activeSection === "profile_card") {
        const res = await updateDepartmentProfile({
          department_logo: logo,
          department_banner: banner,
          website: website,
          social_links: social,
          department_description: desc
        });
        setProfile(res.data);
        toast.success("Department Profile saved successfully!");
      } else {
        const res = await updateSettings(settings);
        setSettings(res.data);
        toast.success("Settings configurations saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Error updating configurations.");
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
    { id: "dashboard", label: "Dashboard Settings", icon: "dashboard" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Water Authority Settings & Configurations
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Manage public department profiles, office information, supply timings, and notification channels.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#2563eb' }}>
            autorenew
          </span>
        </div>
      ) : settings ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: '1.5rem' }}>
          {/* Settings Sidebar list */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            alignSelf: 'start',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            {sidebarSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    border: 'none',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#2563eb' : '#64748b' }}>
                    {sec.icon}
                  </span>
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* Settings Form panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activeSection === "profile_card" && profile && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <DepartmentProfileCard profile={profile} />
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    Edit Public Department Profile
                  </h3>

                  <div>
                    <label className="water-label">Logo Image URL</label>
                    <input
                      type="text"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="https://..."
                      className="water-input"
                    />
                  </div>

                  <div>
                    <label className="water-label">Banner Image URL</label>
                    <input
                      type="text"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      placeholder="https://..."
                      className="water-input"
                    />
                  </div>

                  <div>
                    <label className="water-label">Official Website URL</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://water.municipal.city.gov"
                      className="water-input"
                    />
                  </div>

                  <div>
                    <label className="water-label">Social Media Handles</label>
                    <input
                      type="text"
                      value={social}
                      onChange={(e) => setSocial(e.target.value)}
                      placeholder="twitter: @CityWater, facebook: CityWaterAuthority"
                      className="water-input"
                    />
                  </div>

                  <div>
                    <label className="water-label">Department Description</label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows="3"
                      placeholder="Public description of the municipal water authority..."
                      className="water-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "office" && (
              <OfficeInformationCard settings={settings} onUpdate={handleSettingsUpdate} />
            )}

            {activeSection === "supply" && (
              <WorkingHoursForm settings={settings} onUpdate={handleSettingsUpdate} />
            )}

            {activeSection === "emergency" && (
              <EmergencyContactCard settings={settings} onUpdate={handleSettingsUpdate} />
            )}

            {activeSection === "notifications" && (
              <NotificationPreferenceForm settings={settings} onUpdate={handleSettingsUpdate} />
            )}

            {activeSection === "dashboard" && (
              <DashboardPreferenceForm settings={settings} onUpdate={handleSettingsUpdate} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
