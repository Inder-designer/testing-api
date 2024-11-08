// In userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:
 *                 type: object
 *                 properties: 
 *                      public_id:
 *                          type: string
 *                          example: "password123"
 *                      url:
 *                          type: string
 *                          example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Log out a user (clear cookie)
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Send password reset JWT token to user's email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent to email
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/reset-password/{resetToken}:
 *   post:
 *     summary: Reset the user's password using the token
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         description: The reset token sent to the user's email
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/verify-user:
 *   post:
 *     summary: Verify a user's account with OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *               otp:
 *                 type: integer
 *                 description: The OTP sent to the user's email
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/resend-otp:
 *   post:
 *     summary: Resend OTP to the user's email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: [] # Specifies that a token is required
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized or token missing/invalid
 */


/**
 * @swagger
 * /api/users/password/update:
 *   put:
 *     summary: Change user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: [] # Specifies that a token is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user's currentPassword
 *               newPassword:
 *                 type: string
 *                 description: The user's New Password
 *     responses:
 *       200:
 *         description: Password update successfully
 *       404:
 *         description: Current password not match
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/me/update:
 *   put:
 *     summary: Update user profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: [] # Specifies that a token is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *               avatar:
 *                 type: object
 *                 properties: 
 *                      public_id:
 *                          type: string
 *                          example: "password123"
 *                      url:
 *                          type: string
 *                          example: "password123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile updated Fail
 *       500:
 *         description: Server error
 */

router.post('/register', userController.register);
router.route('/login').post(userController.login);
router.post('/logout', userController.logout);  // Logout route
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:resetToken', userController.resetPassword);
router.post('/verify-user', userController.verifyUser); // Route to verify OTP
router.post('/resend-otp', userController.resendOtp);
router.route('/profile').get(isAuthenticated, userController.getUser);
router.route('/password/update').put(isAuthenticated, userController.changePassword);
router.route("/me/update").put(isAuthenticated, userController.updateProfile);

module.exports = router;
