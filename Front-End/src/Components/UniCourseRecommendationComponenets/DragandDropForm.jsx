import React, { useState, useEffect } from "react";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";

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
  <span style={{ cursor: "grab", marginRight: "8px" }}>::</span>
));

// Sortable item component
const SortableItem = sortableElement(({ value }) => (
  <li
    style={{
      padding: "8px",
      margin: "4px 0",
      background: "#f9f9f9",
      border: "1px solid #ddd",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
    }}
    className="option-item"
  >
    <DragHandle />
    {value}
  </li>
));

// Sortable container component
const SortableList = sortableContainer(({ children }) => (
  <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>{children}</ul>
));

const SortableListComponent = ({
  stream,
  displayArea,
  displayLocations,
  onSortUpdate, // New prop to send sorted list back to parent
}) => {
  const areaOptions = {
    "Biological Science Stream": [
      "Medicine & Health Care",
      "Environmental Sciences",
      "Information Technology & Management",
      "Architecture & Design",
      "Agricultural Sciences",
      "Science & Technology",
      "Business & Management",
      "Arts & Humanities",
      "Law",
      "Tourism & Hospitality",
    ],
    "Physical Science Stream": [
      "Engineering",
      "Architecture & Design",
      "Statistics & Mathematics",
      "Business & Management",
      "Computer Science & Information Technology",
      "Arts & Humanities",
      "Science & Technology",
      "Geographical & Environmental Sciences",
      "Hospitality & Tourism",
      "Law",
    ],
    "Commerce Stream": [
      "Business & Management",
      "Law",
      "Finance & Economics",
      "Arts & Humanities",
      "Information Technology & Management",
      "Architecture & Design",
      "Science & Technology",
      "Geographical & Environmental Sciences",
      "Hospitality & Tourism",
    ],
    "Engineering Technology Stream": [
      "Information Technology & Management",
      "Engineering Technology",
      "Science & Technology",
      "Arts & Humanities",
      "Law",
      "Education",
      "Architecture & Design",
      "Hospitality & Tourism",
      "Geographical & Environmental Sciences",
      "Business & Management",
    ],
    "Bio Technology Stream": [
      "Biosystems Technology",
      "Science & Technology",
      "Hospitality & Tourism",
      "Geographical & Environmental Sciences",
      "Business & Management",
      "Law",
      "Education",
      "Information Technology & Management",
      "Arts & Humanities",
      "Architecture & Design",
    ],
  };

  const locations = [
    "Sabaragamuwa Province",
    "Central Province",
    "Western Province",
    "North Western Province",
    "North Central Province",
    "Southern Province",
    "Uva Province",
    "Eastern Province",
    "Northern Province",
  ];

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (displayLocations) {
      setItems(locations);
    } else if (displayArea && stream && areaOptions[stream]) {
      setItems(areaOptions[stream]);
    }
  }, [stream, displayArea, displayLocations]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
  };

  const handleDoneClick = () => {
    if (onSortUpdate) {
      onSortUpdate(items); // Send the final sorted list to the parent component
    }
  };

  return (
    <div>
      <SortableList onSortEnd={onSortEnd} useDragHandle>
        {items.map((value, index) => (
          <SortableItem key={`item-${index}`} index={index} value={value} />
        ))}
      </SortableList>
      <button onClick={handleDoneClick} style={{ marginTop: "16px" }}>
        Done
      </button>
    </div>
  );
};

export default SortableListComponent;
