import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Bookmark, BookmarkPlus, Edit2, Folder, FolderPlus, Search, Tag, X, Image, Download, LayoutGrid, Settings } from 'lucide-react';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  imageUrl: string;
  tags: string[];
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

// Add interface for display settings
interface DisplaySettings {
  cardSize: 'small' | 'medium' | 'large';
  categoryLayout: 'grid' | 'flex' | 'horizontal';
}

function App() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'default', name: 'General' },
    { id: 'work', name: 'Work' },
    { id: 'personal', name: 'Personal' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [isEditingBookmark, setIsEditingBookmark] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [newBookmark, setNewBookmark] = useState<Partial<BookmarkItem>>({
    title: '',
    url: '',
    description: '',
    imageUrl: '',
    tags: [],
    categoryId: 'default'
  });
  const [newCategory, setNewCategory] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Add display settings state
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    cardSize: 'large',
    categoryLayout: 'grid'
  });
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);

  // Add new state for tag input
  const [currentTag, setCurrentTag] = useState<string>('');

  useEffect(() => {
    console.log("App mounted, loading data from storage");
    
    // First try to check if extension API is available
    if (typeof chrome === 'undefined' || !chrome.storage) {
      console.error("Chrome storage API not available");
      return;
    }
    
    // Function to load data from storage
    const loadFromStorage = () => {
      chrome.storage.local.get(['bookmarks', 'categories', 'displaySettings'], (result) => {
        console.log("Retrieved from local storage:", result);
        
        if (result.bookmarks) {
          console.log("Setting", result.bookmarks.length, "bookmarks from local storage");
          setBookmarks(result.bookmarks);
        } else {
          console.log("No bookmarks found in storage");
        }
        
        if (result.categories) {
          setCategories(result.categories);
        }

        // Load display settings if available
        if (result.displaySettings) {
          setDisplaySettings(result.displaySettings);
        }
      });
    };
    
    // Try to ping the background script to make sure it's active
    try {
      chrome.runtime.sendMessage({ action: "ping" }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Background script ping failed:", chrome.runtime.lastError);
        } else if (response && response.success) {
          console.log("Background script responded to ping:", response.message);
        }
        
        // Load data regardless of ping outcome
        loadFromStorage();
      });
    } catch (error) {
      console.error("Error pinging background script:", error);
      loadFromStorage();
    }
  }, []);

  // Add function to save display settings
  const saveDisplaySettings = (settings: DisplaySettings) => {
    console.log("Saving display settings to storage", settings);
    chrome.storage.local.set({ displaySettings: settings }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving display settings:", chrome.runtime.lastError);
      } else {
        setDisplaySettings(settings);
      }
    });
  };

  const saveBookmarks = (updatedBookmarks: BookmarkItem[]) => {
    console.log("Saving", updatedBookmarks.length, "bookmarks to storage");
    
    // Use local storage for more reliable saving (sync has size limits)
    chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving bookmarks:", chrome.runtime.lastError);
        alert(`Failed to save bookmarks: ${chrome.runtime.lastError.message}`);
      } else {
        console.log("Bookmarks saved successfully to local storage");
        setBookmarks(updatedBookmarks);
      }
    });
  };

  const saveCategories = (updatedCategories: Category[]) => {
    console.log("Saving categories to storage");
    chrome.storage.local.set({ categories: updatedCategories }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving categories:", chrome.runtime.lastError);
        alert(`Failed to save categories: ${chrome.runtime.lastError.message}`);
      } else {
        setCategories(updatedCategories);
      }
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(bookmarks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    reorderedItem.categoryId = result.destination.droppableId;
    items.splice(result.destination.index, 0, reorderedItem);

    saveBookmarks(items);
  };

  const fetchOgImage = async (url: string) => {
    try {
      setIsLoadingImage(true);
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.data?.image?.url) {
        setNewBookmark(prev => ({ ...prev, imageUrl: data.data.image.url }));
      } else {
        // Fallback to favicon if no OG image
        setNewBookmark(prev => ({ 
          ...prev, 
          imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128` 
        }));
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      // Fallback to favicon on error
      setNewBookmark(prev => ({ 
        ...prev, 
        imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128` 
      }));
    } finally {
      setIsLoadingImage(false);
    }
  };

  const addBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) return;

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newBookmark.title!,
      url: newBookmark.url!,
      description: newBookmark.description || '',
      imageUrl: newBookmark.imageUrl || `https://www.google.com/s2/favicons?domain=${new URL(newBookmark.url!).hostname}&sz=128`,
      tags: newBookmark.tags || [],
      categoryId: newBookmark.categoryId || 'default'
    };

    saveBookmarks([...bookmarks, bookmark]);
    setIsAddingBookmark(false);
    setNewBookmark({
      title: '',
      url: '',
      description: '',
      imageUrl: '',
      tags: [],
      categoryId: 'default'
    });
  };

  const editBookmark = (bookmark: BookmarkItem) => {
    setEditingBookmarkId(bookmark.id);
    setNewBookmark(bookmark);
    setIsEditingBookmark(true);
  };

  const updateBookmark = () => {
    if (!editingBookmarkId || !newBookmark.title || !newBookmark.url) return;

    const updatedBookmarks = bookmarks.map(bookmark => 
      bookmark.id === editingBookmarkId
        ? {
            ...bookmark,
            title: newBookmark.title!,
            url: newBookmark.url!,
            description: newBookmark.description || '',
            imageUrl: newBookmark.imageUrl || bookmark.imageUrl,
            tags: newBookmark.tags || [],
            categoryId: newBookmark.categoryId || 'default'
          }
        : bookmark
    );

    console.log("Updating bookmark:", editingBookmarkId);
    saveBookmarks(updatedBookmarks);
    setIsEditingBookmark(false);
    setEditingBookmarkId(null);
    setNewBookmark({
      title: '',
      url: '',
      description: '',
      imageUrl: '',
      tags: [],
      categoryId: 'default'
    });
  };

  const deleteBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    
    const category: Category = {
      id: newCategory.toLowerCase().replace(/\s+/g, '-'),
      name: newCategory.trim()
    };

    saveCategories([...categories, category]);
    setNewCategory('');
  };

  const deleteCategory = (categoryId: string) => {
    // Move bookmarks from deleted category to default
    const updatedBookmarks = bookmarks.map(bookmark =>
      bookmark.categoryId === categoryId
        ? { ...bookmark, categoryId: 'default' }
        : bookmark
    );
    saveBookmarks(updatedBookmarks);
    
    // Remove category
    saveCategories(categories.filter(c => c.id !== categoryId));
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || bookmark.categoryId === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => bookmark.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  const importChromeBookmarks = () => {
    console.log("Importing Chrome bookmarks...");
    
    try {
      chrome.runtime.sendMessage({ action: "getBookmarks" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting bookmarks:", chrome.runtime.lastError);
          alert(`Error: ${chrome.runtime.lastError.message}`);
          return;
        }
        
        if (response && response.bookmarks && response.bookmarks.length > 0) {
          console.log("Received", response.bookmarks.length, "bookmarks from Chrome");
          
          // Convert Chrome bookmarks to app format
          const newBookmarks = response.bookmarks.map((item: any, index: number) => ({
            id: `imported-${Date.now()}-${index}`,
            title: item.title || "Untitled",
            url: item.url,
            description: '',
            imageUrl: `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=128`,
            tags: [],
            categoryId: 'default'
          }));
          
          // Filter out duplicates
          const existingUrls = new Set(bookmarks.map(b => b.url));
          const uniqueNewBookmarks = newBookmarks.filter(b => !existingUrls.has(b.url));
          
          console.log("Adding", uniqueNewBookmarks.length, "unique new bookmarks");
          
          if (uniqueNewBookmarks.length > 0) {
            const updatedBookmarks = [...bookmarks, ...uniqueNewBookmarks];
            saveBookmarks(updatedBookmarks);
            alert(`Successfully imported ${uniqueNewBookmarks.length} bookmarks!`);
          } else {
            alert("No new bookmarks to import.");
          }
        } else {
          console.error("No bookmarks received from Chrome or empty response", response);
          alert("No bookmarks found to import.");
        }
      });
    } catch (error) {
      console.error("Exception during bookmark import:", error);
      alert(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const openBookmark = (url: string) => {
    chrome.tabs.create({ url, active: true });
  };

  // Helper function to get card size class
  const getCardSizeClass = () => {
    switch (displaySettings.cardSize) {
      case 'small':
        return 'w-32';
      case 'medium':
        return 'w-48';
      case 'large':
        return 'w-80';
      default:
        return 'w-80';
    }
  };

  const getCardSizeHeight = () => {
    switch (displaySettings.cardSize) {
      case 'small':
        return 'h-24';
      case 'medium':
        return 'h-36';
      case 'large':
        return 'h-60';
      default:
        return 'h-60';
    }
  }

  const getCardImageSizeHeight = () => {
    switch (displaySettings.cardSize) {
      case 'small':
        return 'h-18';
      case 'medium':
        return 'h-24';
      case 'large':
        return 'h-36';
      default:
        return 'h-36';
    }
  }
  // Helper function to get grid class
  const getCategoryLayoutClass = () => {
    switch(displaySettings.categoryLayout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
      case 'flex':
        return 'flex flex-wrap gap-6';
      case 'horizontal':
        return 'flex flex-col gap-12'; // Vertical stack of categories
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  };
  
  // Helper function to get bookmark container class for horizontal layout
  const getBookmarksContainerClass = () => {
    return displaySettings.categoryLayout === 'horizontal'
      ? 'flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900'
      : 'space-y-4';
  };

  const addTagToBookmark = () => {
    if (!currentTag.trim()) return;
    
    // Check if tag already exists
    if (newBookmark.tags?.includes(currentTag.trim())) {
      return;
    }
    
    setNewBookmark({
      ...newBookmark,
      tags: [...(newBookmark.tags || []), currentTag.trim()]
    });
    
    // Clear the input
    setCurrentTag('');
  };
  
  const removeTagFromBookmark = (tagToRemove: string) => {
    setNewBookmark({
      ...newBookmark,
      tags: newBookmark.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-8">
      <div className="max-w-7xl mx-auto">
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
            {/* Add display settings button */}
            <div className="relative">
              <button
                onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}
                className="bg-gray-800 hover:bg-gray-700 rounded-full p-2"
                title="Display settings"
              >
                <Settings className="w-6 h-6" />
              </button>
              
              {/* Display settings dropdown */}
              {isDisplayMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Card Size</h3>
                      <div className="flex gap-2">
                        {(['small', 'medium', 'large'] as const).map(size => (
                          <button
                            key={size}
                            onClick={() => saveDisplaySettings({...displaySettings, cardSize: size})}
                            className={`px-3 py-1 rounded-md text-sm ${
                              displaySettings.cardSize === size ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Category Layout</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveDisplaySettings({...displaySettings, categoryLayout: 'grid'})}
                          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                            displaySettings.categoryLayout === 'grid' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <LayoutGrid className="w-4 h-4" />
                          Grid
                        </button>
                        <button
                          onClick={() => saveDisplaySettings({...displaySettings, categoryLayout: 'flex'})}
                          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                            displaySettings.categoryLayout === 'flex' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <Folder className="w-4 h-4" />
                          Flex
                        </button>
                        {/* Add new horizontal layout option */}
                        <button
                          onClick={() => saveDisplaySettings({...displaySettings, categoryLayout: 'horizontal'})}
                          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                            displaySettings.categoryLayout === 'horizontal' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                          Scroll
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === 'all' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category.id ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {getAllTags().map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                selectedTags.includes(tag) ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={getCategoryLayoutClass()}>
            {categories.map(category => (
              <Droppable 
                key={category.id} 
                droppableId={category.id}
                direction={displaySettings.categoryLayout === 'horizontal' ? 'horizontal' : 'vertical'}
              >
                {(provided) => (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Folder className="w-5 h-5" />
                      {category.name}
                    </h2>
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={getBookmarksContainerClass()}
                      style={displaySettings.categoryLayout === 'horizontal' ? { minHeight: '100px' } : {}}
                    >
                      {filteredBookmarks
                        .filter(bookmark => bookmark.categoryId === category.id)
                        .map((bookmark, index) => (
                          <Draggable
                            key={bookmark.id}
                            draggableId={bookmark.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
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
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        {/* Add/Edit Bookmark Modal */}
        {(isAddingBookmark || isEditingBookmark) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {isEditingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddingBookmark(false);
                    setIsEditingBookmark(false);
                    setEditingBookmarkId(null);
                    setNewBookmark({
                      title: '',
                      url: '',
                      description: '',
                      imageUrl: '',
                      tags: [],
                      categoryId: 'default'
                    });
                    setCurrentTag('');
                  }}
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
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL"
                    className="flex-1 bg-gray-700 rounded p-2"
                    value={newBookmark.url}
                    onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                  />
                  <button
                    onClick={() => newBookmark.url && fetchOgImage(newBookmark.url)}
                    className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-2"
                    disabled={!newBookmark.url || isLoadingImage}
                  >
                    <Image className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="Custom Image URL (optional)"
                  className="w-full bg-gray-700 rounded p-2"
                  value={newBookmark.imageUrl}
                  onChange={(e) => setNewBookmark({ ...newBookmark, imageUrl: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  className="w-full bg-gray-700 rounded p-2"
                  value={newBookmark.description}
                  onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                />
                
                {/* Replace the old tag input with the new component */}
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
                  {getAllTags().length > 0 && (
                    <div className="mt-2">
                      <label className="block text-sm text-gray-400 mb-1">Select existing tag:</label>
                      <div className="flex flex-wrap gap-2">
                        {getAllTags()
                          .filter(tag => !newBookmark.tags?.includes(tag))
                          .map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                setNewBookmark({
                                  ...newBookmark,
                                  tags: [...(newBookmark.tags || []), tag]
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
                  {newBookmark.tags && newBookmark.tags.length > 0 && (
                    <div className="mt-2">
                      <label className="block text-sm text-gray-400 mb-1">Current tags:</label>
                      <div className="flex flex-wrap gap-2">
                        {newBookmark.tags.map((tag, i) => (
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
                  value={newBookmark.categoryId}
                  onChange={(e) => setNewBookmark({ ...newBookmark, categoryId: e.target.value })}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={isEditingBookmark ? updateBookmark : addBookmark}
                  className="w-full bg-red-600 hover:bg-red-700 rounded p-2 font-semibold"
                >
                  {isEditingBookmark ? 'Update Bookmark' : 'Add Bookmark'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Categories Modal */}
        {isManagingCategories && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Categories</h2>
                <button
                  onClick={() => setIsManagingCategories(false)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Category Name"
                    className="flex-1 bg-gray-700 rounded p-2"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    onClick={addCategory}
                    className="bg-red-600 hover:bg-red-700 rounded px-4 py-2 font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between bg-gray-700 rounded p-2">
                      <span>{category.name}</span>
                      {category.id !== 'default' && (
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;