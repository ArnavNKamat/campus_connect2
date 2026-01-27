import React from 'react';
import { Button } from './ui/button';
import { Users, Map, Calendar, LogOut, Eye, Bell } from 'lucide-react'; // Added Bell

interface AdminDashboardProps {
  onManageStaff: () => void;
  onDrawPaths: () => void;
  onManageEvents: () => void;
  onManagePanorama: () => void; 
  onManageNotifications: () => void; // <--- NEW PROP
  onSwitchToStudent: () => void;
}

export function AdminDashboard({ 
  onManageStaff, 
  onDrawPaths, 
  onManageEvents, 
  onManagePanorama,
  onManageNotifications,
  onSwitchToStudent 
}: AdminDashboardProps) {
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage GEC Navigator Data</p>
        </div>
        <Button variant="outline" onClick={onSwitchToStudent} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      {/* Dashboard Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Manage Staff */}
        <div onClick={onManageStaff} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
            <Users className="w-6 h-6 text-blue-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-lg text-slate-800">Manage Staff & Locations</h3>
          <p className="text-slate-500 text-sm mt-1">Add faculty, assign cabins, and update office locations.</p>
        </div>

        {/* 2. Draw Roads */}
        <div onClick={onDrawPaths} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
            <Map className="w-6 h-6 text-green-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-lg text-slate-800">Draw Campus Roads</h3>
          <p className="text-slate-500 text-sm mt-1">Trace walking paths on the map to fix navigation.</p>
        </div>

        {/* 3. Manage 360 Views */}
        <div onClick={onManagePanorama} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
            <Eye className="w-6 h-6 text-purple-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-lg text-slate-800">Manage 360° Views</h3>
          <p className="text-slate-500 text-sm mt-1">Upload panoramic images for departments and turns.</p>
        </div>

        {/* 4. Events */}
        <div onClick={onManageEvents} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group">
          <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
            <Calendar className="w-6 h-6 text-orange-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-lg text-slate-800">Manage Events</h3>
          <p className="text-slate-500 text-sm mt-1">Schedule academic, cultural, and sports events.</p>
        </div>

        {/* 5. Notifications (NEW) */}
        <div onClick={onManageNotifications} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group md:col-span-2">
          <div className="flex items-center gap-4">
             <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors shrink-0">
               <Bell className="w-6 h-6 text-red-600 group-hover:text-white" />
             </div>
             <div>
                <h3 className="font-bold text-lg text-slate-800">Broadcast Notifications</h3>
                <p className="text-slate-500 text-sm mt-1">Send urgent alerts or info messages to all students app-wide.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}