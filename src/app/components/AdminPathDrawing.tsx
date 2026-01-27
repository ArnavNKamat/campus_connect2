import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import { Button } from './ui/button';
import { ArrowLeft, Save, Trash2, Undo } from 'lucide-react';
import { GEC_CENTER } from '../data/mockData';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Click listener for drawing
function DrawEvents({ onAddPoint }: { onAddPoint: (pt: {lat: number, lng: number}) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function AdminPathDrawing({ onBack }: { onBack: () => void }) {
  const [points, setPoints] = useState<Array<{lat: number, lng: number}>>([]);

  const handleCopyCode = () => {
    const code = JSON.stringify(points, null, 2);
    navigator.clipboard.writeText(code);
    toast.success('Path coordinates copied to clipboard!');
  };

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-[999] bg-white p-3 rounded-xl shadow-lg flex gap-2 overflow-x-auto">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 border-l pl-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPoints(prev => prev.slice(0, -1))}>
            <Undo className="w-4 h-4 mr-1" /> Undo
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setPoints([])}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button className="bg-blue-600 ml-auto text-white" size="sm" onClick={handleCopyCode}>
            <Save className="w-4 h-4 mr-1" /> Copy Data
          </Button>
        </div>
      </div>

      <MapContainer center={[GEC_CENTER.lat, GEC_CENTER.lng]} zoom={17} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <DrawEvents onAddPoint={(pt) => setPoints([...points, pt])} />

        <Polyline positions={points.map(p => [p.lat, p.lng])} color="blue" weight={4} />
        
        {points.map((p, i) => (
           <Marker key={i} position={[p.lat, p.lng]} opacity={0.6} />
        ))}
      </MapContainer>
      
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-[999]">
         <span className="bg-black/50 text-white px-4 py-1 rounded-full text-xs">
            {points.length} points | Tap map to add point
         </span>
      </div>
    </div>
  );
}