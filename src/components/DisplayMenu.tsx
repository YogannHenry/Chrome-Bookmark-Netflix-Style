
import React from 'react';
import { Folder, LayoutGrid } from 'lucide-react';
import { DisplaySettings } from '../types';

interface DisplayMenuProps {
  displaySettings: DisplaySettings;
  onSaveDisplaySettings: (settings: DisplaySettings) => void;
  displayMenuRef: React.RefObject<HTMLDivElement>;
}

const DisplayMenu: React.FC<DisplayMenuProps> = ({
  displaySettings,
  onSaveDisplaySettings,
  displayMenuRef
}) => {
  return (
    <div 
      ref={displayMenuRef}
      className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Card Size</h3>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => onSaveDisplaySettings({...displaySettings, cardSize: size})}
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
              onClick={() => onSaveDisplaySettings({...displaySettings, categoryLayout: 'grid'})}
              className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                displaySettings.categoryLayout === 'grid' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => onSaveDisplaySettings({...displaySettings, categoryLayout: 'flex'})}
              className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                displaySettings.categoryLayout === 'flex' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Folder className="w-4 h-4" />
              Flex
            </button>
            <button
              onClick={() => onSaveDisplaySettings({...displaySettings, categoryLayout: 'horizontal'})}
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
  );
};

export default DisplayMenu;