import React, { useState } from 'react';
import { ArrowLeft, Check, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { MapComponent } from './MapComponent';
import { toast } from 'sonner';

interface LocationPickerProps {
  onBack: () => void;
  onConfirm: (lat: number, lng: number) => void;
}

export function LocationPicker({ onBack, onConfirm }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    toast.dismiss();
    toast.success('Location selected! Click Confirm to save.');
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation.lat, selectedLocation.lng);
    } else {
      toast.error('Please tap on the map to select a location first.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-[#0056b3] text-white p-4 flex items-center gap-3 safe-area-top z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl">Pick Location</h1>
          <p className="text-sm opacity-90">Tap map to set position</p>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapComponent
          // Show a pin if user picked one
          markers={selectedLocation ? [{ ...selectedLocation, label: 'NEW' }] : []}
          onMapClick={handleMapClick}
        />

        {/* Floating Confirm Card */}
        <div className="absolute bottom-8 left-4 right-4">
          <Button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`w-full py-6 text-lg shadow-xl rounded-xl transition-all ${
              selectedLocation 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedLocation ? (
              <>
                <Check className="w-5 h-5 mr-2" /> Confirm Location
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 mr-2" /> Tap Map to Select
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}