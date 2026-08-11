import React, { useState, useEffect } from 'react';
import { getAllSuggestionsApi } from '../../api/suggestionsApi';
import { toast } from 'react-hot-toast';
import { Search, Lightbulb, User, Calendar, Loader2, ArrowUpDown } from 'lucide-react';

export default function WasteSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await getAllSuggestionsApi();
      // Filter suggestions submitted for Waste department (category matching 'waste')
      const filtered = (res.data || []).filter(
        (s) => (s.category || '').toLowerCase() === 'waste'
      );
      setSuggestions(filtered);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch sanitation suggestions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Filter & Search suggestions
  const searchedSuggestions = suggestions.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      (s.title || '').toLowerCase().includes(query) ||
      (s.description || '').toLowerCase().includes(query)
    );
  });

  // Sort suggestions
  const sortedSuggestions = [...searchedSuggestions].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-emerald-600" />
            Citizen Suggestions
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review feedback, ideas, and improvement suggestions submitted by citizens for sanitation services.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Received</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{suggestions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Idea</p>
            <h3 className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
              {suggestions[0] ? suggestions[0].title : 'No submissions yet'}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-1/3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suggestions by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mr-2" />
          <span className="text-slate-500 text-sm font-semibold">Loading submissions...</span>
        </div>
      ) : sortedSuggestions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
            <Lightbulb className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No suggestions match criteria</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto font-semibold">
            {suggestions.length === 0
              ? 'No citizen suggestions have been submitted to Waste Management yet.'
              : 'Try modifying your search text to match other keywords.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div className="h-1.5 w-full bg-emerald-500 absolute top-0 left-0" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1 font-extrabold">
                    Idea ID #{suggestion.id}
                  </span>
                  <span>{formatDate(suggestion.created_at)}</span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {suggestion.title}
                </h3>

                <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                  {suggestion.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3.5 mt-5 flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wide">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted by Citizen (ID: {suggestion.citizen_id})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
