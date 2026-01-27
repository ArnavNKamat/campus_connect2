import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Save, User, Building, Calendar, LocateFixed, Copy, Check } from 'lucide-react';
import { staffMembers, locations, events, CAMPUS_ROADS, PANORAMA_DATA } from '../data/mockData';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';

export function AdminPanoramaUpload({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'staff'|'dept'|'event'|'turn'>('staff');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  // For 'Turn' mode
  const [selectedCoord, setSelectedCoord] = useState<{lat: number, lng: number} | null>(null);
  const [turnKey, setTurnKey] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Load saved panoramas
  const [savedPanos, setSavedPanos] = useState<Record<string, string>>({});

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem('gec_panoramas') || '{}');
    setSavedPanos({ ...PANORAMA_DATA, ...localData });
  }, []);

  // Update Turn Key when coordinate changes
  useEffect(() => {
    if (selectedCoord) {
      // Create the exact key format used by the app
      const key = `${selectedCoord.lat.toFixed(5)},${selectedCoord.lng.toFixed(5)}`;
      setTurnKey(key);
      setCopied(false);
      
      // If image exists, pre-fill it
      if (savedPanos[key]) setImageUrl(savedPanos[key]);
      else setImageUrl('');
    }
  }, [selectedCoord, savedPanos]);

  // Magic Link Fixer
  const convertDriveLink = (link: string) => {
    if (link.includes('drive.google.com') && link.includes('/file/d/')) {
      const match = link.match(/\/d\/(.+?)\//);
      if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return link;
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(`'${turnKey}': '${imageUrl || 'YOUR_LINK_HERE'}',`);
    setCopied(true);
    toast.success("Copied Code! Now paste it in mockData.ts");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveLocal = () => {
    let key = selectedId;
    if (activeTab === 'turn') key = turnKey;

    if (!key || !imageUrl) {
      toast.error("Please select an item and enter an image URL");
      return;
    }

    const finalUrl = convertDriveLink(imageUrl);

    // Save to LocalStorage (Temporary Test)
    const currentLS = JSON.parse(localStorage.getItem('gec_panoramas') || '{}');
    currentLS[key] = finalUrl;
    localStorage.setItem('gec_panoramas', JSON.stringify(currentLS));
    
    // Update UI
    setSavedPanos({ ...savedPanos, [key]: finalUrl });
    toast.success("Saved Temporarily! Copy the ID to save permanently.");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="font-bold text-lg">Manage 360° Views</h2>
      </div>

      <div className="flex bg-white border-b px-2 overflow-x-auto">
        {[
          { id: 'staff', label: 'Faculty', icon: User },
          { id: 'dept', label: 'Department', icon: Building },
          { id: 'event', label: 'Event', icon: Calendar },
          { id: 'turn', label: 'Road Turns', icon: LocateFixed },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSelectedId(null); setSelectedCoord(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        
        {/* URL Input */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">360° Image URL</label>
            <input 
              type="text" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image Link here..."
              className="w-full border p-2 rounded-lg text-sm"
            />
          </div>

          {/* COPY ID BOX (Only for Turns) */}
          {activeTab === 'turn' && selectedCoord && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-blue-800 uppercase">Permanent Code for this Turn</p>
                <p className="text-xs text-blue-600 font-mono truncate">'{turnKey}': '...',</p>
              </div>
              <Button size="sm" variant="outline" className="bg-white" onClick={handleCopyKey}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
        </div>

        {/* 1. FACULTY LIST */}
        {activeTab === 'staff' && (
          <div className="space-y-2">
            {staffMembers.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelectedId(s.id)}
                className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${selectedId === s.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.designation}</p>
                </div>
                {savedPanos[s.id] && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Has 360°</span>}
              </div>
            ))}
          </div>
        )}

        {/* 2. DEPARTMENT LIST */}
        {activeTab === 'dept' && (
          <div className="space-y-2">
            {locations.filter(l => l.category === 'department').map(l => (
              <div 
                key={l.id} 
                onClick={() => setSelectedId(l.id)}
                className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${selectedId === l.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
              >
                <p className="font-medium">{l.name}</p>
                {savedPanos[l.id] && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Has 360°</span>}
              </div>
            ))}
          </div>
        )}

        {/* 3. EVENTS LIST */}
        {activeTab === 'event' && (
          <div className="space-y-2">
            {events.map(e => (
              <div 
                key={e.id} 
                onClick={() => setSelectedId(e.id)}
                className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${selectedId === e.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
              >
                <div>
                   <p className="font-medium">{e.title}</p>
                   <p className="text-xs text-gray-500">{e.venue}</p>
                </div>
                {savedPanos[e.id] && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Has 360°</span>}
              </div>
            ))}
          </div>
        )}

        {/* 4. TURNS MAP */}
        {activeTab === 'turn' && (
          <div className="h-[400px] rounded-xl overflow-hidden border relative">
             <MapContainer center={[15.4226, 73.9802]} zoom={17} style={{ height: '100%' }}>
               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               
               {CAMPUS_ROADS.map((path, i) => (
                 <React.Fragment key={i}>
                   <Polyline positions={path} pathOptions={{ color: 'blue', opacity: 0.3 }} />
                   {path.map((pt, j) => {
                     const key = `${pt.lat.toFixed(5)},${pt.lng.toFixed(5)}`;
                     const hasImage = !!savedPanos[key];
                     return (
                       <CircleMarker 
                         key={j} center={pt} radius={7} 
                         pathOptions={{ 
                           color: selectedCoord?.lat === pt.lat ? 'red' : (hasImage ? 'green' : 'blue'), 
                           fillColor: selectedCoord?.lat === pt.lat ? 'red' : (hasImage ? '#4ade80' : 'white'), 
                           fillOpacity: 1 
                         }}
                         eventHandlers={{ click: () => setSelectedCoord(pt) }}
                       />
                     );
                   })}
                 </React.Fragment>
               ))}
             </MapContainer>
             <div className="absolute top-2 left-2 bg-white/90 p-2 rounded text-xs shadow-md z-[999]">
               Tap a dot to see its ID Code
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
         <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleSaveLocal}
            disabled={(!selectedId && !selectedCoord) || !imageUrl}
         >
           <Save className="w-4 h-4 mr-2" /> Test Link (Local)
         </Button>
      </div>
    </div>
  );
}