import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  registerUser,
  authUser,
  getUsers,
  getProfile,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,
  logoutUser
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getUserById);
router.post('/logout', logoutUser);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateUserProfile);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);
  

export default router;