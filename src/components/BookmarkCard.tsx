
import React from 'react';
import { Edit2, Tag, X } from 'lucide-react';
import { BookmarkItem, DisplaySettings } from '../types';

interface BookmarkCardProps {
  bookmark: BookmarkItem;
  editBookmark: (bookmark: BookmarkItem) => void;
  deleteBookmark: (id: string) => void;
  openBookmark: (url: string) => void;
  displaySettings: DisplaySettings;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  editBookmark, 
  deleteBookmark, 
  openBookmark,
  displaySettings
}) => {
  // Helper functions from App.tsx
  const getCardSizeClass = () => {
    switch (displaySettings.cardSize) {
      case 'small': return 'w-32';
      case 'medium': return 'w-48';
      case 'large': return 'w-80';
      default: return 'w-80';
    }
  };

  const getCardSizeHeight = () => {
    switch (displaySettings.cardSize) {
      case 'small': return 'h-24';
      case 'medium': return 'h-36';
      case 'large': return 'h-60';
      default: return 'h-60';
    }
  };

  const getCardImageSizeHeight = () => {
    switch (displaySettings.cardSize) {
      case 'small': return 'h-18';
      case 'medium': return 'h-24';
      case 'large': return 'h-36';
      default: return 'h-36';
    }
  };

  return (
    <div
      className={`bg-gray-800 ${getCardSizeClass()} ${getCardSizeHeight()} rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer ${
        displaySettings.categoryLayout === 'horizontal' ? 'flex-shrink-0' : ''
      }`}
      onClick={(e) => {
        // Prevent opening link when clicking on edit/delete buttons
        if (!(e.target as HTMLElement).closest('button')) {
          openBookmark(bookmark.url);
        }
      }}
    >
      <img
        src={bookmark.imageUrl}
        alt={bookmark.title}
        className={`${getCardImageSizeHeight()} ${getCardSizeClass()} object-cover`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=128`;
        }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold hover:text-red-500">{bookmark.title}</h3>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => editBookmark(bookmark)}
              className="text-gray-400 hover:text-blue-500"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-2">{bookmark.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {bookmark.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;