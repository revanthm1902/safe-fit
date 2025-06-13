
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

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            onClick={isTracking ? stopLocationTracking : startLocationTracking}
            className={`${
              isTracking 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-safefit-highlight hover:bg-safefit-highlight/90'
            } text-white`}
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
          <Button
            onClick={() => setMapView(mapView === 'map' ? 'satellite' : 'map')}
            variant="outline"
            size="sm"
          >
            <Satellite className="h-4 w-4 mr-2" />
            {mapView === 'map' ? 'Satellite' : 'Map'}
          </Button>
        </div>
        {userLocation && (
          <div className="text-sm text-gray-600">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Map Display */}
      <Card className="relative overflow-hidden">
        <div 
          className={`h-64 flex items-center justify-center relative ${
            mapView === 'satellite' 
              ? 'bg-gradient-to-br from-green-800 via-green-600 to-blue-600' 
              : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300'
          }`}
        >
          {/* Map Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`border ${
                    mapView === 'satellite' 
                      ? 'border-white/20' 
                      : 'border-gray-400/30'
                  }`} 
                />
              ))}
            </div>
          </div>

          {/* Current Location Marker */}
          {userLocation && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className={`w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                  isTracking ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                }`} />
                <div className={`absolute inset-0 rounded-full border-2 ${
                  isTracking ? 'border-red-300 animate-ping' : 'border-blue-300'
                }`} />
              </div>
            </div>
          )}

          {/* Location Info Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
            <div className="flex items-center space-x-2">
              <Crosshair className="h-4 w-4 text-safefit-highlight" />
              <span className="text-sm font-medium text-safefit-dark">
                {isTracking ? 'Live Tracking Active' : 'Location Services'}
              </span>
            </div>
            {userLocation ? (
              <div className="text-xs text-gray-600 mt-1">
                Coordinates: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </div>
            ) : (
              <div className="text-xs text-gray-600 mt-1">
                Enable location to track position
              </div>
            )}
          </div>

          {/* Tracking Status */}
          {isTracking && (
            <div className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
              Broadcasting Location
            </div>
          )}

          {/* No Location Message */}
          {!userLocation && (
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Enable location access to view map</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Refresh Location
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Location Sharing Status */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div>
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
