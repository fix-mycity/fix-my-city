import React from "react";

export default function DepartmentProfileCard({ profile = {} }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      {/* Banner */}
      <div className="h-32 bg-slate-950 relative overflow-hidden">
        <img
          src={profile.department_banner || "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop"}
          alt="Banner"
          className="w-full h-full object-cover opacity-60"
        />
        {/* Logo */}
        <div className="absolute left-6 -bottom-6 h-16 w-16 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-800 shadow-md">
          <img
            src={profile.department_logo || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=100&auto=format&fit=crop"}
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="pt-8 p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Water Management Authority</h3>
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline mt-1 inline-block"
          >
            {profile.website || "https://water.municipal.city.gov"}
          </a>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {profile.department_description || "No description provided."}
        </p>
        <div className="text-[11px] text-slate-500 font-medium">
          Social Handles: {profile.social_links || "None linked"}
        </div>
      </div>
    </div>
  );
}
