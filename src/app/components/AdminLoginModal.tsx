import React, { useState } from 'react';
import { Button } from './ui/button';
import { X, Lock, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = () => {
    // --- HARDCODED CREDENTIALS ---
    // You can change these to whatever you want!
    const FIXED_USER = "vedant";
    const FIXED_PASS = "vedant3570";

    if (username === FIXED_USER && password === FIXED_PASS) {
      toast.success("Welcome back, Admin!");
      onLoginSuccess();
      onClose();
      // Reset fields
      setUsername('');
      setPassword('');
    } else {
      toast.error("Invalid Username or Password");
      setPassword(''); // Clear password only
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex flex-col items-center justify-center text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="bg-white/10 p-3 rounded-full mb-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold">Admin Access</h2>
          <p className="text-xs text-slate-400">Secure Restricted Area</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="password" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg mt-2 shadow-lg shadow-blue-200"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}