"use client"

import { useState, ChangeEvent } from 'react';

const UserSearch = ({ allTags, onTagsChange }: { allTags: string[]; onTagsChange: (tags: string[]) => void }) => {  // Accepting allTags and onTagsChange as props
  const [tagInput, setTagInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, tags: string[]): void => {
    const value = e.target.value.toLowerCase();
    setTagInput(value);

    const filtered = tags.filter(tag => tag.toLowerCase().startsWith(value) && !selectedTags.includes(tag));
    setFilteredTags(filtered);
  };

  const addTag = (tag: string): void => {
    if (!selectedTags.includes(tag)) {
      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      setTagInput('');
      setFilteredTags([]); 
      onTagsChange(newSelectedTags); 
    }
  };

  const updateTagList = (): JSX.Element[] => {
    return selectedTags.map((tag, index) => (
      <span key={index} className="tag">
        {tag}
      </span>
    ));
  };

  return (
    <div className="tag-input-container">
      <input
        type="text"
        value={tagInput}
        onChange={(e) => handleInputChange(e, allTags)} 
        placeholder="Type to filter tags..."
        className="tag-input"
      />
      <div id="tagList" className="tag-list">{updateTagList()}</div>

      {filteredTags.length > 0 && (
        <ul id="dropdown" className="dropdown">
          {filteredTags.map((tag, index) => (
            <li key={index} onClick={() => addTag(tag)}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;