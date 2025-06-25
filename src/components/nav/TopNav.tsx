// noinspection CheckTagEmptyBody

import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const TopNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <Navbar
      expanded={isOpen}
      bg="light"
      expand="lg"
      collapseOnSelect
      onClick={handleClick}
    >
      <Container fluid>
        <Navbar.Brand>Weight Tracker</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link as={Link} to="/addEntry" title="Add Entry">
              Add Entry
            </Nav.Link>
            <Nav.Link as={Link} to="/allEntries">
              View All Entries
            </Nav.Link>
            <Nav.Link as={Link} to="/chart">
              Charts
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNav;
