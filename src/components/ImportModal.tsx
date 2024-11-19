import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (songs: Array<{
    title: string;
    category: 'angola' | 'saoBentoPequeno' | 'saoBentoGrande';
    mnemonic?: string;
    lyrics?: string;
    mediaLink?: string;
  }>) => void;
}

const EXAMPLE_CSV = `title,category,mnemonic,lyrics,mediaLink
"Paranauê Paranauá",angola,"Para-na-uê","Paranauê, paranauê paraná
Paranauê, paranauê paraná",""
"Sim Sim Sim",saoBentoPequeno,"Sim sim non non","Sim sim sim, não não não
Sim sim sim, não não não",""
"Volta do Mundo",saoBentoGrande,"Vol-ta do mun-do","Volta do mundo, volta do mundo camará
Volta do mundo, volta do mundo camará",""`;

const parseCSV = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    // Gestion des retours chariot
    if (char === '\r' || char === '\n') {
      if (inQuotes) {
        // Dans les guillemets, on préserve le retour chariot
        currentValue += char;
      } else {
        // Hors des guillemets, c'est une nouvelle ligne
        if (currentValue || row.length > 0) {
          row.push(currentValue);
          result.push(row);
        }
        row = [];
        currentValue = '';
      }
      // Skip le \n si on a un \r\n
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    }
    // Gestion des guillemets
    else if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Double guillemet dans une chaîne entre guillemets
        currentValue += '"';
        i++;
      } else {
        // Basculement de l'état "entre guillemets"
        inQuotes = !inQuotes;
      }
    }
    // Gestion des virgules
    else if (char === ',' && !inQuotes) {
      row.push(currentValue);
      currentValue = '';
    }
    // Caractères normaux
    else {
      currentValue += char;
    }

    i++;
  }

  // Ajouter la dernière valeur et ligne si nécessaire
  if (currentValue || row.length > 0) {
    row.push(currentValue);
    result.push(row);
  }

  return result;
};

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());

      if (!headers.includes('title') || !headers.includes('category')) {
        throw new Error('Le fichier CSV doit contenir au moins les colonnes "title" et "category"');
      }

      const songs = rows.slice(1).map((values, rowIndex) => {
        const song: any = {};

        headers.forEach((header, index) => {
          let value = values[index] || '';
          value = value.replace(/^"|"$/g, '').replace(/""/g, '"');
          song[header.trim()] = value;
        });

        if (!song.title && !song.mnemonic) {
          throw new Error(`Le titre ou la phrase mnémotechnique est obligatoire à la ligne ${rowIndex + 2}`);
        }

        if (!['angola', 'saoBentoPequeno', 'saoBentoGrande'].includes(song.category)) {
          throw new Error(`Catégorie invalide à la ligne ${rowIndex + 2}: "${song.category}"\nCatégories valides : angola, saoBentoPequeno, saoBentoGrande`);
        }

        return song;
      });

      onImport(songs);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'importation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Importer des chants</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p>
            Importez vos chants à partir d'un fichier CSV avec les colonnes suivantes :
          </p>
          <code className="block bg-gray-50 p-2 rounded mt-2 text-sm">
            title,category,mnemonic,lyrics,mediaLink
          </code>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exemple de fichier CSV :
          </label>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
            {EXAMPLE_CSV}
          </pre>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Notes :</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
            <li>Le titre ou la phrase mnémotechnique est obligatoire</li>
            <li>Les catégories valides sont : angola, saoBentoPequeno, saoBentoGrande</li>
            <li>Utilisez des guillemets doubles (") pour les champs contenant des virgules ou des retours à la ligne</li>
            <li>Pour inclure un guillemet dans un texte, doublez-le ("")</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
            Choisir un fichier CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};