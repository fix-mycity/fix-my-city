import React from "react";

export default function NotificationPreferenceForm({ settings = {}, onChange }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notification Channels Activation</h3>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
          <input
            type="checkbox"
            checked={!!settings.notification_email}
            onChange={(e) => onChange({ notification_email: e.target.checked })}
            className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <div>
            <span className="font-semibold text-white">Email Dispatches</span>
            <p className="text-[11px] text-slate-500">Send automatic alerts to email addresses</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
          <input
            type="checkbox"
            checked={!!settings.notification_sms}
            onChange={(e) => onChange({ notification_sms: e.target.checked })}
            className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <div>
            <span className="font-semibold text-white">SMS Broadcasts</span>
            <p className="text-[11px] text-slate-500">Send phone notifications via text</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
          <input
            type="checkbox"
            checked={!!settings.notification_push}
            onChange={(e) => onChange({ notification_push: e.target.checked })}
            className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-blue-500 h-4 w-4"
          />
          <div>
            <span className="font-semibold text-white">Push Notifications</span>
            <p className="text-[11px] text-slate-500">Send real-time mobile app alerts</p>
          </div>
        </label>
      </div>
    </div>
  );
}
