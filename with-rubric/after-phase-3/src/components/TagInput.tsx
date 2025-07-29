import React, { useState, useEffect } from 'react';

interface TagInputProps {
  value: string;
  onChange: (tags: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInput({ value, onChange, placeholder = "Enter tags separated by commas", suggestions = [] }: TagInputProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState(value);
  const [parsedTags, setParsedTags] = useState<string[]>([]);

  useEffect(() => {
    setInputValue(value);
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setParsedTags(tags);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = parsedTags.filter(tag => tag !== tagToRemove);
    const newValue = newTags.join(', ');
    setInputValue(newValue);
    onChange(newValue);
  };

  const addSuggestion = (suggestion: string) => {
    if (!parsedTags.includes(suggestion)) {
      const newValue = parsedTags.length > 0 
        ? `${value}, ${suggestion}` 
        : suggestion;
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      
      {/* Display parsed tags as pills */}
      {parsedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {parsedTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Show suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Suggestions:</span>
          {suggestions
            .filter(suggestion => !parsedTags.includes(suggestion))
            .slice(0, 5)
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSuggestion(suggestion)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                + {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
} 