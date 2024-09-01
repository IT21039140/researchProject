import React from "react";
import StreamCard from "./StreamCard";
import "./Styles/coursesByStream.css";

// Assuming you have icons saved in a folder called "icons" in your project directory
import bioScienceIcon from "../../icons/biological.png";
import physicalScienceIcon from "../../icons/physical.png";
import artIcon from "../../icons/art.png";
import commerceIcon from "../../icons/commerce.png";
import bioTechIcon from "../../icons/bio-tech.png";
import engineeringIcon from "../../icons/engineeringTech.png";
import { Container } from "react-bootstrap";

const CoursesByStream = () => {
  return (
    <Container className="streams main-content">
      <h2 className="title">Explore Courses by Stream</h2>
      <p className="description">
        Select a stream to explore the relevant courses and navigate to the
        detailed page for more information.
      </p>
      <div className="stream-grid">
        <StreamCard
          title="Biological Science"
          description="Explore courses related to Biological Science."
          color="#e3f2fd"
          link="courses/biological-science"
          icon={bioScienceIcon}
        />
        <StreamCard
          title="Physical Science"
          description="Explore courses related to Physical Science."
          color="#fff3e0"
          link="courses/physical-science"
          icon={physicalScienceIcon}
        />
        <StreamCard
          title="Art"
          description="Explore courses related to Art."
          color="#f3e5f5"
          link="courses/art"
          icon={artIcon}
        />
        <StreamCard
          title="Commerce"
          description="Explore courses related to Commerce."
          color="#e8f5e9"
          link="courses/commerce"
          icon={commerceIcon}
        />
        <StreamCard
          title="Bio Technology"
          description="Explore courses related to Bio Technology."
          color="#ffe0b2"
          link="courses/bio-technology"
          icon={bioTechIcon}
        />
        <StreamCard
          title="Engineering Technology"
          description="Explore courses related to Engineering Technology."
          color="#f1f8e9"
          link="courses/engineering-technology"
          icon={engineeringIcon}
        />
      </div>
    </Container>
  );
};

export default CoursesByStream;
