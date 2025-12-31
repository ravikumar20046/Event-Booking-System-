import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import authService from '../services/authService';

const AppNavbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <Navbar bg='dark' variant='dark' expand='lg'>
      <Container>
        <Navbar.Brand as={Link} to='/'>Event Booking</Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ms-auto'>
            {user ? (
              <>
                <Nav.Link as={Link} to={'/dashboard'}>
                  {user.role === 'ADMIN' ? 'Admin Dashboard' : 'User Dashboard'}
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to='/register'>Register</Nav.Link>
                <Nav.Link as={Link} to='/login'>Login</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
