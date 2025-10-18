'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Factory, Ship, Zap } from 'lucide-react';

// We'll use dynamic import for Leaflet to avoid SSR issues
// This is a placeholder - actual implementation needs leaflet installed

interface SupplyChainLocation {
  id: string;
  name: string;
  type: 'mine' | 'refinery' | 'port' | 'processing_plant';
  coordinates: [number, number];
  country: string;
  importance: number; // 0-1
  riskLevel: 'low' | 'moderate' | 'elevated' | 'critical';
  asset: string;
}

interface GlobalRiskMapProps {
  locations: SupplyChainLocation[];
  selectedAsset?: string;
}

export function GlobalRiskMap({ locations, selectedAsset }: GlobalRiskMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Store map instance
  const [selectedLocation, setSelectedLocation] = useState<SupplyChainLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Filter locations by asset if selected
  const filteredLocations = selectedAsset
    ? locations.filter(loc => loc.asset === selectedAsset)
    : locations;
  
  useEffect(() => {
    // Dynamic import of Leaflet to avoid SSR issues
    const loadMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current) return;
      
      // Prevent double initialization
      if (mapInstanceRef.current) {
        return;
      }
      
      try {
        // Import Leaflet dynamically
        const L = (await import('leaflet')).default;
        // CSS is imported in globals.css instead
        
        // Initialize map
        const map = L.map(mapRef.current).setView([20, 0], 2);
        mapInstanceRef.current = map; // Store reference
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);
        
        // Add markers for each location
        filteredLocations.forEach(location => {
          const color = {
            low: '#10b981',
            moderate: '#f59e0b',
            elevated: '#f97316',
            critical: '#ef4444'
          }[location.riskLevel];
          
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color};
                width: ${12 + location.importance * 12}px;
                height: ${12 + location.importance * 12}px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 10px ${color}80;
                animation: pulse 2s infinite;
              "></div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
          const marker = L.marker(location.coordinates, { icon }).addTo(map);
          
          marker.on('click', () => {
            setSelectedLocation(location);
          });
          
          // Tooltip
          marker.bindTooltip(location.name, {
            permanent: false,
            direction: 'top'
          });
        });
        
        setMapLoaded(true);
      } catch (error) {
        console.error('Failed to load map:', error);
      }
    };
    
    loadMap();
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only run once on mount
  
  // Update markers when locations change (separate effect)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    
    const updateMarkers = async () => {
      try {
        const L = (await import('leaflet')).default;
        const map = mapInstanceRef.current;
        
        // Clear existing markers
        map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });
        
        // Add updated markers
        filteredLocations.forEach(location => {
          const color = {
            low: '#10b981',
            moderate: '#f59e0b',
            elevated: '#f97316',
            critical: '#ef4444'
          }[location.riskLevel];
          
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color};
                width: ${12 + location.importance * 12}px;
                height: ${12 + location.importance * 12}px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 10px ${color}80;
                animation: pulse 2s infinite;
              "></div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
          const marker = L.marker(location.coordinates, { icon }).addTo(map);
          
          marker.on('click', () => {
            setSelectedLocation(location);
          });
          
          marker.bindTooltip(location.name, {
            permanent: false,
            direction: 'top'
          });
        });
      } catch (error) {
        console.error('Failed to update markers:', error);
      }
    };
    
    updateMarkers();
  }, [filteredLocations, mapLoaded]);
  
  return (
    <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Global Supply Chain Risk Map</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{filteredLocations.length} locations</span>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg overflow-hidden bg-gray-900"
        />
        
        {/* Fallback for when leaflet isn't installed yet */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 rounded-lg">
            <MapPin className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm">Loading map...</p>
            <p className="text-gray-600 text-xs mt-1">
              Install: npm install leaflet react-leaflet @types/leaflet
            </p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <LegendItem icon={Factory} label="Mine" color="text-cyan-400" />
        <LegendItem icon={Zap} label="Refinery" color="text-yellow-400" />
        <LegendItem icon={Ship} label="Port" color="text-blue-400" />
        <LegendItem icon={Factory} label="Plant" color="text-purple-400" />
      </div>
      
      {/* Risk Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs">
        <span className="text-gray-500">Risk Level:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-400">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-400">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-400">Elevated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-400">Critical</span>
        </div>
      </div>
      
      {/* Location Details Modal */}
      {selectedLocation && (
        <div className="mt-4 p-4 bg-gray-900 border border-cyan-500/50 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-white font-semibold">{selectedLocation.name}</h4>
              <p className="text-sm text-gray-400">{selectedLocation.country}</p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-1 text-cyan-400 uppercase">
                {selectedLocation.type.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Risk:</span>
              <span className={`ml-1 font-medium uppercase ${
                {
                  low: 'text-green-400',
                  moderate: 'text-yellow-400',
                  elevated: 'text-orange-400',
                  critical: 'text-red-400'
                }[selectedLocation.riskLevel]
              }`}>
                {selectedLocation.riskLevel}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Importance:</span>
              <span className="ml-1 text-white">
                {Math.round(selectedLocation.importance * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

// Sample data for demonstration
export const SAMPLE_LOCATIONS: SupplyChainLocation[] = [
  // Lithium mines
  { id: 'atacama', name: 'Atacama Salt Flat', type: 'mine', coordinates: [-23.6, -68.2], country: 'Chile', importance: 0.9, riskLevel: 'moderate', asset: 'lithium' },
  { id: 'greenbushes', name: 'Greenbushes Mine', type: 'mine', coordinates: [-33.8, 116.0], country: 'Australia', importance: 0.8, riskLevel: 'low', asset: 'lithium' },
  { id: 'olaroz', name: 'Olaroz Lithium Facility', type: 'processing_plant', coordinates: [-23.9, -66.5], country: 'Argentina', importance: 0.7, riskLevel: 'moderate', asset: 'lithium' },
  
  // Oil infrastructure
  { id: 'ghawar', name: 'Ghawar Oil Field', type: 'refinery', coordinates: [25.5, 49.5], country: 'Saudi Arabia', importance: 1.0, riskLevel: 'elevated', asset: 'oil' },
  { id: 'permian', name: 'Permian Basin', type: 'refinery', coordinates: [32.0, -102.0], country: 'USA', importance: 0.9, riskLevel: 'low', asset: 'oil' },
  { id: 'rotterdam', name: 'Port of Rotterdam', type: 'port', coordinates: [51.9, 4.5], country: 'Netherlands', importance: 0.8, riskLevel: 'moderate', asset: 'oil' },
  
  // Semiconductor facilities
  { id: 'tsmc-taiwan', name: 'TSMC Fab 18', type: 'processing_plant', coordinates: [24.8, 121.0], country: 'Taiwan', importance: 1.0, riskLevel: 'elevated', asset: 'semiconductors' },
  { id: 'samsung-korea', name: 'Samsung Hwaseong', type: 'processing_plant', coordinates: [37.2, 127.0], country: 'South Korea', importance: 0.9, riskLevel: 'moderate', asset: 'semiconductors' },
  { id: 'intel-arizona', name: 'Intel Fab 42', type: 'processing_plant', coordinates: [33.4, -111.9], country: 'USA', importance: 0.7, riskLevel: 'low', asset: 'semiconductors' }
];
