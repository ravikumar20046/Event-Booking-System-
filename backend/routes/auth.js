import { Router } from 'express';
const router = Router();
import { register, login, getAuthUser } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET api/auth/user
// @desc    Get user by token
// @access  Private
router.get('/user', auth, getAuthUser);

export default router;
