import React from 'react';
import { Music, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Song, CATEGORY_COLORS } from '../types';
import { useSongs } from '../context/SongContext';

interface SongCardProps {
  song: Song;
  showActions?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ song, showActions = true }) => {
  const { selectedSongs, toggleSongSelection } = useSongs();
  const navigate = useNavigate();
  const isSelected = selectedSongs.has(song.id);
  const bgColor = CATEGORY_COLORS[song.category];

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleSongSelection(song.id);
  };

  const handleCardClick = () => {
    navigate(`/song/${song.id}`);
  };

  return (
    <div 
      className={`rounded-lg shadow-md p-4 mb-4 relative cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ backgroundColor: `${bgColor}15` }}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div 
            className="mt-1"
            onClick={e => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{song.title}</h3>
            {song.mnemonic && (
              <p className="text-sm text-gray-600 mt-1">{song.mnemonic}</p>
            )}
          </div>
        </div>
        {showActions && (
          <Link
            to={`/edit/${song.id}`}
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={e => e.stopPropagation()}
          >
            <Edit size={20} className="text-gray-600" />
          </Link>
        )}
      </div>
      {song.mediaLink && (
        <a
          href={song.mediaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 mt-2"
          onClick={e => e.stopPropagation()}
        >
          <Music size={16} className="mr-1" />
          Voir le média
        </a>
      )}
    </div>
  );
}