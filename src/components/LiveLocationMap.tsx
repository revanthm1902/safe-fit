
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Crosshair, Satellite } from 'lucide-react';

interface LiveLocationMapProps {
  userLocation: { lat: number; lng: number } | null;
}

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({ userLocation }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map');
  const watchIdRef = useRef<number | null>(null);

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      setIsTracking(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          console.log('Location updated:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error watching location:', error);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Google Maps integration
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    if (!userLocation) return;
    if (window.google && window.google.maps && mapRef.current) {
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 16,
          mapTypeId: mapView === 'satellite' ? 'satellite' : 'roadmap',
          disableDefaultUI: true,
        });
        markerRef.current = new window.google.maps.Marker({
          position: userLocation,
          map: googleMapRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        googleMapRef.current.setCenter(userLocation);
        googleMapRef.current.setMapTypeId(mapView === 'satellite' ? 'satellite' : 'roadmap');
        markerRef.current.setPosition(userLocation);
      }
    }
  }, [userLocation, mapView]);

  // Dynamically load Google Maps script if not present
  useEffect(() => {
    if (window.google && window.google.maps) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      // force rerender
      if (userLocation && mapRef.current) {
        googleMapRef.current = null;
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={isTracking ? stopLocationTracking : startLocationTracking}
            className={`${
              isTracking 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-safefit-highlight hover:bg-safefit-highlight/90'
            } text-white text-sm`}
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
          <Button
            onClick={() => setMapView(mapView === 'map' ? 'satellite' : 'map')}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            <Satellite className="h-4 w-4 mr-2" />
            {mapView === 'map' ? 'Satellite' : 'Map'}
          </Button>
        </div>
        {userLocation && (
          <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <span className="flex items-center flex-wrap">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="break-all">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Map Display (Google Maps) */}
      <Card className="relative overflow-hidden">
        <div className="h-48 sm:h-64 w-full relative">
          {userLocation ? (
            <div ref={mapRef} className="absolute inset-0 w-full h-full rounded-lg" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm sm:text-base">Enable location access to view map</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs sm:text-sm"
              >
                Refresh Location
              </Button>
            </div>
          )}
          {/* Overlay: Info and Tracking Status */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-md max-w-[calc(100%-1rem)] sm:max-w-none">
            <div className="flex items-center space-x-2">
              <Crosshair className="h-3 w-3 sm:h-4 sm:w-4 text-safefit-highlight flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-safefit-dark">
                {isTracking ? 'Live Tracking Active' : 'Location Services'}
              </span>
            </div>
            {userLocation ? (
              <div className="text-xs text-gray-600 mt-1 break-all">
                Coordinates: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </div>
            ) : (
              <div className="text-xs text-gray-600 mt-1">
                Enable location to track position
              </div>
            )}
          </div>
          {isTracking && (
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
              <span className="hidden sm:inline">Broadcasting Location</span>
              <span className="sm:hidden">Live</span>
            </div>
          )}
        </div>
        {/* Open in Google Maps Button */}
        {userLocation && (
          <div className="absolute bottom-2 left-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white/80 hover:bg-white"
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              Open in Google Maps
            </Button>
          </div>
        )}
      </Card>

      {/* Location Sharing Status */}
      <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-blue-900 text-sm">Location Sharing</h4>
            <p className="text-xs text-blue-700 mt-1">
              {isTracking 
                ? 'Your location is being shared with emergency contacts in real-time.'
                : 'Start tracking to share your location with emergency contacts.'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LiveLocationMap;
