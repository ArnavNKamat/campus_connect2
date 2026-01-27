import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, MapPin, Save, User, Building, Trash2, Edit, Plus, X } from 'lucide-react';
import { staffMembers as initialStaff, locations as initialLocations } from '../data/mockData';
import { Staff, Location } from '../types';
import { toast } from 'sonner';

interface AdminAddStaffProps {
  onBack: () => void;
  onSetPin: () => void;
  pickedLocation: { lat: number; lng: number } | null;
}

export function AdminAddStaff({ onBack, onSetPin, pickedLocation }: AdminAddStaffProps) {
  // Load Data
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('gec_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });
  const [locationList, setLocationList] = useState<Location[]>(() => {
    const saved = localStorage.getItem('gec_locations');
    return saved ? JSON.parse(saved) : initialLocations;
  });

  // UI State
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    category: 'staff',
    building: 'Computer Block',
    floor: 'Ground',
    cabinNumber: '',
    location: { lat: 0, lng: 0 }
  });

  // --- RESTORE STATE ON LOAD (If returning from Map Picker) ---
  useEffect(() => {
    const savedForm = sessionStorage.getItem('staff_form_draft');
    if (savedForm) {
      const parsed = JSON.parse(savedForm);
      setFormData(parsed.data);
      if (parsed.editingId) {
        setEditingId(parsed.editingId);
        setIsAdding(true);
      } else if (parsed.isAdding) {
        setIsAdding(true);
      }
    }
  }, []);

  // --- UPDATE LOCATION IF PICKED ---
  useEffect(() => {
    if (pickedLocation) {
      setFormData(prev => ({ ...prev, location: pickedLocation }));
      // Clear draft after using it
      sessionStorage.removeItem('staff_form_draft');
    }
  }, [pickedLocation]);

  // --- HANDLERS ---

  const handleSetPinClick = () => {
    // Save draft before leaving screen
    sessionStorage.setItem('staff_form_draft', JSON.stringify({
      data: formData,
      editingId: editingId,
      isAdding: true
    }));
    onSetPin();
  };

  const handleEdit = (staff: Staff) => {
    const loc = locationList.find(l => l.id === staff.locationId);
    setFormData({
      fullName: staff.name,
      category: staff.designation === 'Faculty' ? 'staff' : 'lab',
      building: staff.department,
      floor: loc?.floor || 'Ground',
      cabinNumber: loc?.roomNumber || '',
      location: { lat: loc?.lat || 0, lng: loc?.lng || 0 }
    });
    setEditingId(staff.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this staff member and their location data?')) {
      const staffToDelete = staffList.find(s => s.id === id);
      
      const newStaffList = staffList.filter(s => s.id !== id);
      setStaffList(newStaffList);
      localStorage.setItem('gec_staff', JSON.stringify(newStaffList));

      if (staffToDelete) {
        const newLocList = locationList.filter(l => l.id !== staffToDelete.locationId);
        setLocationList(newLocList);
        localStorage.setItem('gec_locations', JSON.stringify(newLocList));
      }
      toast.success('Staff deleted');
    }
  };

  const handleSave = () => {
    if (!formData.fullName || !formData.building || formData.location.lat === 0) {
      toast.error('Please fill name, building, and set a location on map.');
      return;
    }

    // 1. Create or Update Location
    const locId = editingId 
      ? (staffList.find(s => s.id === editingId)?.locationId || `loc-${Date.now()}`)
      : `loc-${Date.now()}`;

    const newLocation: Location = {
      id: locId,
      name: formData.fullName, // Location name is Staff Name (for search)
      building: formData.building,
      floor: formData.floor,
      roomNumber: formData.cabinNumber,
      lat: formData.location.lat,
      lng: formData.location.lng,
      category: formData.category as any
    };

    // 2. Create or Update Staff
    const staffId = editingId || `staff-${Date.now()}`;
    const newStaff: Staff = {
      id: staffId,
      name: formData.fullName,
      designation: formData.category === 'staff' ? 'Faculty' : 'Lab Assistant',
      department: formData.building,
      photo: 'https://images.unsplash.com/photo-1579389083046-e3df9c2b3325?w=200',
      locationId: locId
    };

    // 3. Save to State & LocalStorage
    let updatedLocs, updatedStaff;

    if (editingId) {
      updatedLocs = locationList.map(l => l.id === locId ? newLocation : l);
      updatedStaff = staffList.map(s => s.id === staffId ? newStaff : s);
      toast.success('Staff Updated!');
    } else {
      updatedLocs = [...locationList, newLocation];
      updatedStaff = [...staffList, newStaff];
      toast.success('Staff Added!');
    }

    setLocationList(updatedLocs);
    setStaffList(updatedStaff);
    localStorage.setItem('gec_locations', JSON.stringify(updatedLocs));
    localStorage.setItem('gec_staff', JSON.stringify(updatedStaff));

    // Cleanup
    sessionStorage.removeItem('staff_form_draft');
    handleCancel();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      fullName: '', category: 'staff', building: 'Computer Block',
      floor: 'Ground', cabinNumber: '', location: { lat: 0, lng: 0 }
    });
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm border-b flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="font-bold text-lg whitespace-nowrap">
            {isAdding ? (editingId ? 'Edit Staff' : 'Add Staff') : 'Manage Staff'}
          </h2>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Add New
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isAdding ? (
          /* --- FORM VIEW --- */
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  className="w-full border p-2 pl-9 rounded-lg"
                  placeholder="e.g. Dr. Teslin Sir"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Department / Block</label>
                <select 
                  className="w-full border p-2 rounded-lg bg-white"
                  value={formData.building}
                  onChange={e => setFormData({...formData, building: e.target.value})}
                >
                  <option>Computer Block</option>
                  <option>IT Block</option>
                  <option>ETC Block</option>
                  <option>Mining Block</option>
                  <option>Civil Block</option>
                  <option>Mechanical Block</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Floor</label>
                <select 
                  className="w-full border p-2 rounded-lg bg-white"
                  value={formData.floor}
                  onChange={e => setFormData({...formData, floor: e.target.value})}
                >
                  <option>Ground</option>
                  <option>First</option>
                  <option>Second</option>
                  <option>Third</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Cabin / Room No.</label>
              <input 
                className="w-full border p-2 rounded-lg"
                placeholder="e.g. F-12 or Lab 3"
                value={formData.cabinNumber}
                onChange={e => setFormData({...formData, cabinNumber: e.target.value})}
              />
            </div>

            {/* MAP PICKER BUTTON */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="text-xs font-bold text-blue-800 uppercase mb-2 block">Cabin Location</label>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSetPinClick}
                  variant="outline" 
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {formData.location.lat !== 0 ? "Change Location" : "Set Location on Map"}
                </Button>
                {formData.location.lat !== 0 && (
                  <span className="text-xs text-green-600 font-bold flex items-center">
                    Saved <span className="ml-1">✓</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          /* --- LIST VIEW --- */
          <div className="space-y-3 pb-20">
            {staffList.map(staff => {
              const loc = locationList.find(l => l.id === staff.locationId);
              return (
                <div key={staff.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center group">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{staff.name}</h3>
                      <p className="text-xs text-gray-500">
                        {staff.department} • {loc?.roomNumber ? `Cabin ${loc.roomNumber}` : loc?.floor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(staff)}>
                      <Edit className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(staff.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}