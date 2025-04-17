
import React from 'react';
import { Tag } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, toggleTag }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {tags.map(tag => (
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
  );
};

export default TagFilter;