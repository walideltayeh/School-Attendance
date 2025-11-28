import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BusMapProps {
  routeId: string;
}

const BusMap: React.FC<BusMapProps> = ({ routeId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const busMarker = useRef<mapboxgl.Marker | null>(null);
  const [busLocation, setBusLocation] = useState<[number, number] | null>(null);
  const [stops, setStops] = useState<any[]>([]);

  useEffect(() => {
    loadBusStops();
  }, [routeId]);

  const loadBusStops = async () => {
    try {
      const { data: stopsData, error } = await supabase
        .from('bus_stops')
        .select('*')
        .eq('route_id', routeId)
        .order('stop_order');

      if (error) throw error;
      
      if (stopsData) {
        setStops(stopsData);
      }
    } catch (error) {
      console.error('Error loading bus stops:', error);
      toast({
        title: "Error",
        description: "Failed to load bus stops",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Get Mapbox token from environment
    const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    
    if (!mapboxToken) {
      console.error('Mapbox token not found');
      toast({
        title: "Configuration Error",
        description: "Mapbox token is not configured",
        variant: "destructive"
      });
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map centered on a default location (will update based on stops)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0], // Will be updated
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add stops to map once loaded
    if (stops.length > 0) {
      stops.forEach((stop, index) => {
        // For demo, we'll use approximate coordinates
        // In production, you'd geocode the location or store coordinates
        const lng = -74.0060 + (index * 0.01); // Demo coordinates
        const lat = 40.7128 + (index * 0.01);

        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>${stop.name}</strong><br>${stop.location}<br>Arrival: ${stop.arrival_time}`
            )
          )
          .addTo(map.current!);
      });

      // Center map on first stop
      if (stops.length > 0) {
        map.current.setCenter([-74.0060, 40.7128]);
      }
    }

    // Simulate bus movement (in production, this would come from real GPS data)
    const simulateBusMovement = () => {
      const baseLng = -74.0060;
      const baseLat = 40.7128;
      const offset = (Date.now() / 10000) % 1; // Move over time
      
      const newLocation: [number, number] = [
        baseLng + (offset * 0.05),
        baseLat + (offset * 0.05)
      ];
      
      setBusLocation(newLocation);
    };

    simulateBusMovement();
    const interval = setInterval(simulateBusMovement, 5000); // Update every 5 seconds

    // Cleanup
    return () => {
      clearInterval(interval);
      map.current?.remove();
    };
  }, [stops]);

  // Update bus marker when location changes
  useEffect(() => {
    if (!map.current || !busLocation) return;

    if (busMarker.current) {
      busMarker.current.setLngLat(busLocation);
    } else {
      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.innerHTML = `
        <div style="
          background-color: #22c55e;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      `;

      busMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat(busLocation)
        .setPopup(
          new mapboxgl.Popup().setHTML('<strong>School Bus</strong><br>Currently in transit')
        )
        .addTo(map.current);
    }

    // Center map on bus
    map.current.flyTo({
      center: busLocation,
      zoom: 14,
      duration: 2000
    });
  }, [busLocation]);

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium">Bus Status</p>
        <p className="text-xs text-muted-foreground">
          {busLocation ? 'Tracking live location' : 'Waiting for GPS data...'}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs">Live</span>
        </div>
      </div>
    </div>
  );
};

export default BusMap;
