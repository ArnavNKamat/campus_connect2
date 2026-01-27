import React from 'react';
import { Bell, AlertCircle, CheckCircle, Info, Calendar, ArrowLeft, BarChart2, Ban } from 'lucide-react';
import { Button } from './ui/button';
import { Notification } from '../types';

interface NotificationListProps {
  notifications: Notification[];
  onBack: () => void;
  onVote: (noteId: string, optionId: string) => void; // <--- NEW PROP
}

export function NotificationList({ notifications, onBack, onVote }: NotificationListProps) {
  // We NO LONGER need local state here because App.tsx handles it
  const sorted = [...notifications].reverse();

  const getIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'poll': return <BarChart2 className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'alert': return 'bg-red-50 border-red-100';
      case 'success': return 'bg-green-50 border-green-100';
      case 'poll': return 'bg-purple-50 border-purple-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="h-full bg-white flex flex-col animate-in fade-in duration-300">
      <div className="p-4 border-b sticky top-0 bg-white z-10 shadow-sm flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Button>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-800" />
          <h2 className="text-lg font-bold text-slate-800">Campus Notices</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {sorted.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
            <Bell className="w-12 h-12 mb-2 opacity-20" />
            <p>No new notifications</p>
          </div>
        ) : (
          sorted.map(note => {
            if (note.isDeleted) {
              return (
                <div key={note.id} className="p-3 rounded-xl border bg-gray-50 border-gray-200 flex items-center gap-3 opacity-70">
                  <Ban className="w-5 h-5 text-gray-400" />
                  <span className="text-sm italic text-gray-500">This message was deleted by admin</span>
                </div>
              );
            }

            return (
              <div key={note.id} className={`p-4 rounded-xl border ${getBgColor(note.type)} shadow-sm`}>
                <div className="flex gap-3 items-start">
                  <div className="mt-1 shrink-0">
                    {getIcon(note.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 leading-tight">{note.title}</h3>
                      {note.isEdited && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-2">Edited</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{note.message}</p>
                    
                    {note.type === 'poll' && note.pollOptions && (
                      <div className="mt-3 space-y-2">
                        {note.pollOptions.map(opt => {
                          const totalVotes = note.pollOptions?.reduce((a, b) => a + b.count, 0) || 1;
                          const percent = Math.round((opt.count / totalVotes) * 100);
                          const isSelected = note.votedOptionId === opt.id;
                          
                          return (
                            <button
                              key={opt.id}
                              onClick={() => onVote(note.id, opt.id)} // <--- USE PROP HERE
                              className={`w-full relative h-10 rounded-lg border overflow-hidden text-left px-3 text-xs font-bold transition-all ${
                                isSelected 
                                  ? 'bg-purple-50 border-purple-500 text-purple-800 ring-1 ring-purple-500' 
                                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {(note.votedOptionId) && (
                                <div 
                                  className={`absolute top-0 left-0 h-full transition-all duration-500 ${isSelected ? 'bg-purple-200/50' : 'bg-gray-100/50'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              )}
                              
                              <div className="relative z-10 flex justify-between w-full">
                                <span className="flex items-center gap-2">
                                  {isSelected && <CheckCircle className="w-3 h-3 text-purple-600" />}
                                  {opt.text}
                                </span>
                                {note.votedOptionId && <span>{percent}% ({opt.count})</span>}
                              </div>
                            </button>
                          );
                        })}
                        <p className="text-[10px] text-center text-gray-400">
                          {note.votedOptionId ? "Tap another option to change vote" : "Tap an option to vote"}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 font-medium">
                      <Calendar className="w-3 h-3" /> {note.date}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}