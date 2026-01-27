import React from 'react';
import { ArrowLeft, MapPin, Building2, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Staff, Location } from '../types';

interface StaffSearchResultProps {
  staff: Staff;
  location: Location;
  onBack: () => void;
  onNavigate: () => void;
}

export function StaffSearchResult({ staff, location, onBack, onNavigate }: StaffSearchResultProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#0056b3] text-white p-4 flex items-center gap-3 safe-area-top">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl">Staff Details</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Card className="overflow-hidden rounded-2xl shadow-lg">
          {/* Staff Photo */}
          <div className="h-48 bg-gradient-to-br from-[#0056b3] to-[#003d82] flex items-center justify-center">
            <img
              src={staff.photo}
              alt={staff.name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
          </div>

          {/* Staff Info */}
          <div className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl mb-1">{staff.name}</h2>
              <p className="text-gray-600">{staff.designation}</p>
              <p className="text-[#0056b3]">{staff.department}</p>
            </div>

            {/* Location Details */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0056b3]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#0056b3]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Cabin Location</p>
                  <p className="font-semibold">
                    {location.building}, {location.roomNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0056b3]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#0056b3]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Floor</p>
                  <p className="font-semibold">{location.floor}</p>
                </div>
              </div>
            </div>

            {/* Navigate Button */}
            <Button
              onClick={onNavigate}
              className="w-full bg-[#0056b3] hover:bg-[#003d82] text-white py-6 rounded-xl flex items-center justify-center gap-2 mt-6"
            >
              <Navigation className="w-5 h-5" />
              Navigate to Cabin
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
