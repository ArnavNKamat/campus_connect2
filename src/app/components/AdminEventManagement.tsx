import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Plus, Trash2, Calendar, MapPin, Edit, Save, X, Clock } from 'lucide-react';
import { events as initialEvents, locations } from '../data/mockData';
import { Event } from '../types';
import { toast } from 'sonner';

export function AdminEventManagement({ onBack }: { onBack: () => void }) {
  const [eventsList, setEventsList] = useState<Event[]>(() => {
    const saved = localStorage.getItem('gec_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // FIXED: Using startTime and endTime instead of just 'time'
  const [formData, setFormData] = useState<Partial<Event>>({
    type: 'academic',
    bannerImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500',
    venueDetails: '' 
  });

  const handleEdit = (event: Event) => {
    setFormData(event);
    setEditingId(event.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updated = eventsList.filter(e => e.id !== id);
      setEventsList(updated);
      localStorage.setItem('gec_events', JSON.stringify(updated));
      toast.success('Event deleted');
    }
  };

  const handleSave = () => {
    // FIXED: Validate startTime and endTime
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.locationId) {
      toast.error('Please fill in all required fields (including start/end time)');
      return;
    }

    const loc = locations.find(l => l.id === formData.locationId);
    
    // FIXED: Construct object with new fields
    const eventToSave: Event = {
      id: editingId || `evt-${Date.now()}`,
      title: formData.title || '',
      date: formData.date || '',
      startTime: formData.startTime || '', // <--- NEW
      endTime: formData.endTime || '',     // <--- NEW
      locationId: formData.locationId || '',
      type: (formData.type as any) || 'academic',
      bannerImage: formData.bannerImage || '',
      venue: loc ? loc.name : 'Unknown Venue',
      venueDetails: formData.venueDetails || ''
    };

    let updatedList;
    if (editingId) {
      updatedList = eventsList.map(e => e.id === editingId ? eventToSave : e);
      toast.success('Event Updated Successfully!');
    } else {
      updatedList = [...eventsList, eventToSave];
      toast.success('Event Created Successfully!');
    }

    setEventsList(updatedList);
    localStorage.setItem('gec_events', JSON.stringify(updatedList));
    
    setIsAdding(false);
    setEditingId(null);
    setFormData({ 
      type: 'academic', 
      bannerImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500',
      venueDetails: ''
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ type: 'academic', bannerImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500', venueDetails: '' });
  };

  const formatTime = (time: string) => {
    if(!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm border-b flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="font-bold text-lg whitespace-nowrap">
            {isAdding ? (editingId ? 'Edit Event' : 'New Event') : 'Manage Events'}
          </h2>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white gap-2 shadow-md">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add New Event</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isAdding ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Event Title</label>
              <input 
                className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white transition-colors" 
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                <input 
                  type="date" 
                  className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white"
                  value={formData.date || ''}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              {/* FIXED: Start Time Input */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                <input 
                  type="time" 
                  className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white"
                  value={formData.startTime || ''}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              {/* FIXED: End Time Input */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
                <input 
                  type="time" 
                  className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white"
                  value={formData.endTime || ''}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Venue (Map Location)</label>
              <select 
                className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white"
                value={formData.locationId || ''}
                onChange={e => setFormData({...formData, locationId: e.target.value})}
              >
                <option value="">Select a Campus Location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.building})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Specific Details (Room/Floor)</label>
              <input 
                className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white" 
                value={formData.venueDetails || ''}
                onChange={e => setFormData({...formData, venueDetails: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
              <div className="flex gap-2 mt-1">
                {['academic', 'cultural', 'sports'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({...formData, type: type as any})}
                    className={`px-3 py-1 rounded-full text-xs capitalize border transition-all ${
                      formData.type === type 
                        ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Banner Image URL</label>
              <input 
                  className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white" 
                  value={formData.bannerImage || ''}
                  onChange={e => setFormData({...formData, bannerImage: e.target.value})}
                />
            </div>

            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> {editingId ? 'Update Event' : 'Publish Event'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {eventsList.map(event => (
              <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center group transition-all hover:shadow-md">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border">
                    <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {event.date}
                      </span>
                      {/* FIXED: Display Start and End Time */}
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Clock className="w-3 h-3" /> {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                    <Edit className="w-4 h-4 text-blue-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}