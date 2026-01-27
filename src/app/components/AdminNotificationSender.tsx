import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Send, BarChart2, CheckCircle, AlertCircle, Info, Plus, X, Trash2, Edit, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Notification, PollOption } from '../types';

interface AdminNotificationSenderProps {
  onBack: () => void;
  onSend: (note: Notification) => void;
  onUpdate: (note: Notification) => void;
  onDelete: (id: string) => void;
  history: Notification[]; 
}

export function AdminNotificationSender({ onBack, onSend, onUpdate, onDelete, history }: AdminNotificationSenderProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info'|'alert'|'success'|'poll'>('info');
  const [options, setOptions] = useState<string[]>(['Yes', 'No']);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setType('info');
    setOptions(['Yes', 'No']);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (note: Notification) => {
    setTitle(note.title);
    setMessage(note.message);
    setType(note.type);
    if (note.pollOptions) {
      setOptions(note.pollOptions.map(o => o.text));
    }
    setEditingId(note.id);
    setIsFormOpen(true);
  };

  const addOption = () => setOptions([...options, '']);
  const updateOption = (idx: number, txt: string) => {
    const newOpts = [...options];
    newOpts[idx] = txt;
    setOptions(newOpts);
  };
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!title || !message) {
      toast.error('Please enter a title and message');
      return;
    }

    let pollData: PollOption[] | undefined = undefined;

    if (type === 'poll') {
      const validOptions = options.filter(o => o.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('Poll needs at least 2 options');
        return;
      }
      pollData = validOptions.map((opt, i) => ({
        id: `opt-${i}-${Date.now()}`,
        text: opt,
        count: 0
      }));
    }

    if (editingId) {
      // UPDATE EXISTING
      const updatedNote: Notification = {
        id: editingId,
        title,
        message,
        type,
        date: new Date().toISOString().split('T')[0],
        pollOptions: pollData,
        votedOptionId: null, // Reset vote state on edit? Or keep it?
        isEdited: true 
      };
      // Note: In a real app, you might want to preserve counts here
      onUpdate(updatedNote);
      toast.success('Message Updated!');
    } else {
      // CREATE NEW
      const newNote: Notification = {
        id: `note-${Date.now()}`,
        title,
        message,
        type,
        date: new Date().toISOString().split('T')[0],
        pollOptions: pollData,
        votedOptionId: null // <--- CHANGED FROM hasVoted
      };
      onSend(newNote);
      toast.success('Message Sent!');
    }
    
    resetForm();
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Delete this message for everyone?')) {
      onDelete(id);
      toast.success('Message Deleted');
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm border-b flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="font-bold text-lg">{isFormOpen ? (editingId ? 'Edit Message' : 'New Message') : 'Manage Notices'}</h2>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 text-white gap-2 shadow-md">
            <Plus className="w-4 h-4" /> New Message
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isFormOpen ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'info', label: 'Info', icon: Info, color: 'text-blue-500 bg-blue-50 border-blue-200' },
                { id: 'alert', label: 'Alert', icon: AlertCircle, color: 'text-red-500 bg-red-50 border-red-200' },
                { id: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-500 bg-green-50 border-green-200' },
                { id: 'poll', label: 'Poll', icon: BarChart2, color: 'text-purple-500 bg-purple-50 border-purple-200' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    type === t.id ? `${t.color} ring-2 ring-offset-1` : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                <input 
                  className="w-full border-b-2 p-2 focus:border-blue-500 focus:outline-none bg-transparent font-bold text-lg" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">{type === 'poll' ? 'Poll Question' : 'Message Body'}</label>
                <textarea 
                  className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 min-h-[100px] mt-1" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {type === 'poll' && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-xs font-bold text-purple-600 uppercase block mb-2">Poll Options</label>
                  <div className="space-y-2">
                    {options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          className="flex-1 border p-2 rounded-lg text-sm"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                        />
                        {options.length > 2 && (
                          <Button size="icon" variant="ghost" className="text-red-400" onClick={() => removeOption(i)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={addOption} className="mt-3 w-full text-purple-600 border-purple-200 hover:bg-purple-50">
                    <Plus className="w-4 h-4 mr-2" /> Add Option
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={resetForm}>Cancel</Button>
              <Button 
                className={`flex-1 text-white shadow-lg ${type === 'poll' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                onClick={handleSubmit}
              >
                <Send className="w-4 h-4 mr-2" /> 
                {editingId ? 'Update' : (type === 'poll' ? 'Launch Poll' : 'Send')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {[...history].reverse().map(note => (
              <div key={note.id} className={`p-4 rounded-xl border bg-white shadow-sm flex gap-3 ${note.isDeleted ? 'opacity-50' : ''}`}>
                <div className="shrink-0 pt-1">
                   {note.isDeleted ? <Ban className="w-5 h-5 text-gray-400" /> : (
                     note.type === 'poll' ? <BarChart2 className="w-5 h-5 text-purple-500" /> : 
                     note.type === 'alert' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                     <Info className="w-5 h-5 text-blue-500" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <h3 className={`font-bold truncate ${note.isDeleted ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                       {note.isDeleted ? 'Deleted Message' : note.title}
                     </h3>
                     <span className="text-[10px] text-gray-400">{note.date}</span>
                  </div>
                  {!note.isDeleted && <p className="text-xs text-gray-500 truncate mt-1">{note.message}</p>}
                  {note.isEdited && !note.isDeleted && <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">Edited</span>}
                </div>
                {!note.isDeleted && (
                  <div className="flex flex-col gap-1 border-l pl-3 ml-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => handleEditClick(note)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteClick(note.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}