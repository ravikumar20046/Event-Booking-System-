import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import EventForm from './pages/EventForm';
import NotFound from './pages/NotFound';
import authService from './services/authService';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getUser();
        setUser(currentUser);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
        <AppNavbar user={user} setUser={setUser} />
        <div className='container mt-4'>
          <Routes>
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login setUser={setUser} />} />
            <Route path='/' element={<Navigate to={'/dashboard'} />} />
            <Route
              path='/dashboard'
              element={
                <PrivateRoute user={user}>
                  {user && user.role === 'ADMIN' ? (
                    <AdminDashboard />
                  ) : (
                    <UserDashboard />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path='/admin/events/new'
              element={
                <AdminRoute user={user}>
                  <EventForm />
                </AdminRoute>
              }
            />
            <Route
              path='/admin/events/edit/:id'
              element={
                <AdminRoute user={user}>
                  <EventForm />
                </AdminRoute>
              }
            />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;