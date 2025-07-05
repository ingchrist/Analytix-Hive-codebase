
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  timestamp: number;
  lectureId: number;
  createdAt: Date;
}

interface NotesTabProps {
  lectureId: number;
  lectureTitle: string;
  currentTime: number;
}

export const NotesTab: React.FC<NotesTabProps> = ({ lectureId, lectureTitle, currentTime }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      timestamp: currentTime,
      lectureId,
      createdAt: new Date()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote({ title: '', content: '' });
    setIsCreating(false);
  };

  const handleEditNote = (id: number) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setNewNote({ title: note.title, content: note.content });
      setEditingId(id);
      setIsCreating(true);
    }
  };

  const handleUpdateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim() || !editingId) return;

    setNotes(prev => prev.map(note => 
      note.id === editingId 
        ? { ...note, title: newNote.title, content: newNote.content }
        : note
    ));

    setNewNote({ title: '', content: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleDeleteNote = (id: number) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleCancel = () => {
    setNewNote({ title: '', content: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#3e4143]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-white">Your Notes</h3>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
              className="bg-[#fdb606] hover:bg-[#e6a406] text-black"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
        <p className="text-gray-400 text-sm">Take notes at {formatTime(currentTime)} in &quot;{lectureTitle}</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isCreating && (
          <div className="mb-4 p-4 bg-[#3e4143] rounded-lg">
            <div className="space-y-3">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                className="bg-[#2d2f31] border-[#5e6163] text-white"
              />
              <Textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className="bg-[#2d2f31] border-[#5e6163] text-white min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={editingId ? handleUpdateNote : handleCreateNote}
                  size="sm"
                  className="bg-[#fdb606] hover:bg-[#e6a406] text-black"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {editingId ? 'Update' : 'Save'} Note
                </Button>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="text-white border-[#5e6163] hover:bg-[#3e4143]"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No notes yet.</p>
              <p className="text-sm mt-1">Click &quot;Add Note to start taking notes!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-[#3e4143] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">{note.title}</h4>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleEditNote(note.id)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white h-6 w-6 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2 whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>At {formatTime(note.timestamp)}</span>
                  <span>•</span>
                  <span>{note.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
