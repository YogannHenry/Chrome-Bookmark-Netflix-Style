
import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) => {
  return (
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
         