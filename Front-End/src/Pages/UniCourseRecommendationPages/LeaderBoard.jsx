import React, { useState } from "react";
import { Container, Row, Col, Card, Pagination } from "react-bootstrap";
import "./Styles/Leaderboard.css";

const users = [
  {
    id: 1,
    name: "Josh Rees",
    role: "Executive",
    stars: 3,
    time: "09.45min",
    score: 300,
    img: "https://th.bing.com/th/id/OIP.ntzGohTfvU6Jn50XXxFHBgHaJA?rs=1&pid=ImgDetMain",
  },
  {
    id: 2,
    name: "Josh Rees",
    role: "Executive",
    stars: 1,
    time: "09.55min",
    score: 280,
    img: "https://via.placeholder.com/60",
  },
  {
    id: 3,
    name: "Josh Rees",
    role: "Executive",
    stars: 1,
    time: "10.15min",
    score: 275,
    img: "https://via.placeholder.com/60",
  },
  {
    id: 4,
    name: "Josh Rees",
    role: "Executive",
    stars: 0,
    time: "10.40min",
    score: 260,
    img: "https://via.placeholder.com/60",
  },
  {
    id: 5,
    name: "Josh Rees",
    role: "Executive",
    stars: 0,
    time: "10.45min",
    score: 250,
    img: "https://via.placeholder.com/60",
  },
];

const Leaderboard = () => {
  const [selectedUser, setSelectedUser] = useState(users[0]); // Default first user
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  // Pagination logic
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Container className="mt-5 leaderboard-container">
      <Row>
        <Col xs={12}>
          <h2 className="text-center ">Leaderboard</h2>
        </Col>
      </Row>

      <Row>
        {/* Large Profile Card on the left */}
        <Col md={6}>
          <Card className="profile-card text-center">
            <Card.Body>
              <div className="rank-badge">{`${
                users.findIndex((user) => user.id === selectedUser.id) + 1
              }th Rank`}</div>
              <img
                src={selectedUser.img}
                alt="profile"
                className="profile-img-large"
              />
              <h5 className="mt-3">{selectedUser.name}</h5>
              <p className="user-role">{selectedUser.role}</p>
              <div className="stars">
                {[...Array(3)].map((_, index) => (
                  <span
                    key={index}
                    className={`star ${
                      index < selectedUser.stars ? "filled" : ""
                    }`}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
              <h4 className="score-large">{selectedUser.score}</h4>
              <p className="points">Points</p>
            </Card.Body>
          </Card>
        </Col>

        {/* Leaderboard List */}
        <Col md={6}>
          {currentUsers.map((user, idx) => (
            <Card
              key={user.id}
              className={`leaderboard-item mb-3 ${
                user.id === selectedUser.id ? "selected" : ""
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="rank-circle">
                    {indexOfFirstItem + idx + 1}th
                  </span>
                  <img
                    src={user.img}
                    alt="Profile"
                    className="rounded-circle ms-2 leaderboard-img"
                  />
                  <div className="ms-3">
                    <h6 className="user-name">{user.name}</h6>
                    <p className="role">{user.role}</p>
                    <div className="stars">
                      {[...Array(3)].map((_, index) => (
                        <span
                          key={index}
                          className={`star ${
                            index < user.stars ? "filled" : ""
                          }`}
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="score-section text-end">
                  <h5
                    className={`score ${
                      user.id === 1
                        ? "score-gold"
                        : user.id === 2
                        ? "score-silver"
                        : "score-bronze"
                    }`}
                  >
                    {user.score}
                  </h5>
                  <p className="time">{user.time}</p>
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Pagination */}
          <Pagination className="mt-3 justify-content-center">
            {Array(Math.ceil(users.length / itemsPerPage))
              .fill()
              .map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === activePage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default Leaderboard;
