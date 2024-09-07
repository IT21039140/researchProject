import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import { useLocation, Link } from "react-router-dom";
import "./Styles/NavigationBar.css";

const NavigationBar = () => {
  const location = useLocation();

  // Determine the active link based on the current path
  const getNavLinkClass = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <header className="kider-header">
      <Navbar expand="lg" bg="light" className="navbar">
        <Navbar.Brand as={Link} to="/">Navbar</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNavDropdown" />
        <Navbar.Collapse id="navbarNavDropdown">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/Home"
              className={getNavLinkClass("/Home")}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/recommendation"
              className={getNavLinkClass("/recommendation")}
            >
              Uni Recommendation
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/career-guidance"
              className={getNavLinkClass("/career-guidance")}
            >
              Career Guidance
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/quiz-generator"
              className={getNavLinkClass("/quiz-generator")}
            >
              Quiz Generator
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/scholarship-bot"
              className={getNavLinkClass("/scholarship-bot")}
            >
              Scholarship Bot
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/Dashboard"
              className={getNavLinkClass("/Dashboard")}
            >
              Dashboard
            </Nav.Link>
          </Nav>
          <form className="d-flex ms-auto">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <Button variant="outline-success" type="submit">
              Search
            </Button>
          </form>
          <Button className="ms-3" variant="primary" as={Link} to="/login">Login</Button>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default NavigationBar;
