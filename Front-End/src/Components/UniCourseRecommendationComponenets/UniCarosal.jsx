import { Carousel, Button } from "react-bootstrap";
import "./Styles/carousel.css";
import pic1 from "../../img/pic1.jpg";
import pic4 from "../../img/pic4.jpg";
import pic5 from "../../img/pic2.jpg";

const UniCarosal = ({ toggleChat }) => {
  return (
    <div className="uni-carousel-container">
      <Carousel>
        <Carousel.Item>
          <img className="d-block w-100" src={pic1} alt="First slide" />
          <Carousel.Caption>
            <h3>Tailored Recommendations Just for You</h3>
            <p>
              Discover courses that match your interests, academic background,
              and career goals with our advanced recommendation system.
            </p>
            <Button variant="primary" onClick={toggleChat}>
              Get Started
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100" src={pic4} alt="Second slide" />
          <Carousel.Caption>
            <h3>Personalized Course Matching</h3>
            <p>
              Our system uses cutting-edge Graph Neural Networks to align
              courses with your unique preferences and goals.
            </p>
            <Button variant="primary"  onClick={toggleChat}>
              Get Started
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100" src={pic5} alt="Third slide" />
          <Carousel.Caption>
            <h3>Unlock Your Academic Potential</h3>
            <p>
              Receive tailored course suggestions that enhance your learning
              experience and support your academic journey.
            </p>
            <Button variant="primary"  onClick={toggleChat}>
              Get Started
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default UniCarosal;
