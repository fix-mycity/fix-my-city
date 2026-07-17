import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import {
  getUserProfileApi,
  updateUserProfileApi,
  uploadAvatarApi,
  getSavedLocationsApi,
  addSavedLocationApi,
  deleteSavedLocationApi
} from '../api/userProfileApi';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [profile, setProfile] = useState({
    full_name: '',
    phone_number: '',
    bio: '',
    avatar_url: ''
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form State for New Location
  const [newLoc, setNewLoc] = useState({
    label: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [submittingLoc, setSubmittingLoc] = useState(false);

  // Location Picker States for Profile
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocationText, setSelectedLocationText] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Load profile and locations
  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, locationsRes] = await Promise.all([
          getUserProfileApi(),
          getSavedLocationsApi()
        ]);
        setProfile({
          full_name: profileRes.data.full_name || '',
          phone_number: profileRes.data.phone_number || '',
          bio: profileRes.data.bio || '',
          avatar_url: profileRes.data.avatar_url || ''
        });
        setLocations(locationsRes.data);
      } catch (err) {
        console.error("Error loading profile data:", err);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const data = {
        full_name: profile.full_name || null,
        phone_number: profile.phone_number || null,
        bio: profile.bio || null
      };

      // Basic local validation for phone number
      if (data.phone_number && !/^\d{10}$/.test(data.phone_number)) {
        toast.error("Phone number must be exactly 10 digits.");
        setUpdatingProfile(false);
        return;
      }

      const res = await updateUserProfileApi(data);
      setProfile({
        full_name: res.data.full_name || '',
        phone_number: res.data.phone_number || '',
        bio: res.data.bio || '',
        avatar_url: res.data.avatar_url || ''
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the limit of 10MB.");
      e.target.value = ""; // Clear file input
      return;
    }

    setUploadingAvatar(true);
    const uploadToast = toast.loading("Uploading avatar to S3...");
    try {
      const res = await uploadAvatarApi(file);
      setProfile((prev) => ({ ...prev, avatar_url: res.data.avatar_url }));
      toast.success("Avatar uploaded successfully!", { id: uploadToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar.", { id: uploadToast });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!newLoc.label || !newLoc.address) {
      toast.error("Label and address are required.");
      return;
    }

    setSubmittingLoc(true);
    try {
      const payload = {
        label: newLoc.label,
        address: newLoc.address,
        latitude: newLoc.latitude ? parseFloat(newLoc.latitude) : null,
        longitude: newLoc.longitude ? parseFloat(newLoc.longitude) : null
      };

      if ((payload.latitude !== null) !== (payload.longitude !== null)) {
        toast.error("Both coordinates must be provided, or both must be left blank.");
        setSubmittingLoc(false);
        return;
      }

      const res = await addSavedLocationApi(payload);
      setLocations((prev) => [...prev, res.data]);
      setNewLoc({ label: '', address: '', latitude: '', longitude: '' });
      setSelectedLocationText('');
      setLocationSearchQuery('');
      setLocationResults([]);
      toast.success("Location added successfully!");
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : "Failed to add location.");
    } finally {
      setSubmittingLoc(false);
    }
  };

  const handleClearLocation = () => {
    setNewLoc(prev => ({ ...prev, address: '', latitude: '', longitude: '' }));
    setSelectedLocationText('');
    setLocationSearchQuery('');
    setLocationResults([]);
  };

  const handleSearchLocation = async (query) => {
    if (!query || query.trim().length < 3) {
      toast.error("Please enter at least 3 characters to search.");
      return;
    }
    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'FixMyCity-App/1.0'
          }
        }
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setLocationResults(data);
      if (data.length === 0) {
        toast.error("No locations found. Try a different query.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to search location.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setNewLoc(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'FixMyCity-App/1.0'
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.display_name || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            setSelectedLocationText(addr);
            setLocationSearchQuery(addr);
            setNewLoc(prev => ({ ...prev, address: addr }));
          } else {
            const addr = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            setSelectedLocationText(addr);
            setNewLoc(prev => ({ ...prev, address: addr }));
          }
        } catch (err) {
          console.error(err);
          const addr = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setSelectedLocationText(addr);
          setNewLoc(prev => ({ ...prev, address: addr }));
        } finally {
          setDetectingLocation(false);
          toast.success("Location detected successfully!");
        }
      },
      (error) => {
        console.error(error);
        toast.error("Failed to get current location. Please check browser permissions.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectLocation = (result) => {
    const lat = result.lat;
    const lon = result.lon;
    const addr = result.display_name;
    setNewLoc(prev => ({
      ...prev,
      address: addr,
      latitude: lat,
      longitude: lon
    }));
    setSelectedLocationText(addr);
    setLocationSearchQuery(addr);
    setLocationResults([]);
  };

  const handleDeleteLocation = async (id) => {
    try {
      await deleteSavedLocationApi(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      toast.success("Location deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete location.");
    }
  };

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAjXV44J7hHagG25vu-i0QNfHuE6FUQYoz9M1qZy8QPGMTNifXENQJw-o5BCCpb1iU8jbphl-_vCcEpwdZoNqtmYsynhYuKhEn45buuwq0qUJVLsK5WsnvpKGFa28EiLLLGiH8QWrull36_OiRSwJHgY0v-lQxpJ2YA5KHMjKrwH9NGHLruawNgFjzBClUyp1BQfaAWhjtb8St-cd8O4RbMgeUlJqf0nQOkQ0rDMiScYOzUBLWc3FkV90i4E-aksBuTi63NTrGkKA";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
          <p className="text-slate-600 font-semibold">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* Top Navigation Navbar */}
      <Navbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 pb-24 sm:p-8 max-w-[1200px] mx-auto w-full overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 font-medium">Manage your personal details, avatar image, and saved locations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Avatar & Info Summary */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
              <div className="relative group w-32 h-32 mb-4 rounded-full border-4 border-slate-100 shadow-inner overflow-hidden bg-slate-100 flex items-center justify-center">
                <img 
                  alt="Avatar" 
                  className={`w-full h-full object-cover ${uploadingAvatar ? 'opacity-40' : ''}`}
                  src={profile.avatar_url || defaultAvatar}
                />
                
                {/* Overlay for Changing Avatar */}
                <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="material-symbols-outlined text-2xl">photo_camera</span>
                  <span className="text-xs font-semibold mt-1">Upload Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                    disabled={uploadingAvatar}
                  />
                </label>

                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-blue-600 text-3xl">sync</span>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-slate-900">{profile.full_name || user?.username}</h2>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-1">{user?.role || 'Citizen'}</p>
              
              {profile.bio ? (
                <p className="text-sm text-slate-600 mt-4 leading-relaxed italic">"{profile.bio}"</p>
              ) : (
                <p className="text-sm text-slate-400 mt-4 leading-relaxed italic">No bio written yet.</p>
              )}
            </div>
          </div>

          {/* Right Panel: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Edit details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">manage_accounts</span>
                Personal Information
              </h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="e.g. John Doe"
                      value={profile.full_name}
                      onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="10-digit number"
                      maxLength={10}
                      value={profile.phone_number}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone_number: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24 resize-none"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={updatingProfile}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    {updatingProfile && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                    Save Profile
                  </button>
                </div>
              </form>
            </div>

            {/* Saved Locations Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">location_on</span>
                Saved Locations
              </h3>

              {/* Locations List */}
              {locations.length > 0 ? (
                <div className="divide-y divide-slate-100 mb-6">
                  {locations.map((loc) => (
                    <div key={loc.id} className="py-4 flex justify-between items-center group">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">bookmark</span>
                          {loc.label}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 truncate">{loc.address}</p>
                        {loc.latitude !== null && (
                          <p className="text-xs text-slate-400 mt-0.5">Coords: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Delete Location"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-150 rounded-xl bg-slate-50 mb-6">
                  <span className="material-symbols-outlined text-slate-300 text-4xl">map</span>
                  <p className="text-slate-400 text-sm font-semibold mt-2">No saved locations yet.</p>
                </div>
              )}

              {/* Add Location Form */}
              <form onSubmit={handleLocationSubmit} className="space-y-4 border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Add New Location</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Label</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="e.g. Home, Work"
                      required
                      value={newLoc.label}
                      onChange={(e) => setNewLoc((prev) => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                    
                    {/* Search Bar + Use Current button */}
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <span className="material-symbols-outlined text-sm">search</span>
                        </span>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="Search address or city..."
                          value={locationSearchQuery}
                          onChange={(e) => {
                            setLocationSearchQuery(e.target.value);
                            if (!e.target.value) {
                              setLocationResults([]);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchLocation(locationSearchQuery);
                            }
                          }}
                        />
                        {locationSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setLocationSearchQuery('');
                              setLocationResults([]);
                            }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleSearchLocation(locationSearchQuery)}
                        disabled={isSearchingLocation}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                      >
                        {isSearchingLocation ? (
                          <span className="material-symbols-outlined animate-spin text-xs">sync</span>
                        ) : (
                          'Search'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        title="Use my current location"
                      >
                        <span className="material-symbols-outlined text-xs">{detectingLocation ? 'sync' : 'my_location'}</span>
                        {detectingLocation ? 'Locating...' : 'Current'}
                      </button>
                    </div>

                    {/* Location Search Results dropdown */}
                    {locationResults.length > 0 && (
                      <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 absolute left-0 right-0">
                        {locationResults.map((result) => (
                          <button
                            key={result.place_id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 border-b border-slate-100 last:border-0 block transition-colors"
                            onClick={() => handleSelectLocation(result)}
                          >
                            <div className="flex gap-2 items-start">
                              <span className="material-symbols-outlined text-slate-400 text-xs mt-0.5">location_on</span>
                              <div>
                                <p className="text-slate-800 leading-tight">{result.display_name}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">Lat: {parseFloat(result.lat).toFixed(4)}, Lng: {parseFloat(result.lon).toFixed(4)}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Location Badge */}
                {selectedLocationText && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-center justify-between transition-all">
                    <div className="flex gap-2 items-start flex-grow pr-4">
                      <span className="material-symbols-outlined text-blue-600 text-base mt-0.5">verified_user</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">{selectedLocationText}</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          Coordinates: {parseFloat(newLoc.latitude).toFixed(6)}, {parseFloat(newLoc.longitude).toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearLocation}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100 flex-shrink-0"
                      title="Clear location"
                    >
                      <span className="material-symbols-outlined text-xs font-bold">close</span>
                    </button>
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={submittingLoc}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    {submittingLoc && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                    Add Location
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
