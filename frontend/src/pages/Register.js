import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'USER',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { name, email, password, password2, role } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
    } else {
      try {
        await authService.register({ name, email, password, role });
        navigate('/login');
      } catch (err) {
        setError(err.response.data.msg || 'Registration failed');
      }
    }
  };

  return (
    <Container>
      <h1 className='my-4'>Register</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter name'
            name='name'
            value={name}
            onChange={onChange}
            required
          />
        </Form.Group>

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

        <Form.Group className='mb-3'>
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Confirm password'
            name='password2'
            value={password2}
            onChange={onChange}
            required
            minLength='6'
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Role</Form.Label>
          <Form.Select name='role' value={role} onChange={onChange}>
            <option value='USER'>User</option>
            <option value='ADMIN'>Admin</option>
          </Form.Select>
        </Form.Group>

        <Button variant='primary' type='submit'>
          Register
        </Button>
      </Form>
      <p className='mt-3'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </Container>
  );
};

export default Register;
