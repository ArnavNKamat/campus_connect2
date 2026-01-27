import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { Search, Calendar, Bell, Home } from 'lucide-react';
import { GEC_CENTER, locations, CAMPUS_ROADS } from '../data/mockData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NotificationList } from './NotificationList';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface StudentMainMapProps {
  onNavigateToSearch: (query: string) => void;
  onNavigateToEvents: () => void;
  onNavigateToNotifications: () => void;
  onNavigateBackToMap: () => void;
  activeTab: string;
  notifications: any[];
  onVote: (noteId: string, optionId: string) => void; // <--- NEW PROP
}

export function StudentMainMap({ 
  onNavigateToSearch, 
  onNavigateToEvents, 
  onNavigateToNotifications,
  onNavigateBackToMap,
  activeTab,
  notifications,
  onVote // <--- Destructure it
}: StudentMainMapProps) {
  
  if (activeTab === 'notifications') {
    return (
      <NotificationList 
        notifications={notifications} 
        onBack={onNavigateBackToMap}
        onVote={onVote} // <--- Pass it down
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col">
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[GEC_CENTER.lat, GEC_CENTER.lng]} 
          zoom={18} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {CAMPUS_ROADS.map((road, i) => (
             <Polyline key={i} positions={road} pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.5 }} />
          ))}

          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-4 left-4 right-4 z-[500]">
          <div className="bg-white rounded-xl shadow-lg flex items-center p-2 border border-slate-200">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input 
              type="text"
              placeholder="Search faculty, labs, or rooms..."
              className="flex-1 p-2 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onNavigateToSearch(e.currentTarget.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-t p-3 pb-6 flex justify-around items-center z-10 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        
        <button 
          onClick={onNavigateBackToMap}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">Map</span>
        </button>

        <button 
          onClick={onNavigateToEvents}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'events' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Calendar className={`w-6 h-6 ${activeTab === 'events' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">Events</span>
        </button>

        <button 
          onClick={onNavigateToNotifications}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'notifications' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="relative">
            <Bell className={`w-6 h-6 ${activeTab === 'notifications' ? 'fill-current' : ''}`} />
            {notifications.length > 0 && (
               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <span className="text-[10px] font-bold">Notices</span>
        </button>

      </div>
    </div>
  );
}