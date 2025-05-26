import jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/errorHandler.js';
import { catchAsyncError } from './catchAsyncError.js';
import connection from '../config/database.js'; // MySQL connection

// Middleware to check if the user is authenticated
export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  // console.log({ token });

  if (!token) {
    return next(new ErrorHandler('Login First To Access This Resource', 401));
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  // console.log({ userId })

  // Query user from MySQL database
  connection.query(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) {
        return next(new ErrorHandler('Database error while verifying user', 500));
      }

      if (results.length === 0) {
        return next(new ErrorHandler('User not found', 404));
      }

      req.user = results[0]; // attach user to req object
      next();
    }
  );
});

// Middleware to restrict access to admins only
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`, 403));
  }

  next();
};
