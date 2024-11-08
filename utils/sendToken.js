const sendToken = (user, statusCode, res, req, message) => {
    // Generate JWT token
    const token = user.getJWTToken();

    // Set options for the cookie
    const options = {
        httpOnly: true, // Restrict access to the cookie from JavaScript
        expires: new Date(
            Date.now() + (process.env.COOKIE_EXPIRES_TIME || 1) * 24 * 60 * 60 * 1000 // Default expiry of 1 day if not set
        ),
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (ensure HTTPS)
        sameSite: 'none',
    };
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    // Send the token in a cookie
    res.status(statusCode)
        .cookie('token', token, options) // Set the cookie
        .json({
            success: true,
            message: message || "",
            user: userWithoutPassword,
            token,
        });
};

module.exports = sendToken;
