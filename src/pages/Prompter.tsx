import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Settings, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { Song, CATEGORY_COLORS, FONT_SIZES } from '../types';

const PrompterSong: React.FC<{
  song: Song | null;
  onClick: () => void;
  fontSize: string;
  upperCase: boolean;
  isDarkMode: boolean;
  useHighContrast: boolean;
}> = ({ song, onClick, fontSize, upperCase, isDarkMode, useHighContrast }) => {
  if (!song) return null;

  const text = upperCase ? 
    (song.mnemonic || song.title).toUpperCase() : 
    (song.mnemonic || song.title);

  const textColor = useHighContrast ? 
    (isDarkMode ? 'text-white' : 'text-black') : 
    'text-black';

  return (
    <div
      onClick={onClick}
      className="flex-1 p-6 rounded-lg m-2 cursor-pointer"
      style={{
        backgroundColor: CATEGORY_COLORS[song.category],
        minHeight: '30vh',
      }}
    >
      <div className="h-full flex flex-col justify-center items-center text-center">
        <h2 
          className={`font-bold ${textColor}`}
          style={{ fontSize }}
        >
          {text}
        </h2>
      </div>
    </div>
  );
};

export const Prompter = () => {
  const navigate = useNavigate();
  const { getRandomSongByCategory, prompterSettings } = useSongs();
  const [songs, setSongs] = useState<(Song | null)[]>([]);
  const [showLyrics, setShowLyrics] = useState<Song | null>(null);
  const [timeLeft, setTimeLeft] = useState(prompterSettings.rotationInterval);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const generateSongs = useCallback(() => {
    setSongs([
      getRandomSongByCategory('angola'),
      getRandomSongByCategory('saoBentoPequeno'),
      getRandomSongByCategory('saoBentoGrande'),
    ]);
    setTimeLeft(prompterSettings.rotationInterval);
  }, [getRandomSongByCategory, prompterSettings.rotationInterval]);

  useEffect(() => {
    generateSongs();
  }, [generateSongs]);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);

          document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible' && !wakeLock) {
              const newLock = await navigator.wakeLock.request('screen');
              setWakeLock(newLock);
            }
          });
        }
      } catch (err) {
        console.debug('Verrouillage d\'écran non disponible:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          generateSongs();
          return prompterSettings.rotationInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generateSongs, prompterSettings.rotationInterval]);

  const bgColor = prompterSettings.isDarkMode ? 'bg-black' : 'bg-white';
  const textColor = prompterSettings.isDarkMode ? 'text-white' : 'text-black';

  if (showLyrics) {
    const lyrics = prompterSettings.upperCase ? 
      showLyrics.lyrics?.toUpperCase() : 
      showLyrics.lyrics;

    return (
      <div className={`min-h-screen ${bgColor} ${textColor} p-6 safe-area-inset`}>
        <button
          onClick={() => setShowLyrics(null)}
          className={`mb-6 ${textColor}`}
        >
          ← Retour au prompteur
        </button>
        <h2 className="text-2xl font-bold mb-4">{showLyrics.title}</h2>
        <pre className="whitespace-pre-wrap font-sans">
          {lyrics || 'Pas de paroles disponibles'}
        </pre>
        {showLyrics.mediaLink && (
          <div className="fixed bottom-6 left-6 right-6">
            <a
              href={showLyrics.mediaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 text-white rounded-lg"
            >
              <Music size={20} />
              <span>Voir le média</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} safe-area-inset`}>
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-1 hover:bg-gray-800 rounded-full"
            title="Retour à l'accueil"
          >
            <Home size={20} />
          </button>
          <div className="text-lg font-bold">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={generateSongs}
            className="p-1 hover:bg-gray-800 rounded-full"
          >
            <RotateCcw size={20} />
          </button>
          <Link to="/settings" className="p-1 hover:bg-gray-800 rounded-full">
            <Settings size={20} />
          </Link>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-48px)]">
        {songs.map((song, index) => (
          <PrompterSong
            key={song?.id || index}
            song={song}
            onClick={() => song && setShowLyrics(song)}
            fontSize={FONT_SIZES[prompterSettings.fontSize]}
            upperCase={prompterSettings.upperCase}
            isDarkMode={prompterSettings.isDarkMode}
            useHighContrast={prompterSettings.useHighContrast}
          />
        ))}
      </div>
    </div>
  );
};