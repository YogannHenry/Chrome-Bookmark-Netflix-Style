
import React, { useState } from 'react';
import { BookmarkItem, Category } from '../types';
import { Image, Tag, X } from 'lucide-react';

interface BookmarkModalProps {
  isEditing: boolean;
  bookmark: Partial<BookmarkItem>;
  categories: Category[];
  allTags: string[];
  onClose: () => void;
  onSave: () => void;
  setBookmark: (bookmark: Partial<BookmarkItem>) => void;
  fetchOgImage: (url: string) => void;
  isLoadingImage: boolean;
  bookmarkModalRef: React.RefObject<HTMLDivElement>;
}

const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isEditing,
  bookmark,
  categories,
  allTags,
  onClose,
  onSave,
  setBookmark,
  fetchOgImage,
  isLoadingImage,
  bookmarkModalRef
}) => {
  const [currentTag, setCurrentTag] = useState<string>('');

  const addTagToBookmark = () => {
    if (!currentTag.trim()) return;
    
    // Check if tag already exists
    if (bookmark.tags?.includes(currentTag.trim())) {
      return;
    }
    
    setBookmark({
      ...bookmark,
      tags: [...(bookmark.tags || []), currentTag.trim()]
    });
    
    // Clear the input
    setCurrentTag('');
  };
  
  const removeTagFromBookmark = (tagToRemove: string) => {
    setBookmark({
      ...bookmark,
      tags: bookmark.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div 
        ref={bookmarkModalRef}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full bg-gray-700 rounded p-2"
            value={bookmark.title || ''}
            onChange={(e) => setBookmark({ ...bookmark, title: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="URL"
              className="flex-1 bg-gray-700 rounded p-2"
              value={bookmark.url || ''}
              onChange={(e) => setBookmark({ ...bookmark, url: e.target.value })}
            />
            <button
              onClick={() => bookmark.url && fetchOgImage(bookmark.url)}
              className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-2"
              disabled={!bookmark.url || isLoadingImage}
            >
              <Image className="w-5 h-5" />
            </button>
          </div>
          <input
            type="url"
            placeholder="Custom Image URL (optional)"
            className="w-full bg-gray-700 rounded p-2"
            value={bookmark.imageUrl || ''}
            onChange={(e) => setBookmark({ ...bookmark, imageUrl: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="w-full bg-gray-700 rounded p-2"
            value={bookmark.description || ''}
            onChange={(e) => setBookmark({ ...bookmark, description: e.target.value })}
          />
          
          {/* Tag management */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag"
                className="flex-1 bg-gray-700 rounded p-2"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTagToBookmark();
                  }
                }}
              />
              <button
                onClick={addTagToBookmark}
                className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-2"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>
            
            {/* Existing tags dropdown */}
            {allTags.length > 0 && (
              <div className="mt-2">
                <label className="block text-sm text-gray-400 mb-1">Select existing tag:</label>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter(tag => !bookmark.tags?.includes(tag))
                    .map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setBookmark({
                            ...bookmark,
                            tags: [...(bookmark.tags || []), tag]
                          });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
            
            {/* Display current tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="mt-2">
                <label className="block text-sm text-gray-400 mb-1">Current tags:</label>
                <div className="flex flex-wrap gap-2">
                  {bookmark.tags.map((tag, i) => (
                    <div
                      key={i}
                      className="bg-red-600 text-white text-sm px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTagFromBookmark(tag)}
                        className="ml-1 hover:bg-red-700 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <select
            className="w-full bg-gray-700 rounded p-2"
            value={bookmark.categoryId || 'default'}
            onChange={(e) => setBookmark({ ...bookmark, categoryId: e.target.value })}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={onSave}
            className="w-full bg-red-600 hover:bg-red-700 rounded p-2 font-semibold"
          >
            {isEditing ? 'Update Bookmark' : 'Add Bookmark'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkModal;