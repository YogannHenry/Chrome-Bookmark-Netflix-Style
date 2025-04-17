
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Folder } from 'lucide-react';
import BookmarkCard from './BookmarkCard';
import { BookmarkItem, Category, DisplaySettings } from '../types';

interface BookmarkListProps {
  bookmarks: BookmarkItem[];
  categories: Category[];
  displaySettings: DisplaySettings;
  hiddenCategories: string[];
  selectedCategory: string;
  editBookmark: (bookmark: BookmarkItem) => void;
  deleteBookmark: (id: string) => void;
  openBookmark: (url: string) => void;
  handleDragEnd: (result: any) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  categories,
  displaySettings,
  hiddenCategories,
  selectedCategory,
  editBookmark,
  deleteBookmark,
  openBookmark,
  handleDragEnd
}) => {
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
  
  const getBookmarksContainerClass = () => {
    return displaySettings.categoryLayout === 'horizontal'
      ? 'flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900'
      : 'space-y-4';
  };

  // Determine which categories to display
  const categoriesToDisplay = categories
    .filter(category => !hiddenCategories.includes(category.id))
    .filter(category => selectedCategory === 'all' || category.id === selectedCategory);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={getCategoryLayoutClass()}>
        {categoriesToDisplay.map(category => (
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
                  {bookmarks
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
                          >
                            <BookmarkCard 
                              bookmark={bookmark} 
                              editBookmark={editBookmark}
                              deleteBookmark={deleteBookmark}
                              openBookmark={openBookmark}
                              displaySettings={displaySettings}
                            />
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
  );
};

export default BookmarkList;