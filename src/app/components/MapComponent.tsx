import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GEC_CENTER } from '../data/mockData';

// --- FIX: This makes the Pin Icons appear correctly ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// ----------------------------------------------------

// Helper component to center the map when you click search results
function ChangeView({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap();
  map.setView([center.lat, center.lng]);
  return null;
}

export function MapComponent({ markers = [], paths = [], center = GEC_CENTER }: any) {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={17} 
      style={{ height: '100%', width: '100%' }}
    >
      {/* This loads the FREE OpenStreetMap tiles */}
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ChangeView center={center} />

      {/* Render the Pins */}
      {markers.map((marker: any, idx: number) => (
        <Marker 
          key={idx} 
          position={[marker.lat, marker.lng]} 
          title={marker.label} 
        />
      ))}

      {/* Render the Boundary Lines */}
      {paths.map((path: any[], idx: number) => (
        <Polyline 
          key={idx} 
          positions={path.map(p => [p.lat, p.lng])} 
          color="#2563eb" // Blue color
        />
      ))}
    </MapContainer>
  );
}