import { Carousel, Button } from "react-bootstrap";
import "./Styles/carousel.css";

const UniCarosal = () => {
  return (
    <div className="uni-carousel-container">
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1920x1080"
            alt="First slide"
          />
          <Carousel.Caption>
            <h3>Tailored Recommendations Just for You</h3>
            <p>
              Discover courses that match your interests, academic background,
              and career goals with our advanced recommendation system.
            </p>
            <Button variant="primary" href="#get-started" >
              Get Started
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1920x1080"
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3>Personalized Course Matching</h3>
            <p>
              Our system uses cutting-edge Graph Neural Networks to align
              courses with your unique preferences and goals.
            </p>
            <Button variant="primary" href="#get-started">
              Get Started
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1920x1080"
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3>Unlock Your Academic Potential</h3>
            <p>
              Receive tailored course suggestions that enhance your learning
              experience and support your academic journey.
            </p>
            <Button variant="primary" href="#get-started">
              Get Started
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default UniCarosal;
