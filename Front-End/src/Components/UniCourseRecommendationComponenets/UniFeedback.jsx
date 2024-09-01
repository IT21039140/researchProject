import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import Font Awesome
import "./Styles/UniFeedback.css"; // Add or update your CSS here

const UniFeedback = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Display 3 slides at a time
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  const testimonials = [
    {
      name: "Leslie Alexander",
      position: "President of TBP",
      rating: 5,
      imageSrc: "data:image/png;base64,/9j/4AAQSkZJ", // Replace with actual image
      quote:
        "I can't express enough gratitude for the awesome experience I had during my education journey. As a beginner, they supported me as much as possible.",
    },
    {
      name: "Jane Doe",
      position: "CEO of XYZ Corp",
      rating: 4,
      imageSrc: "data:image/png;base64,/9j/4AAQSkZJ", // Replace with actual image
      quote:
        "The program was incredibly helpful and provided great insights into my career path. Highly recommended!",
    },
    {
      name: "John Smith",
      position: "Lead Developer at ABC Inc.",
      rating: 5,
      imageSrc: "data:image/png;base64,/9j/4AAQSkZJ", // Replace with actual image
      quote:
        "Fantastic experience! The support and resources available were top-notch and made a significant impact on my career development.",
    },
  ];

  return (
    <div className="container main-content">
      <div className="testimonial-carousel">
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-card-content bg-light p-4 rounded shadow">
                <div className="testimonial-card-header d-flex align-items-center mb-3">
                  <img
                    className="testimonial-card-image rounded-circle me-3"
                    src={testimonial.imageSrc}
                    alt={testimonial.name}
                  />
                  <div className="testimonial-card-info">
                    <h3 className="mb-0">{testimonial.name}</h3>
                    <span className="text-muted">{testimonial.position}</span>
                  </div>
                </div>
                <div className="testimonial-card-rating mb-2">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fa fa-star ${
                        i < testimonial.rating ? "filled" : "unfilled"
                      }`}
                    ></i>
                  ))}
                  <span>({testimonial.rating})</span>
                </div>
                <p className="testimonial-card-quote mb-0">
                  {testimonial.quote}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default UniFeedback;
