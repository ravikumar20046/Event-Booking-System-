import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const response = await authService.login({ email, password });
      const currentUser = await authService.getUser();
      setUser(currentUser);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response.data.msg || 'Login failed');
    }
  };

  return (
    <Container>
      <h1 className='my-4'>Login</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            name='email'
            value={email}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={onChange}
            required
            minLength='6'
          />
        </Form.Group>

        <Button variant='primary' type='submit'>
          Login
        </Button>
      </Form>
      <p className='mt-3'>
        Don't have an account? <Link to='/register'>Sign Up</Link>
      </p>
    </Container>
  );
};

export default Login;
