import React, { useState } from 'react';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';

// Custom arrayMove function
function arrayMove(array, fromIndex, toIndex) {
  const item = array[fromIndex];
  const newArray = array.slice(); // Create a copy of the array
  newArray.splice(fromIndex, 1); // Remove the item from the original position
  newArray.splice(toIndex, 0, item); // Insert the item into the new position
  return newArray;
}

// Drag handle component
const DragHandle = sortableHandle(() => (
  <span style={{ cursor: 'grab', marginRight: '8px' }}>::</span>
));

// Sortable item component
const SortableItem = sortableElement(({ value }) => (
  <li style={{
    padding: '8px',
    margin: '4px 0',
    background: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
  }}>
    <DragHandle />
    {value}
  </li>
));

// Sortable container component
const SortableList = sortableContainer(({ children }) => (
  <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
    {children}
  </ul>
));

const SortableListComponent = () => {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6']);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems((prevItems) => arrayMove(prevItems, oldIndex, newIndex));
  };

  return (
    <div>
      <h2>Sortable List</h2>
      <SortableList onSortEnd={onSortEnd} useDragHandle>
        {items.map((value, index) => (
          <SortableItem key={`item-${index}`} index={index} value={value} />
        ))}
      </SortableList>
      <div style={{ marginTop: '20px' }}>
        <h3>Sorted Items:</h3>
        <ul>
          {items.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SortableListComponent;
