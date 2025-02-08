"use client"

import { useState, ChangeEvent, useEffect } from 'react';

const UserSearch = ({ allTags, onTagsChange, initialTags = [] }: { allTags: string[]; onTagsChange: (tags: string[]) => void; initialTags?: string[] }) => {
  console.log('UserSearch rendered with:', { allTags, initialTags });
  const [tagInput, setTagInput] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  // Keep filteredTags updated when allTags changes
  useEffect(() => {
    if (tagInput) {
      const value = tagInput.toLowerCase();
      const filtered = allTags.filter(tag =>
        tag.toLowerCase().includes(value) && !selectedTags.includes(tag)
      );
      setFilteredTags(filtered.slice(0, 5));
    }
  }, [allTags, selectedTags, tagInput]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.toLowerCase();
    setTagInput(value);

    if (!value) {
      setFilteredTags([]);
      return;
    }

    const filtered = allTags.filter(tag =>
      tag.toLowerCase().includes(value) && !selectedTags.includes(tag)
    );
    setFilteredTags(filtered.slice(0, 5));
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

  const removeTag = (tagToRemove: string): void => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
  };

  const getTagColor = (index: number): string => {
    const colors = ['blue', 'deepskyblue', 'royalblue', 'teal'];
    return colors[index % colors.length];
  };

  const getTagMarkup = (tag: string, index: number): JSX.Element => {
    const color = getTagColor(index);
    switch (color) {
      case 'gray':
        return (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-x-0.5 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            {tag}
            <button type="button" className="group relative -mr-1 size-3.5 rounded-sm hover:bg-gray-500/20" onClick={() => removeTag(tag)}>
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="size-3.5 stroke-gray-700/50 group-hover:stroke-gray-700/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span className="absolute -inset-1" />
            </button>
          </span>
        );
      case 'deepskyblue':
        return (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-x-0.5 rounded-full bg-sky-200 px-2 py-1 text-xs font-medium text-sky-800">
            {tag}
            <button type="button" className="group relative -mr-1 size-3.5 rounded-sm hover:bg-sky-700/20" onClick={() => removeTag(tag)}>
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="size-3.5 stroke-sky-900/50 group-hover:stroke-sky-900/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span className="absolute -inset-1" />
            </button>
          </span>
        );
      case 'blue':
        return (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-x-0.5 rounded-full bg-blue-200 px-2 py-1 text-xs font-medium text-blue-800">
            {tag}
            <button type="button" className="group relative -mr-1 size-3.5 rounded-sm hover:bg-blue-700/20" onClick={() => removeTag(tag)}>
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="size-3.5 stroke-blue-900/50 group-hover:stroke-blue-900/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span className="absolute -inset-1" />
            </button>
          </span>
        );
      case 'teal':
        return (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-x-0.5 rounded-full bg-teal-200 px-2 py-1 text-xs font-medium text-teal-800">
            {tag}
            <button type="button" className="group relative -mr-1 size-3.5 rounded-sm hover:bg-teal-700/20" onClick={() => removeTag(tag)}>
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="size-3.5 stroke-teal-900/50 group-hover:stroke-teal-900/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span className="absolute -inset-1" />
            </button>
          </span>
        );
      case 'royalblue':
        return (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-x-0.5 rounded-full bg-blue-300 px-2 py-1 text-xs font-medium text-blue-900">
            {tag}
            <button type="button" className="group relative -mr-1 size-3.5 rounded-sm hover:bg-blue-800/20" onClick={() => removeTag(tag)}>
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="size-3.5 stroke-blue-950/50 group-hover:stroke-blue-950/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span className="absolute -inset-1" />
            </button>
          </span>
        );
      default:
        return (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-x-0.5 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            {tag}
            <button type="button" className="group relative -mr-1 size-3.5 rounded-sm hover:bg-gray-500/20" onClick={() => removeTag(tag)}>
              <span className="sr-only">Remove</span>
              <svg viewBox="0 0 14 14" className="size-3.5 stroke-gray-700/50 group-hover:stroke-gray-700/75">
                <path d="M4 4l6 6m0-6l-6 6" />
              </svg>
              <span className="absolute -inset-1" />
            </button>
          </span>
        );
    }
  };

  const updateTagList = (): JSX.Element[] => {
    return selectedTags.map((tag, index) => getTagMarkup(tag, index));
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full">
        <input
          type="text"
          value={tagInput}
          onChange={handleInputChange}
          placeholder="Type to search teammates..."
          className="w-full rounded-md border-0 py-1.5 px-2.5 text-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600"
        />
        {filteredTags.length > 0 && (
          <ul id="dropdown" className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredTags.map((tag, index) => (
              <li
                key={index}
                onClick={() => addTag(tag)}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-teal-600 hover:text-white"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div id="tagList" className="flex flex-wrap gap-2">
        {updateTagList()}
      </div>
    </div>
  );
};

export default UserSearch;