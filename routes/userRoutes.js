import express from 'express';
import { deleteUser, getAllUsers, getMe, loginUser, logoutUser, registerUser } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.route("/create").post(registerUser);

router.route("/login").post(loginUser);

router.route("/delete/:id").delete(deleteUser);

router.route('/all').get(getAllUsers);

router.route('/logout').get(logoutUser);

router.route('/me').get(isAuthenticated, getMe);


export default router;