
import React, { useState } from 'react';
import { Category } from '../types';
import { X } from 'lucide-react';

interface CategoryModalProps {
  categories: Category[];
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  categoryModalRef: React.RefObject<HTMLDivElement>;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  categories,
  onClose,
  onAddCategory,
  onDeleteCategory,
  categoryModalRef
}) => {
  const [newCategory, setNewCategory] = useState('');
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    onAddCategory(newCategory);
    setNewCategory('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div 
        ref={categoryModalRef}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Categories</h2>
          <button
            onClick={onClose}
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
              onClick={handleAddCategory}
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
                    onClick={() => onDeleteCategory(category.id)}
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
  );
};

export default CategoryModal;