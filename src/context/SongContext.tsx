import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, PrompterSettings, SongCategory } from '../types';

interface SongContextType {
  songs: Song[];
  addSong: (song: Omit<Song, 'id'>) => void;
  editSong: (song: Song) => void;
  deleteSong: (id: string) => void;
  deleteAllSongs: () => void;
  getRandomSongByCategory: (category: SongCategory) => Song | null;
  prompterSettings: PrompterSettings;
  updatePrompterSettings: (settings: Partial<PrompterSettings>) => void;
  selectedSongs: Set<string>;
  toggleSongSelection: (id: string) => void;
  clearSelection: () => void;
  deleteSelectedSongs: () => void;
  importSongs: (songs: Array<Omit<Song, 'id'>>) => void;
}

const defaultSettings: PrompterSettings = {
  rotationInterval: 120,
  fontSize: 'medium',
  isDarkMode: true,
  useHighContrast: false,
  upperCase: false,
};

const SongContext = createContext<SongContextType | null>(null);

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('capoeiraSongs');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

  const [prompterSettings, setPrompterSettings] = useState<PrompterSettings>(() => {
    const saved = localStorage.getItem('prompterSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('capoeiraSongs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('prompterSettings', JSON.stringify(prompterSettings));
  }, [prompterSettings]);

  const addSong = (song: Omit<Song, 'id'>) => {
    const newSong = { ...song, id: crypto.randomUUID() };
    setSongs(prev => [...prev, newSong]);
  };

  const editSong = (song: Song) => {
    setSongs(prev => prev.map(s => s.id === song.id ? song : s));
  };

  const deleteSong = (id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    setSelectedSongs(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const deleteAllSongs = () => {
    setSongs([]);
    setSelectedSongs(new Set());
  };

  const toggleSongSelection = (id: string) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedSongs(new Set());
  };

  const deleteSelectedSongs = () => {
    setSongs(prev => prev.filter(song => !selectedSongs.has(song.id)));
    clearSelection();
  };

  const importSongs = (newSongs: Array<Omit<Song, 'id'>>) => {
    const songsToAdd = newSongs.map(song => ({
      ...song,
      id: crypto.randomUUID()
    }));
    setSongs(prev => [...prev, ...songsToAdd]);
  };

  const getRandomSongByCategory = (category: SongCategory) => {
    const categorySongs = songs.filter(s => s.category === category);
    if (categorySongs.length === 0) return null;
    return categorySongs[Math.floor(Math.random() * categorySongs.length)];
  };

  const updatePrompterSettings = (settings: Partial<PrompterSettings>) => {
    setPrompterSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <SongContext.Provider value={{
      songs,
      addSong,
      editSong,
      deleteSong,
      deleteAllSongs,
      getRandomSongByCategory,
      prompterSettings,
      updatePrompterSettings,
      selectedSongs,
      toggleSongSelection,
      clearSelection,
      deleteSelectedSongs,
      importSongs,
    }}>
      {children}
    </SongContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongContext);
  if (!context) throw new Error('useSongs must be used within a SongProvider');
  return context;
};