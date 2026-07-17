import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { Map as MapIcon, Search, Loader2 } from 'lucide-react';
import TrafficLayout from '../../layout/TrafficLayout';
import axios from 'axios';

const TrafficMap = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    
    if (!apiKey) {
      toast.error("TomTom API Key is missing in .env!");
      return;
    }

    // Required for TomTom SDK v6 in Vite/modern bundlers
    tt.setProductInfo('FixMyCity', '1.0.0');

    // Initialize TomTom Map (v6 style)
    let mapInstance = tt.map({
      key: apiKey,
      container: mapElement.current,
      center: [76.2144, 10.5276], // Default Center
      zoom: 12,
      stylesVisibility: {
        trafficFlow: true,
        trafficIncidents: true
      }
    });

    mapInstance.addControl(new tt.FullscreenControl());
    mapInstance.addControl(new tt.NavigationControl());

    setMap(mapInstance);

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!map || !searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
      const res = await axios.get(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(searchQuery)}.json`, {
        params: { key: apiKey, countrySet: 'IN', limit: 1 }
      });
      
      if (res.data.results && res.data.results.length > 0) {
        const { position, address } = res.data.results[0];
        map.flyTo({
          center: [position.lon, position.lat],
          zoom: 14,
          speed: 1.5
        });
        toast.success(`Found: ${address.freeformAddress || searchQuery}`);
      } else {
        toast.error("Location not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <TrafficLayout>
      <div className="p-8 h-[calc(100vh-2rem)] flex flex-col">
        {/* Welcome Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-blue-600" />
              Real-Time Traffic Map
            </h1>
            <p className="text-slate-500 font-medium">Monitor traffic flow and incidents</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center w-full sm:w-auto mt-4 sm:mt-0 shadow-sm rounded-lg">
            <div className="relative flex-grow sm:w-80">
              <input
                type="text"
                placeholder="Search by pincode or place..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 text-slate-900 text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-r-lg font-bold text-sm transition-colors flex items-center justify-center min-w-[100px] border border-blue-600"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>

        {/* Map Container Card */}
        <div className="flex-grow relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full min-h-[500px]">
          <div ref={mapElement} className="absolute inset-0 w-full h-full bg-slate-100" />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-md border border-slate-200 z-10">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Traffic Flow Legend</h4>
            <div className="space-y-2 text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm shadow-inner"></div> Fast
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-sm shadow-inner"></div> Slow
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm shadow-inner"></div> Queuing
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-800 rounded-sm shadow-inner"></div> Stationary
              </div>
            </div>
          </div>
        </div>
      </div>
    </TrafficLayout>
  );
};

export default TrafficMap;
