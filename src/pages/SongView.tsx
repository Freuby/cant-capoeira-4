import React from 'react';
import { ArrowLeft, Music } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSongs } from '../context/SongContext';
import { CATEGORY_COLORS } from '../types';

export const SongView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { songs } = useSongs();
  const song = songs.find(s => s.id === id);

  if (!song) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white p-4 pb-20 safe-area-inset">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">{song.title}</h1>
      </div>

      {song.mnemonic && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Phrase mnémotechnique
          </h2>
          <p className="text-lg">{song.mnemonic}</p>
        </div>
      )}

      {song.lyrics && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Paroles
          </h2>
          <pre className="whitespace-pre-wrap font-sans text-lg">
            {song.lyrics}
          </pre>
        </div>
      )}

      {song.mediaLink && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t">
          <a
            href={song.mediaLink}
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
};