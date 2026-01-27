import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { StudentMainMap } from './components/StudentMainMap';
import { StaffSearchResult } from './components/StaffSearchResult';
import { ActiveNavigation } from './components/ActiveNavigation';
import { EventsDashboard } from './components/EventsDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAddStaff } from './components/AdminAddStaff';
import { AdminPathDrawing } from './components/AdminPathDrawing';
import { LocationPicker } from './components/LocationPicker';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanoramaUpload } from './components/AdminPanoramaUpload';
import { AdminEventManagement } from './components/AdminEventManagement';
import { AdminNotificationSender } from './components/AdminNotificationSender';

import { staffMembers as initialStaff, locations as initialLocations, events as initialEvents } from './data/mockData';
import { UserRole, Staff, Location, Event, Notification } from './types';
import { Button } from './components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';

type Screen = 
  | 'student-map' 
  | 'staff-detail' 
  | 'navigation' 
  | 'events' 
  | 'admin-dashboard' 
  | 'admin-add-staff' 
  | 'admin-path-drawing' 
  | 'admin-pick-location' 
  | 'admin-panorama' 
  | 'admin-events'
  | 'admin-notifications';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('student-map');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Data State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null); 
  const [activeTab, setActiveTab] = useState('home');

  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number} | null>(null);

  // Load Data
  useEffect(() => {
    const savedStaff = localStorage.getItem('gec_staff');
    const savedLocs = localStorage.getItem('gec_locations');
    const savedEvents = localStorage.getItem('gec_events');
    const savedNotes = localStorage.getItem('gec_notifications');
    
    setStaffList(savedStaff ? JSON.parse(savedStaff) : initialStaff);
    setLocationList(savedLocs ? JSON.parse(savedLocs) : initialLocations);
    setEventsList(savedEvents ? JSON.parse(savedEvents) : initialEvents);
    setNotifications(savedNotes ? JSON.parse(savedNotes) : []);
  }, [currentScreen]);

  const selectedStaff = selectedStaffId 
    ? staffList.find(s => s.id === selectedStaffId) 
    : null;
  
  const selectedLocation = selectedLocationId 
    ? locationList.find(l => l.id === selectedLocationId) 
    : selectedStaff 
      ? locationList.find(l => l.id === selectedStaff.locationId)
      : null;

  // --- NOTIFICATION HANDLERS ---
  const handleSendNotification = (newNote: Notification) => {
    const updated = [...notifications, newNote];
    setNotifications(updated);
    localStorage.setItem('gec_notifications', JSON.stringify(updated));
  };

  const handleUpdateNotification = (updatedNote: Notification) => {
    const updated = notifications.map(n => n.id === updatedNote.id ? updatedNote : n);
    setNotifications(updated);
    localStorage.setItem('gec_notifications', JSON.stringify(updated));
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isDeleted: true } : n);
    setNotifications(updated);
    localStorage.setItem('gec_notifications', JSON.stringify(updated));
  };

  // --- NEW: VOTE HANDLER ---
  const handleVote = (noteId: string, optionId: string) => {
    const updated = notifications.map(note => {
      if (note.id === noteId && note.pollOptions) {
        
        // Prevent clicking the same option twice
        if (note.votedOptionId === optionId) return note;

        const newOptions = note.pollOptions.map(opt => {
          // Increment new choice
          if (opt.id === optionId) return { ...opt, count: opt.count + 1 };
          // Decrement old choice (if exists)
          if (opt.id === note.votedOptionId) return { ...opt, count: opt.count - 1 };
          return opt;
        });

        return {
          ...note,
          votedOptionId: optionId,
          pollOptions: newOptions
        };
      }
      return note;
    });

    setNotifications(updated);
    localStorage.setItem('gec_notifications', JSON.stringify(updated));
  };

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    setSelectedStaffId(null);
    setSelectedLocationId(null);
    setSelectedEventId(null);

    const staff = staffList.find(s => s.name.toLowerCase().includes(lowerQuery) || s.department.toLowerCase().includes(lowerQuery));
    if (staff) {
      setSelectedStaffId(staff.id);
      setSelectedLocationId(staff.locationId);
      setCurrentScreen('staff-detail');
      setActiveTab('search');
      return;
    }

    const event = eventsList.find(e => e.title.toLowerCase().includes(lowerQuery));
    if (event) {
      setSelectedEventId(event.id); 
      setSelectedLocationId(event.locationId);
      setCurrentScreen('navigation');
      setActiveTab('search');
      toast.success(`Found Event: ${event.title}`);
      return;
    }

    const location = locationList.find(l => l.name.toLowerCase().includes(lowerQuery) || l.building.toLowerCase().includes(lowerQuery));
    if (location) {
      setSelectedLocationId(location.id);
      setCurrentScreen('navigation');
      setActiveTab('search');
    } else {
      toast.error('No matching staff, event, or department found');
    }
  };

  const handleRoleSwitchClick = () => {
    if (userRole === 'student') {
      setShowLoginModal(true);
    } else {
      setUserRole('student');
      setCurrentScreen('student-map');
      toast.info("Logged out successfully");
    }
  };

  const handleAdminLoginSuccess = () => {
    setUserRole('admin');
    setCurrentScreen('admin-dashboard');
  };

  const handleSetPin = () => {
    setCurrentScreen('admin-pick-location');
  };

  const handleLocationConfirmed = (lat: number, lng: number) => {
    setTempLocation({ lat, lng });
    setCurrentScreen('admin-add-staff');
  };

  return (
    <div className="h-screen overflow-hidden bg-white relative">
      <div className="fixed top-4 right-4 z-[900]">
        <Button
          onClick={handleRoleSwitchClick}
          className={`shadow-lg hover:shadow-xl rounded-full px-4 py-2 flex items-center gap-2 border transition-all ${
            userRole === 'admin' 
              ? 'bg-slate-900 text-white border-slate-700' 
              : 'bg-white text-gray-700 border-gray-200'
          }`}
          variant={userRole === 'admin' ? 'default' : 'outline'}
        >
          {userRole === 'student' ? (
            <>
              <Shield className="w-4 h-4 text-[#0056b3]" />
              <span className="text-sm font-medium">Admin Login</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-sm">Logout</span>
            </>
          )}
        </Button>
      </div>

      <AdminLoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {currentScreen === 'student-map' && (
        <StudentMainMap
          onNavigateToSearch={handleSearch}
          onNavigateToEvents={() => { setCurrentScreen('events'); setActiveTab('events'); }}
          onNavigateToNotifications={() => setActiveTab('notifications')}
          onNavigateBackToMap={() => setActiveTab('home')}
          activeTab={activeTab}
          notifications={notifications}
          onVote={handleVote} // <--- PASSING THE FUNCTION HERE
        />
      )}

      {currentScreen === 'staff-detail' && selectedStaff && selectedLocation && (
        <StaffSearchResult
          staff={selectedStaff}
          location={selectedLocation}
          onBack={() => { setCurrentScreen('student-map'); setActiveTab('home'); }}
          onNavigate={() => setCurrentScreen('navigation')}
        />
      )}

      {currentScreen === 'navigation' && selectedLocation && (
        <ActiveNavigation
          destination={selectedLocation}
          relatedEventId={selectedEventId}
          relatedStaffId={selectedStaffId}
          onBack={() => { setCurrentScreen('student-map'); setActiveTab('home'); }}
        />
      )}

      {currentScreen === 'events' && (
        <EventsDashboard
          events={eventsList}
          onBack={() => { setCurrentScreen('student-map'); setActiveTab('home'); }}
          onShowVenue={(locId: string, eventId: string) => { 
             setSelectedLocationId(locId); 
             setSelectedEventId(eventId);
             setCurrentScreen('navigation'); 
          }}
        />
      )}

      {currentScreen === 'admin-dashboard' && (
        <AdminDashboard
          onManageStaff={() => { setTempLocation(null); setCurrentScreen('admin-add-staff'); }}
          onDrawPaths={() => setCurrentScreen('admin-path-drawing')}
          onManagePanorama={() => setCurrentScreen('admin-panorama')}
          onManageEvents={() => setCurrentScreen('admin-events')}
          onManageNotifications={() => setCurrentScreen('admin-notifications')}
          onSwitchToStudent={() => { setUserRole('student'); setCurrentScreen('student-map'); }}
        />
      )}

      {currentScreen === 'admin-add-staff' && (
        <AdminAddStaff
          onBack={() => setCurrentScreen('admin-dashboard')}
          onSetPin={handleSetPin} 
          pickedLocation={tempLocation}
        />
      )}

      {currentScreen === 'admin-pick-location' && (
        <LocationPicker
          onBack={() => setCurrentScreen('admin-add-staff')}
          onConfirm={handleLocationConfirmed}
        />
      )}

      {currentScreen === 'admin-path-drawing' && (
        <AdminPathDrawing
          onBack={() => setCurrentScreen('admin-dashboard')}
        />
      )}

      {currentScreen === 'admin-panorama' && (
        <AdminPanoramaUpload
          onBack={() => setCurrentScreen('admin-dashboard')}
        />
      )}

      {currentScreen === 'admin-events' && (
        <AdminEventManagement
          onBack={() => setCurrentScreen('admin-dashboard')}
        />
      )}

      {currentScreen === 'admin-notifications' && (
        <AdminNotificationSender
          onBack={() => setCurrentScreen('admin-dashboard')}
          onSend={handleSendNotification}
          onUpdate={handleUpdateNotification}
          onDelete={handleDeleteNotification}
          history={notifications}
        />
      )}

      <Toaster position="top-center" />
    </div>
  );
}