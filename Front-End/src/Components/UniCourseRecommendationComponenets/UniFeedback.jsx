import React, { useState } from "react";
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

  const [testimonials, setTestimonials] = useState([
    {
      name: "Kavindi Perera",
      rating: 5,
      imageSrc: "https://randomuser.me/api/portraits/women/44.jpg", // Sample image
      quote:
        "The personalized university recommendation system helped me find courses that perfectly align with my career goals in IT. It was a game-changer for my decision-making process.",
    },
    {
      name: "Nuwan Jayasinghe",
      rating: 4,
      imageSrc: "https://randomuser.me/api/portraits/men/46.jpg", // Sample image
      quote:
        "Thanks to the recommendation system, I was able to identify the best university courses that matched my interest in engineering and future aspirations.",
    },
    {
      name: "Harini Fernando",
      rating: 5,
      imageSrc: "https://randomuser.me/api/portraits/women/50.jpg", // Sample image
      quote:
        "This system provided a personalized course selection that aligned with my preferences and career goals in business management. It was exactly what I needed.",
    },
    {
      name: "Tharindu Silva",
      rating: 5,
      imageSrc: "https://randomuser.me/api/portraits/men/55.jpg", // Sample image
      quote:
        "I highly recommend this course recommendation system. It helped me choose the right academic path by considering my long-term career goals in computer science.",
    },
    {
      name: "Dinithi Senanayake",
      rating: 4,
      imageSrc: "https://randomuser.me/api/portraits/women/48.jpg", // Sample image
      quote:
        "The recommendations were spot on! The system took into account my career goals and personal preferences, making my university selection much easier.",
    },
  ]);

  const [newFeedback, setNewFeedback] = useState({
    name: "",
    rating: 0,
    quote: "",
    imageSrc: "https://via.placeholder.com/150", // Placeholder for new user images
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback({ ...newFeedback, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTestimonials([...testimonials, newFeedback]); // Add the new feedback to the testimonials array
    setNewFeedback({
      name: "",
      rating: 0,
      quote: "",
      imageSrc: "https://via.placeholder.com/150", // Reset image for new users
    });
  };

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

      {/* Feedback form */}
      <div className="feedback-form mt-5">
        <h2>Submit Your Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={newFeedback.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="rating">Rating:</label>
            <select
              className="form-control"
              id="rating"
              name="rating"
              value={newFeedback.rating}
              onChange={handleInputChange}
              required
            >
              <option value={0}>Select Rating</option>
              {[...Array(5)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group mb-3">
            <label htmlFor="quote">Feedback:</label>
            <textarea
              className="form-control"
              id="quote"
              name="quote"
              rows="3"
              value={newFeedback.quote}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default UniFeedback;
