import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  Megaphone, 
  MessageSquare, 
  ThumbsUp, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  ShieldAlert, 
  Plus, 
  X, 
  Upload, 
  Loader2, 
  Filter,
  Check,
  AlertTriangle,
  User,
  Building2,
  FileText
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { 
  getFeedPostsApi, 
  getMyPostsApi, 
  getPendingPostsApi, 
  createPostApi, 
  approvePostApi, 
  rejectPostApi, 
  deletePostApi 
} from '../api/feedApi';

const categories = [
  { id: 'Announcement', label: 'Announcement', icon: Megaphone, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'Traffic', label: 'Traffic', icon: AlertTriangle, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'Water', label: 'Water Authority', icon: CheckCircle2, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'Waste', label: 'Waste Management', icon: Trash2, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'Emergency', label: 'Emergency', icon: ShieldAlert, color: 'bg-red-100 text-red-800 border-red-200 animate-pulse' },
  { id: 'Event', label: 'Event', icon: FileText, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'General', label: 'General', icon: MessageSquare, color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export default function FeedPage() {
  const { user } = useSelector((state) => state.auth);
  const isModerator = user?.role === 'Department_Admin' || user?.role === 'Super_Admin';

  // Navigation state: "active" | "my-posts" | "moderation"
  const [activeView, setActiveView] = useState('active');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedTypeFilter, setFeedTypeFilter] = useState('All');

  // Modal forms
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    location: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Rejection modal
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [postToReject, setPostToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Load Feed Data
  const loadPosts = async () => {
    setLoading(true);
    try {
      let res;
      if (activeView === 'active') {
        res = await getFeedPostsApi(selectedCategory, feedTypeFilter);
      } else if (activeView === 'my-posts') {
        res = await getMyPostsApi();
      } else if (activeView === 'moderation') {
        res = await getPendingPostsApi();
      }
      setPosts(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load feed posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeView, selectedCategory, feedTypeFilter]);

  // Format date helper
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    const submissionData = new FormData();
    submissionData.append('title', formData.title.trim());
    submissionData.append('content', formData.content.trim());
    submissionData.append('category', formData.category);
    if (formData.location.trim()) {
      submissionData.append('location', formData.location.trim());
    }
    if (selectedFile) {
      submissionData.append('file', selectedFile);
    }

    try {
      await createPostApi(submissionData);
      
      if (isModerator) {
        toast.success('Official bulletin published successfully!');
      } else {
        toast.success('Post submitted successfully! Pending moderator approval.');
      }
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'General',
        location: '',
      });
      setSelectedFile(null);
      setImagePreview('');
      setIsCreateOpen(false);
      
      // Reload posts
      loadPosts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to submit post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Moderation Handlers
  const handleApprove = async (postId) => {
    try {
      await approvePostApi(postId);
      toast.success('Post approved successfully!');
      loadPosts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve post.');
    }
  };

  const openRejectModal = (post) => {
    setPostToReject(post);
    setRejectionReason('');
    setIsRejectOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setIsRejecting(true);
    try {
      await rejectPostApi(postToReject.id, rejectionReason.trim());
      toast.success('Post rejected.');
      setIsRejectOpen(false);
      setPostToReject(null);
      loadPosts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject post.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePostApi(postId);
      toast.success('Post deleted.');
      loadPosts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete post.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/30">
        <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              City Bulletin & Feed
            </h1>
            <p className="text-slate-300 mt-2 text-sm md:text-base max-w-xl font-body-md font-medium">
              View verified official announcements from city departments, or share community-driven events and initiatives with your neighborhood.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              CREATE POST
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveView('active')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all duration-200 ${
              activeView === 'active'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Active Feed
          </button>
          <button
            onClick={() => setActiveView('my-posts')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all duration-200 ${
              activeView === 'my-posts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            My Submissions
          </button>
          {isModerator && (
            <button
              onClick={() => setActiveView('moderation')}
              className={`py-4 px-6 font-bold text-sm border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeView === 'moderation'
                  ? 'border-red-500 text-red-650 text-red-650 text-red-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-red-550'
              }`}
            >
              Approval Queue
              <span className="bg-red-100 text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                Moderation
              </span>
            </button>
          )}
        </div>

        {/* Filters Panel - Only for active public feed */}
        {activeView === 'active' && (
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category selection */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-200 ${
                  selectedCategory === 'All'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-55'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Post Origin Selection: Official vs Citizen */}
            <div className="bg-slate-200/60 p-1 rounded-xl flex items-center shrink-0 w-fit self-start md:self-center border border-slate-300/30">
              {['All', 'Official', 'Community'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFeedTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    feedTypeFilter === type
                      ? 'bg-white text-indigo-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'All' ? 'All Sources' : type === 'Official' ? 'Official Only' : 'Community Feed'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm mt-3 font-semibold">Loading feed posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
              <Megaphone className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No posts in this category</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              {activeView === 'moderation' 
                ? 'Great job! The pending post review queue is empty.' 
                : activeView === 'my-posts' 
                ? "You haven't submitted any community posts yet." 
                : 'No announcements or community posts have been published under this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {posts.map((post) => {
              const isOfficial = post.author_type === 'authority';
              const postCategory = categories.find((c) => c.id === post.category) || categories[categories.length - 1];
              const CategoryIcon = postCategory.icon;

              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col relative overflow-hidden h-full ${
                    isOfficial
                      ? 'border-indigo-200/80 bg-indigo-50/15'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Category Accent top border */}
                  <div className={`h-1.5 w-full ${
                    isOfficial 
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500' 
                      : 'bg-slate-200'
                  }`} />

                  <div className="p-6 flex flex-col justify-between flex-grow">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                          isOfficial
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-655 text-slate-600 border border-slate-200'
                        }`}>
                          {isOfficial ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-slate-900 leading-none">
                              {post.author_name}
                            </h4>
                            {isOfficial && (
                              <span className="bg-emerald-100 border border-emerald-250 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                Official
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold block mt-1.5 uppercase">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Right top action: category badge and delete button */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${postCategory.color}`}>
                          <CategoryIcon className="w-3 h-3" />
                          {postCategory.label}
                        </span>

                        {/* Delete post */}
                        {(post.author_id === user?.id || isModerator) && (
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-grow mb-5">
                      <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-650 text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>

                      {post.location && (
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-semibold bg-slate-100/60 w-fit px-2.5 py-1.5 rounded-lg border border-slate-200/40">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          {post.location}
                        </div>
                      )}

                      {post.image_url && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200/60 max-h-56 bg-slate-900 flex items-center justify-center">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="object-cover w-full h-full max-h-56 hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>

                    {/* Status Tracking for my submissions */}
                    {activeView === 'my-posts' && (
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          {post.status === 'APPROVED' && (
                            <span className="flex items-center gap-1 text-emerald-600 font-extrabold text-xs">
                              <CheckCircle2 className="w-4 h-4" /> Published
                            </span>
                          )}
                          {post.status === 'PENDING' && (
                            <span className="flex items-center gap-1 text-amber-600 font-extrabold text-xs">
                              <Clock className="w-4 h-4" /> Pending Approval
                            </span>
                          )}
                          {post.status === 'REJECTED' && (
                            <span className="flex items-center gap-1 text-red-650 text-red-600 font-extrabold text-xs">
                              <XCircle className="w-4 h-4" /> Rejected
                            </span>
                          )}
                        </div>

                        {post.status === 'REJECTED' && post.rejection_reason && (
                          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl max-w-[70%] font-medium">
                            <span className="font-extrabold block">Reason:</span>
                            {post.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interaction Buttons (social preview) & Moderation controls */}
                    {activeView !== 'my-posts' && (
                      <div className="border-t border-slate-150 border-slate-200/50 pt-4 mt-auto flex items-center justify-between">
                        {activeView === 'moderation' ? (
                          <div className="flex gap-2 w-full justify-end">
                            <button
                              onClick={() => openRejectModal(post)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-750 hover:bg-red-50 text-xs font-bold px-3.5 py-2 rounded-xl border border-red-200 transition-all duration-200"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                            <button
                              onClick={() => handleApprove(post.id)}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-600 transition-all duration-200 shadow-sm shadow-emerald-500/10"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-6 text-slate-500 font-bold text-xs">
                            <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors group">
                              <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span>21</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors group">
                              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span>4</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => !isSubmitting && setIsCreateOpen(false)}
          />
          
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl relative w-full max-w-xl max-h-[90vh] overflow-y-auto z-10 transition-transform duration-300 animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-600" />
                  {isModerator ? 'New Official Bulletin' : 'Share Community Event / Alert'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  {isModerator 
                    ? 'Publish a direct advisory notice on behalf of your department.' 
                    : 'Submit an event, neighborhood activity, or bulletin for community review.'}
                </p>
              </div>
              <button
                disabled={isSubmitting}
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-2 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Post Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  disabled={isSubmitting}
                  placeholder={isModerator ? "e.g., Scheduled Water Interruption" : "e.g., Neighborhood Cleaning Drive"}
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-250 border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Category</label>
                  <select
                    name="category"
                    disabled={isSubmitting}
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-250 border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                  >
                    {isModerator ? (
                      // Admins can select any categories
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))
                    ) : (
                      // Citizens shouldn't report Official Announcements
                      categories
                        .filter(c => c.id !== 'Announcement')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Location (Optional)</label>
                  <input
                    type="text"
                    name="location"
                    disabled={isSubmitting}
                    placeholder="e.g. Ward 12, Manjeri"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-250 border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Description / Details</label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  disabled={isSubmitting}
                  placeholder={isModerator ? "Write details about the maintenance timeline, affected wards, or emergency notice..." : "Explain your initiative, event details, or neighborhood request..."}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-250 border-slate-200 rounded-xl p-4 text-sm focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium leading-relaxed"
                />
              </div>

              {/* Image Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Attach Image (Optional)</label>
                
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-250 border-slate-200 bg-slate-50 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-250 border-slate-200" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 max-w-[200px] truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-250 border-slate-200 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-indigo-50/5 hover:scale-[1.005] transition-all duration-200">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-bold">JPG, PNG, WEBP (Max 10MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                  </label>
                )}
              </div>

              {/* Form Actions */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection reason modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => !isRejecting && setIsRejectOpen(false)}
          />

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl relative w-full max-w-md p-6 z-10 transition-transform duration-300 animate-scale-up">
            <h3 className="text-base font-extrabold text-slate-950 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              Reject Post
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-4 leading-normal">
              Explain why this community post is being rejected. The author will see this note in their dashboard.
            </p>

            <textarea
              required
              rows={3}
              disabled={isRejecting}
              placeholder="e.g. Inappropriate content, duplicative request, or post belongs in formal complaints."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 border-slate-200 rounded-xl p-4 text-xs focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-medium leading-relaxed mb-5"
            />

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={isRejecting}
                onClick={() => setIsRejectOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleReject}
                className="flex items-center gap-1 bg-red-655 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-red-655 transition-all shadow-md shadow-red-500/10"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
