import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrafficPageHeader = ({ 
  title, 
  subtitle, 
  actionLabel, 
  onAction, 
  actionIcon = <Plus className="w-4 h-4 mr-2" />,
  backTo = null
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-4">
        {backTo && (
          <button 
            onClick={() => navigate(backTo)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
        >
          {actionIcon}
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default TrafficPageHeader;
