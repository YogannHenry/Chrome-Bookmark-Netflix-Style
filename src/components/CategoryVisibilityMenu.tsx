
import React from 'react';
import { Category } from '../types';

interface CategoryVisibilityMenuProps {
  categories: Category[];
  hiddenCategories: string[];
  toggleCategoryVisibility: (categoryId: string) =>