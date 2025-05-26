import jwt from "jsonwebtoken";
// import { config } from "dotenv";

// config({
//     path: "../config/config.env",
// })

// You should ideally use process.env.JWT_SECRET in production
// const jwtSecret = process.env.JWT_SECRET;
const jwtSecret = "dafajdajdfkljalkfj3u483483ajadlkjdafjadl";
const jwtExpire = "7d"; // Token expiry duration

export const sendToken = (res, user, message, statusCode) => {
    // console.log({ user, message, statusCode })
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpire });
    console.log({ token });

    // Set the token in HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only send over HTTPS in production
        sameSite: "strict", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response with token and user details
    res.status(statusCode).json({
        success: true,
        message,
        token, // also returning in response body, optional
        user,
    });
};
