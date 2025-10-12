import React from 'react';

function NewbornCard({ newborn, onSelect }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('newbornId', newborn.id);
    console.log('Card dragged:', newborn.newbornName);
  };

  const handleClick = () => {
    if (onSelect) onSelect(newborn);
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition"
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <h2 className="text-xl font-bold text-blue-600">{newborn.newbornName}</h2>
      <p className="text-gray-500">Birth: {newborn.dateOfBirth}</p>
      <p className="text-gray-500">Address: {newborn.FullAddress}</p>
    </div>
  );
}

export default NewbornCard;
