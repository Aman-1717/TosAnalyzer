import React from 'react';

/**
 * HighlightedText Component
 * Renders text with search term highlighting
 */
const HighlightedText = ({ text, searchTerm, className = '' }) => {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark
              key={index}
              className="bg-yellow-300 text-black px-1 rounded font-medium"
              style={{ backgroundColor: '#fef08a', color: '#000' }}
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
};

export default HighlightedText;
