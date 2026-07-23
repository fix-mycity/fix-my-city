import React, { useState, useEffect } from 'react';

const ComplaintLocation = ({ lat, lng }) => {
  const cacheKey = `geo_cache_${Number(lat).toFixed(4)}_${Number(lng).toFixed(4)}`;
  const [address, setAddress] = useState(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached === `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`) {
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
                setAddress(`${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`);
              }
            }
          } else {
            const addrText = data.display_name || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
            if (isMounted) {
              localStorage.setItem(cacheKey, addrText);
              setAddress(addrText);
            }
          }
        } else {
          if (isMounted) {
            setAddress(`${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setAddress(`${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`);
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

export default ComplaintLocation;
