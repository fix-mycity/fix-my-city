import React, { useState, useEffect } from 'react';
import { getFeedPostsApi, createPostApi, deletePostApi } from '../../api/feedApi';
import { toast } from 'react-hot-toast';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  Loader2, 
  ArrowUpDown, 
  Plus, 
  Trash2, 
  X, 
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function GeneralPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All' | 'General' | 'Announcement'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    category: 'Announcement',
    location: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch both General and Announcement posts
      const [generalRes, announcementRes] = await Promise.all([
        getFeedPostsApi('General'),
        getFeedPostsApi('Announcement')
      ]);

      const generalList = generalRes.data || [];
      const announcementList = announcementRes.data || [];

      // Combine and deduplicate
      const combined = [...generalList, ...announcementList];
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setPosts(unique);
    } catch (err) {
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size cannot exceed 10MB.');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostData.title.trim() || !newPostData.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    const creationToast = toast.loading('Publishing announcement...');
    
    const submissionData = new FormData();
    submissionData.append('title', newPostData.title.trim());
    submissionData.append('content', newPostData.content.trim());
    submissionData.append('category', newPostData.category);
    if (newPostData.location.trim()) {
      submissionData.append('location', newPostData.location.trim());
    }
    if (selectedFile) {
      submissionData.append('file', selectedFile);
    }

    try {
      await createPostApi(submissionData);
      toast.success('Announcement published successfully!', { id: creationToast });
      
      // Reset form and close modal
      setNewPostData({
        title: '',
        content: '',
        category: 'Announcement',
        location: ''
      });
      setSelectedFile(null);
      setImagePreview('');
      setIsModalOpen(false);
      
      // Refresh list
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to publish announcement.', { id: creationToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this announcement?')) {
      return;
    }

    const deleteToast = toast.loading('Deleting announcement...');
    try {
      await deletePostApi(postId);
      toast.success('Announcement deleted successfully.', { id: deleteToast });
      fetchPosts();
    } catch (err) {
      toast.error('Failed to delete announcement.', { id: deleteToast });
    }
  };

  // Filters & Search
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (post.title || '').toLowerCase().includes(query) ||
                          (post.content || '').toLowerCase().includes(query) ||
                          (post.location || '').toLowerCase().includes(query);
    
    const matchesCategory = categoryFilter === 'All' || post.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort
  const sortedPosts = [...filteredPosts].sort((a, b) => {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-8 h-8 text-indigo-600" />
            Municipal Announcements
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Publish official notices, alerts, and bulletins directly to the citizen social feed.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl transition-all shadow-md shadow-indigo-650/30 shrink-0 select-none hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Create Announcement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Published</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{posts.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Update</p>
            <h3 className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
              {posts[0] ? posts[0].title : 'No posts published yet'}
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
            placeholder="Search posts by title, content, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50 transition-all font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'All' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('Announcement')}
              className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'Announcement' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Announcement
            </button>
            <button
              onClick={() => setCategoryFilter('General')}
              className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'General' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              General
            </button>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mr-2" />
          <span className="text-slate-500 text-sm font-semibold">Loading announcements...</span>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
            <Megaphone className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No announcements found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto font-semibold">
            {posts.length === 0
              ? 'Get started by creating your very first municipal announcement!'
              : 'Try matching other filter options or searching keywords.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedPosts.map((post) => {
            const isAnnouncement = post.category === 'Announcement';
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className={`h-1.5 w-full absolute top-0 left-0 ${isAnnouncement ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className={`border rounded-full px-2.5 py-0.5 inline-flex items-center gap-1 font-extrabold ${isAnnouncement ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {post.category}
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {post.image_url && (
                    <div className="rounded-xl overflow-hidden max-h-60 border border-slate-100">
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {post.location && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.location}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                      {post.author_name || 'City Administration'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all px-2.5 py-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">Create Announcement</h3>
              </div>
              <button 
                onClick={() => {
                  if (!isSubmitting) {
                    setIsModalOpen(false);
                    handleRemoveImage();
                  }
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreatePost} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide">Category</label>
                <select
                  name="category"
                  value={newPostData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-semibold text-slate-800"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="General">General Notice</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Major road repair scheduled on Main Street"
                  value={newPostData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide">Content / Notice details *</label>
                <textarea
                  name="content"
                  required
                  rows="4"
                  placeholder="Write the full announcement text here..."
                  value={newPostData.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Sector 12, Municipal Park Area"
                  value={newPostData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <span className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Attach Photo (Optional)
                </span>
                
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-250 max-h-52 bg-slate-100 flex items-center justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-52 w-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900/80 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-50/20 group">
                    <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors mb-2" />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                      Click to choose or drag an image here
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                      PNG, JPG, JPEG up to 10MB
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsModalOpen(false);
                    handleRemoveImage();
                  }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-bold rounded-xl text-xs transition-colors select-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-650/20 select-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>Publish Notice</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
