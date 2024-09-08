import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useEffect, useState } from "react";

const SortableListComponent = ({
  stream,
  displayArea,
  displayLocations,
  onSortUpdate,
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
      "Information Technology & Management",
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
    "Arts Stream": [
      "Arts & Humanities",
      "Law",
      "Education",
      "Information Technology & Management",
      "Architecture & Design",
      "Science & Technology",
      "Geographical & Environmental Sciences",
      "Hospitality & Tourism",
      "Business & Management",
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

  const handleDoneClick = () => {
    if (onSortUpdate) {
      onSortUpdate(items); // Send the final sorted list to the parent component
    }
  };

  return (
    <div>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        style={{ padding: 0, margin: 0 }}
      >
        {items.map((value) => (
          <Reorder.Item
            key={value}
            value={value}
            whileDrag={{ scale: 1.05 }}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: "8px",
              margin: "4px 0",
              background: "#f9f9f9",
              border: "1px solid #ddd",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              cursor: "grab",
            }}
          >
            {value}
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <div className="profile-buttons">
        <button
          className="submit-button"
          onClick={handleDoneClick}
          style={{ marginTop: "16px" }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SortableListComponent;
