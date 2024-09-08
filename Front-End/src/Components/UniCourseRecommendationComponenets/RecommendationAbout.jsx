import { useRef } from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import "./Styles/about.css"; // Import custom CSS
import vedio from "../../img/intro.mp4";
import girl from "../../icons/girl.png";

const AboutUs = () => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Container
      className=" about-us-section main-content"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Row className="g-5 align-items-center">
        <Col lg={6} className="about-text wow fadeInUp" data-wow-delay="0.1s">
          <h1 className="about-title mb-4">About Us</h1>
          <p className="about-description">
            Our Personalized University Course recommendation System transforms
            how students choose their courses by using advanced Graph Neural
            Networks (GNN). We provide tailored recommendations based on each
            student's preferences, academic history, and career goals, ensuring
            a more personalized and effective educational experience.
          </p>
          <p className="about-details mb-4">
            Discover how our personalized approach can enhance your academic
            journey and set you up for success. We make higher education more
            accessible and aligned with your goals, helping you make informed
            decisions for academic and professional success.
          </p>
          <Row className="g-4 align-items-center about-buttons">
            <Col sm={6}>
              <Button variant="primary" className="rounded-pill py-3 px-5">
                Read More
              </Button>
            </Col>
            <Col sm={6}>
              <div className="d-flex align-items-center about-ceo">
                <Image
                  src={girl}
                  roundedCircle
                  style={{ width: "45px", height: "45px" }}
                />
                <div className="ms-3">
                  <h6 className="text-primary mb-1">Kavindya Udunuwara</h6>
                  <small>Developer</small>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          lg={6}
          className="about-img-container wow fadeInUp"
          data-wow-delay="0.5s"
        >
          <Row>
            <Col xs={12} className="text-center mt-4">
              <video
                ref={videoRef}
                controls
                width="100%"
                className="about-video"
              >
                <source src={vedio} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutUs;
