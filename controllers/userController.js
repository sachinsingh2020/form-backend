import bcrypt from "bcrypt";
import crypto from "crypto";
import connection from "../config/database.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendLoginToken, sendToken } from "../utils/sendToken.js";


// Register User
export const registerUser = catchAsyncError(async (req, res, next) => {
    const { login_id, password, role } = req.body;

    if (!login_id || !password || !role) {
        return next(new ErrorHandler("Please provide login_id, password, and role", 400));
    }

    // Check if user already exists
    connection.query(`SELECT * FROM users WHERE login_id = ?`, [login_id], async (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));
        if (result.length > 0) return next(new ErrorHandler("User already exists", 409));

        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query(
            `INSERT INTO users (login_id, password, role) VALUES (?, ?, ?)`,
            [login_id, hashedPassword, role],
            (err, insertResult) => {
                if (err) return next(new ErrorHandler(err.message, 400));

                connection.query(`SELECT * FROM users WHERE id = ?`, [insertResult.insertId], (err, userResult) => {
                    if (err) return next(new ErrorHandler(err.message, 400));
                    if (userResult.length === 0) return next(new ErrorHandler("User not found after registration", 404));

                    // console.log("working fine until now")
                    sendToken(res, userResult[0], "User registered successfully", 201);
                });
            }
        );
    });
});

// Login User
export const loginUser = catchAsyncError(async (req, res, next) => {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
        return next(new ErrorHandler("Please enter both login_id and password", 400));
    }

    connection.query(`SELECT * FROM users WHERE login_id = ?`, [login_id], async (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));
        if (result.length === 0) return next(new ErrorHandler("Invalid login_id or password", 401));

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return next(new ErrorHandler("Invalid login_id or password", 401));

        sendLoginToken(res, user, "Logged in successfully", 200);
    });
});

// Get Reset Token
export const getResetToken = (user) => {
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    return resetToken;
};

// Delete User
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    if (!id) return next(new ErrorHandler("User ID is required", 400));

    connection.query(`SELECT * FROM users WHERE id = ?`, [id], (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));
        if (result.length === 0) return next(new ErrorHandler("User not found", 404));

        const user = result[0];

        connection.query(`DELETE FROM users WHERE id = ?`, [id], (err, deleteResult) => {
            if (err) return next(new ErrorHandler(err.message, 400));

            res.status(200).json({
                success: true,
                message: `User '${user.login_id}' deleted successfully`,
                deletedUserDetails: user,
            });
        });
    });
});

// Get All Users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    connection.query(`SELECT id, login_id, role FROM users`, (err, result) => {
        if (err) return next(new ErrorHandler(err.message, 400));

        res.status(200).json({
            success: true,
            users: result,
        });
    });
});

// Logout User
export const logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

export const getMe = catchAsyncError(async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

