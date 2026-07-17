
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';


import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import { getMyComplaintsApi, createComplaintApi, uploadComplaintImageApi } from '../api/complaintsApi';
import { getUserProfileApi } from '../api/userProfileApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';

const isVideoUrl = (url) => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.quicktime') || url.includes('/video');
};

const ComplaintLocation = ({ lat, lng }) => {
  const cacheKey = `geo_cache_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const [address, setAddress] = useState(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached === `${lat.toFixed(4)}, ${lng.toFixed(4)}`) {
      localStorage.removeItem(cacheKey);
      return '';
    }
    return cached || '';
  });
  const [loading, setLoading] = useState(!address);

  useEffect(() => {
    if (address) return;

    let isMounted = true;
    const fetchAddress = async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'FixMyCity-App/1.0'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.error) {
            // Fallback for mock coordinates in the ocean
            if (Math.abs(lat - 3) < 0.01 && Math.abs(lng - 2) < 0.01) {
              const mockAddr = "City Center, Metro Area";
              if (isMounted) {
                localStorage.setItem(cacheKey, mockAddr);
                setAddress(mockAddr);
              }
            } else {
              if (isMounted) {
                setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              }
            }
          } else {
            const addrText = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            if (isMounted) {
              localStorage.setItem(cacheKey, addrText);
              setAddress(addrText);
            }
          }
        } else {
          if (isMounted) {
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAddress();

    return () => {
      isMounted = false;
    };
  }, [lat, lng, address, cacheKey]);

  if (loading) {
    return <span className="text-slate-400 animate-pulse">Loading location...</span>;
  }

  return (
    <span className="truncate max-w-[200px] sm:max-w-[320px] inline-block align-bottom" title={address}>
      {address}
    </span>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
  if (user) {
    if (user.role === 'Department_Admin' || user.role === 'Super_Admin') {
      const permissions = user.permissions || [];
      const deptPermissions = permissions.filter((p) => p.startsWith('dept:'));

      if (deptPermissions.length === 1) {
        const perm = deptPermissions[0];

        if (perm === 'dept:water') {
          navigate('/water/dashboard', { replace: true });
        } else if (perm === 'dept:traffic') {
          navigate('/traffic/dashboard', { replace: true });
        } else if (perm === 'dept:waste') {
          navigate('/waste/dashboard', { replace: true });
        }
      } else if (deptPermissions.length >= 2) {
        navigate('/admin/portal', { replace: true });
      }
    }
  }
}, [user, navigate]);

  // Map References
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);

  // States
  const [complaints, setComplaints] = useState([]);
  const [profileAvatar, setProfileAvatar] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_lat: '',
    location_lng: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Camera Capture States & Refs
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraPreviewUrl, setCameraPreviewUrl] = useState('');

  // New Location Picker States
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocationText, setSelectedLocationText] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Load complaints and profile
  const loadDashboardData = async () => {
    try {
      const [profileRes, complaintsRes] = await Promise.all([
        getUserProfileApi().catch(() => ({ data: {} })),
        getMyComplaintsApi()
      ]);
      setProfileAvatar(profileRes.data?.avatar_url || '');
      setComplaints(complaintsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!mapRef.current) {
      let centerLat = 13.0827;
      let centerLng = 80.2707;
      
      const validComplaints = complaints.filter(c => c.location_lat && c.location_lng);
      if (validComplaints.length > 0) {
        const sumLat = validComplaints.reduce((acc, c) => acc + c.location_lat, 0);
        const sumLng = validComplaints.reduce((acc, c) => acc + c.location_lng, 0);
        centerLat = sumLat / validComplaints.length;
        centerLng = sumLng / validComplaints.length;
      }

      const mapInstance = L.map('map').setView([centerLat, centerLng], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
      markersGroupRef.current = L.layerGroup().addTo(mapInstance);
    }

    if (mapRef.current && markersGroupRef.current) {
      markersGroupRef.current.clearLayers();

      const validComplaints = complaints.filter(c => c.location_lat && c.location_lng);
      
      if (validComplaints.length > 0) {
        const bounds = [];

        validComplaints.forEach((c) => {
          const pinColor = {
            traffic: '#f59e0b',
            waste: '#ef4444',
            water: '#3b82f6',
            general: '#64748b'
          }[c.department] || '#ef4444';

          const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="
              background-color: ${pinColor};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 2.5px solid white;
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            ">
              <span class="material-symbols-outlined" style="font-size: 16px; font-weight: bold;">location_on</span>
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
          });

          const marker = L.marker([c.location_lat, c.location_lng], { icon: customIcon });
          
          const popupContent = `
            <div style="font-family: 'Inter', sans-serif; width: 220px; padding: 2px;">
              <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.3;">${c.title}</h4>
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 500; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${c.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 6px;">
                <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${pinColor};">${c.department}</span>
                <span style="font-size: 9px; font-weight: 800; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569; text-transform: uppercase;">${c.status}</span>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.addTo(markersGroupRef.current);
          
          bounds.push([c.location_lat, c.location_lng]);
        });

        if (bounds.length > 0) {
          mapRef.current.fitBounds(bounds, { padding: [40, 40] });
        }
      }
    }

    return () => {
      // We don't remove the map instance on every updates to preserve pan/zoom state,
      // but we will do it if map exists when component is fully unmounted.
    };
  }, [loading, complaints]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
      }
    };
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        toast.error("Please select an image or video file.");
        e.target.value = "";
        setSelectedFile(null);
        return;
      }
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds the limit of 50MB.");
        e.target.value = ""; // Clear file input
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in the title and description.");
      return;
    }
    if (!formData.location_lat || !formData.location_lng) {
      toast.error("Please select a location by searching or using your current location.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload an image or video file.");
      return;
    }

    setModalLoading(true);
    const creationToast = toast.loading("Creating complaint report and uploading file...");
    try {
      const lat = parseFloat(formData.location_lat);
      const lng = parseFloat(formData.location_lng);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        toast.error("Latitude must be a valid number between -90 and 90.", { id: creationToast });
        setModalLoading(false);
        return;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        toast.error("Longitude must be a valid number between -180 and 180.", { id: creationToast });
        setModalLoading(false);
        return;
      }

      // Build FormData to send all fields + file in a single request
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location_lat", lat);
      formDataToSend.append("location_lng", lng);
      formDataToSend.append("file", selectedFile);

      await createComplaintApi(formDataToSend);

      toast.success("Complaint filed successfully!", { id: creationToast });
      setShowModal(false);
      setFormData({ title: '', description: '', location_lat: '', location_lng: '' });
      handleClearPhoto();
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to file complaint report.", { id: creationToast });
    } finally {
      setModalLoading(false);
    }
  };

  const handleClearLocation = () => {
    setFormData(prev => ({ ...prev, location_lat: '', location_lng: '' }));
    setSelectedLocationText('');
    setLocationSearchQuery('');
    setLocationResults([]);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraPreviewUrl('');
    setSelectedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setCameraStream(stream);
    } catch (err) {
      console.error("Camera access failed: ", err);
      toast.error("Could not access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
          
          const previewUrl = URL.createObjectURL(blob);
          setCameraPreviewUrl(previewUrl);
          
          stopCamera();
          toast.success("Photo captured successfully!");
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleClearPhoto = () => {
    if (cameraPreviewUrl) {
      URL.revokeObjectURL(cameraPreviewUrl);
      setCameraPreviewUrl('');
    }
    setSelectedFile(null);
  };

  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  useEffect(() => {
    if (!showModal) {
      handleClearLocation();
      stopCamera();
      if (cameraPreviewUrl) {
        URL.revokeObjectURL(cameraPreviewUrl);
        setCameraPreviewUrl('');
      }
    }
  }, [showModal]);

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
        setFormData(prev => ({
          ...prev,
          location_lat: latitude.toString(),
          location_lng: longitude.toString()
        }));

        // Try to reverse-geocode to get a user-friendly address
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
            setSelectedLocationText(data.display_name || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            setLocationSearchQuery(data.display_name || "");
          } else {
            setSelectedLocationText(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch (err) {
          console.error(err);
          setSelectedLocationText(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
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
    setFormData(prev => ({
      ...prev,
      location_lat: lat,
      location_lng: lon
    }));
    setSelectedLocationText(result.display_name);
    setLocationSearchQuery(result.display_name);
    setLocationResults([]);
  };

  // Dynamic statistics calculations
  const totalReports = complaints.length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const pending = complaints.filter(c => c.status === 'PENDING').length;

  const stats = [
    { label: 'Total Reports', value: totalReports.toString(), icon: 'assignment', color: 'text-slate-400' },
    { label: 'Resolved', value: resolved.toString(), icon: 'check_circle', color: 'text-emerald-500' },
    { label: 'In Progress', value: inProgress.toString(), icon: 'pending', color: 'text-amber-500' },
    { label: 'Pending', value: pending.toString(), icon: 'error', color: 'text-red-500' }
  ];

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAjXV44J7hHagG25vu-i0QNfHuE6FUQYoz9M1qZy8QPGMTNifXENQJw-o5BCCpb1iU8jbphl-_vCcEpwdZoNqtmYsynhYuKhEn45buuwq0qUJVLsK5WsnvpKGFa28EiLLLGiH8QWrull36_OiRSwJHgY0v-lQxpJ2YA5KHMjKrwH9NGHLruawNgFjzBClUyp1BQfaAWhjtb8St-cd8O4RbMgeUlJqf0nQOkQ0rDMiScYOzUBLWc3FkV90i4E-aksBuTi63NTrGkKA";
  const defaultIssuePlaceholder = "https://images.unsplash.com/photo-1599740831664-927e1f1484f2?q=80&w=300&auto=format&fit=crop";

  const getStatusStyle = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500 shadow-emerald-500/40';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return 'bg-amber-500 shadow-amber-500/40';
      default:
        return 'bg-red-500 shadow-red-500/40';
    }
  };

  const getDeptIcon = (dept) => {
    switch (dept) {
      case 'traffic': return 'warning';
      case 'waste': return 'delete_sweep';
      case 'water': return 'water_drop';
      default: return 'help';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
          <p className="text-slate-600 font-semibold">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      
      {/* Top Navigation Navbar */}
      <Navbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 pb-24 sm:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back, {user?.username || 'Citizen'}</h1>
            <p className="text-sm sm:text-slate-500 font-medium">You have filed {totalReports} issue reports to improve our city.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/20 shrink-0"
          >
            <span className="material-symbols-outlined text-base">add</span> Report New Issue
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col justify-between h-[110px] sm:h-[140px] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate max-w-[85%]">{stat.label}</span>
                <span className={`material-symbols-outlined ${stat.color} text-lg sm:text-2xl`}>{stat.icon}</span>
              </div>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 leading-none">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: My Reports */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">My Reports</h2>
                <Link to="/reports" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">
                  View All Reports
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </Link>
              </div>
              
              <div className="divide-y divide-slate-100">
                {complaints.length > 0 ? (
                  complaints.map((report) => (
                    <div key={report.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex gap-4 sm:gap-5 items-start">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                        {report.image_url ? (
                          isVideoUrl(report.image_url) ? (
                            <video 
                              src={report.image_url} 
                              muted 
                              playsInline 
                              autoPlay 
                              loop 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img 
                              src={report.image_url} 
                              alt={report.title} 
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-2xl sm:text-3xl">image</span>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col justify-between min-h-[80px] sm:min-h-[112px]">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 sm:gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="material-symbols-outlined text-blue-600 text-sm">{getDeptIcon(report.department)}</span>
                              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{report.department}</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 leading-tight">{report.title}</h3>
                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-snug">{report.description}</p>
                          </div>
                          <span className={`${getStatusStyle(report.status)} text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm whitespace-nowrap self-start sm:self-auto`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs font-medium text-slate-500 mt-auto">
                          <span className="flex items-center gap-1 min-w-0">
                            <span className="material-symbols-outlined text-[14px] sm:text-[16px] shrink-0">location_on</span> 
                            <ComplaintLocation lat={report.location_lat} lng={report.location_lng} />
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">calendar_today</span> {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white">
                    <span className="material-symbols-outlined text-slate-200 text-5xl">assignment_late</span>
                    <p className="text-slate-400 font-semibold mt-4">You have not reported any issues yet.</p>
                    <button 
                      onClick={() => setShowModal(true)} 
                      className="mt-2 text-blue-600 hover:text-blue-500 font-bold text-sm"
                    >
                      Report your first issue now &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Map Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[350px]">
              <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Nearby Issues</h2>
              </div>
              <div id="map" className="flex-grow h-full w-full z-10" style={{ minHeight: '250px' }}></div>
            </div>

          </div>
        </div>
      </main>

      {/* Report New Issue Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">report</span>
                Report City Issue
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Title</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. Water Logging or Streetlight Out"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24 resize-none"
                  placeholder="Provide details about the issue so department workers can fix it..."
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                
                {/* Search Bar + Use Current button */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-grow">
                    <div className="relative flex-grow">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-sm">search</span>
                      </span>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Search street, area or city..."
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
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                    >
                      {isSearchingLocation ? (
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg text-sm font-bold transition-all disabled:opacity-50 w-full sm:w-auto"
                    title="Use my current location"
                  >
                    <span className="material-symbols-outlined text-sm">{detectingLocation ? 'sync' : 'my_location'}</span>
                    {detectingLocation ? 'Locating...' : 'Use Current Location'}
                  </button>
                </div>

                {/* Location Search Results dropdown */}
                {locationResults.length > 0 && (
                  <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 absolute left-0 right-0">
                    {locationResults.map((result) => (
                      <button
                        key={result.place_id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs font-semibold text-slate-700 border-b border-slate-100 last:border-0 block transition-colors"
                        onClick={() => handleSelectLocation(result)}
                      >
                        <div className="flex gap-2 items-start">
                          <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">location_on</span>
                          <div>
                            <p className="text-slate-800 leading-tight">{result.display_name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Lat: {parseFloat(result.lat).toFixed(4)}, Lng: {parseFloat(result.lon).toFixed(4)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Location Badge */}
                {selectedLocationText && (
                  <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-center justify-between transition-all">
                    <div className="flex gap-2.5 items-start flex-grow pr-4">
                      <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">verified_user</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">{selectedLocationText}</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          Coordinates: {parseFloat(formData.location_lat).toFixed(6)}, {parseFloat(formData.location_lng).toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearLocation}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100 flex-shrink-0"
                      title="Clear location"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">close</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Attachment (Required)</label>
                
                {!isCameraActive && !cameraPreviewUrl && (
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex-grow w-full">
                      <input 
                        type="file" 
                        accept="image/*,video/*"
                        required={!selectedFile}
                        onChange={handleFileChange}
                        className="w-full text-slate-500 text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all hover:shadow-md shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      Take Photo
                    </button>
                  </div>
                )}

                {/* Live Camera Stream Feed */}
                {isCameraActive && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-black flex flex-col items-center">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full aspect-video object-cover bg-slate-955"
                    />
                    
                    {/* Shutter Overlay Controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10 px-4">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex items-center gap-1 px-4 py-2 bg-white/95 hover:bg-white text-slate-800 rounded-lg text-xs font-bold transition-all shadow-md"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                        Cancel
                      </button>
                      
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-black transition-all shadow-lg hover:shadow-blue-500/30 scale-105"
                      >
                        <span className="material-symbols-outlined text-sm">camera_alt</span>
                        Capture
                      </button>
                    </div>
                  </div>
                )}

                {/* Captured Photo Preview Badge */}
                {cameraPreviewUrl && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-center justify-between transition-all">
                    <div className="flex gap-3 items-center flex-grow pr-4">
                      <img 
                        src={cameraPreviewUrl} 
                        alt="Camera capture preview" 
                        className="w-12 h-12 object-cover rounded-lg border border-blue-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">Camera Capture Photo</p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">JPEG Image (Required)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-slate-100 flex-shrink-0"
                      title="Remove Photo"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">close</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-5 py-2.5 rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {modalLoading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;