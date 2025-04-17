
import React from 'react';
import { Bookmark, BookmarkPlus, Download, FolderPlus, Search, Settings } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  setIsAddingBookmark: (isAdding: boolean) => void;
  setIsManagingCategories: (isManaging: boolean) => void;
  importChromeBookmarks: () => void;
  setIsDisplayMenuOpen: (isOpen: boolean) => void;
  isDisplayMenuOpen: boolean;
  setCategoryVisibilityMenuOpen: (isOpen: boolean) => void;
  isCategoryVisibilityMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  setIsAddingBookmark,
  setIsManagingCategories,
  importChromeBookmarks,
  setIsDisplayMenuOpen,
  isDisplayMenuOpen,
  setCategoryVisibilityMenuOpen,
  isCategoryVisibilityMenuOpen
}) => {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <Bookmark className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold">Netflix Bookmarks</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            className="bg-gray-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Display settings button */}
        <button
          onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}
          className="bg-gray-800 hover:bg-gray-700 rounded-full p-2"
          title="Display settings"
        >
          <Settings className="w-6 h-6" />
        </button>
        
        {/* Category visibility button */}
        <button
          onClick={() => setCategoryVisibilityMenuOpen(!isCategoryVisibilityMenuOpen)}
          className="bg-gray-800 hover:bg-gray-700 rounded-full p-2"
          title="Toggle category visibility"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
        
        <button
          onClick={() => setIsAddingBookmark(true)}
          className="bg-red-600 hover:bg-red-700 rounded-full p-2"
          title="Add new bookmark"
        >
          <BookmarkPlus className="w-6 h-6" />
        </button>
        <button
          onClick={() => setIsManagingCategories(true)}
          className="bg-red-600 hover:bg-red-700 rounded-full p-2"
          title="Manage categories"
        >
          <FolderPlus className="w-6 h-6" />
        </button>
        <button
          onClick={importChromeBookmarks}
          className="bg-red-600 hover:bg-red-700 rounded-full p-2"
          title="Import Chrome bookmarks"
        >
          <Download className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;