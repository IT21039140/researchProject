import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const PopupChart = ({ isOpen, closePopup, scores }) => {
  if (!isOpen) return null;

  // Radar chart data
  const radarData = {
    labels: [
      "Area Score",
      "Location Score",
      "Duration Score",
      "Career Score",
      "Stream Score",
    ],
    datasets: [
      {
        label: "Course Score",
        data: [
          scores.areaScore,
          scores.locationScore,
          scores.durationScore,
          scores.careerScore,
          scores.streamScore,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="popup-overlay">
      <div className="popup-alert">
        <h2>Course Matching Scores</h2>
        <Radar data={radarData} options={radarOptions} />
        <button className="close-button" onClick={closePopup}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PopupChart;
