import React from 'react';
import { Container } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Container className='text-center'>
      <h1 className='display-1'>404</h1>
      <p className='lead'>Page Not Found</p>
    </Container>
  );
};

export default NotFound;
