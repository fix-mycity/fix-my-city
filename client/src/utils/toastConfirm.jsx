import React from 'react';
import { toast } from 'react-hot-toast';

export const toastConfirm = (message, onConfirm, onCancel = () => {}) => {
  toast((t) => (
    <div className="flex flex-col gap-3 min-w-[250px]">
      <p className="font-semibold text-slate-800 text-sm">{message}</p>
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onCancel();
          }}
          className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          Confirm
        </button>
      </div>
    </div>
  ), { 
    duration: Infinity,
    position: 'top-center',
    style: {
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f1f5f9'
    }
  });
};
