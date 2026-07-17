import React from 'react';
import { Edit2, Trash2, MapPin, Mail, Ban, CheckCircle } from 'lucide-react';

const TrafficWorkerTable = ({ workers, onEdit, onDelete, onBlock }) => {
  if (!workers || workers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Workers Found</h3>
        <p className="text-slate-500">There are no traffic field workers registered yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Worker</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.map((worker) => (
              <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                      {worker.photo ? (
                        <img src={worker.photo} alt={worker.first_name || worker.username} className="w-full h-full object-cover" />
                      ) : (
                        worker.first_name?.charAt(0) || worker.username?.charAt(0) || 'W'
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{worker.first_name || worker.username} {worker.last_name}</div>
                      <div className="text-xs text-slate-500">{worker.skill || 'Traffic Control'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center text-sm text-slate-600">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      {worker.email}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.is_active
                        ? (worker.employment_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800')
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {!worker.is_active ? 'BLOCKED' : (worker.employment_status || 'ACTIVE')}
                    </span>
                    {worker.is_active && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (!worker.availability || worker.availability === 'AVAILABLE') ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {worker.availability || 'AVAILABLE'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-slate-600">
                    {new Date(worker.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit && onEdit(worker)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Worker"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onBlock && onBlock(worker)}
                      className={`p-2 rounded-lg transition-colors ${worker.is_active ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                      title={worker.is_active ? "Block Worker" : "Unblock Worker"}
                    >
                      {worker.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => onDelete && onDelete(worker)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Permanently Delete Worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrafficWorkerTable;
