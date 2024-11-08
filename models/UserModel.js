// UserModel.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const { ADMIN_ROLE, USER_ROLE, SUBADMIN_ROLE } = require('../Constants/user.constants');

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
        public_id: { type: String, default: null },
        url: { type: String, default: null },
    },
    role: {
        type: String,
        // enum: [ADMIN_ROLE, USER_ROLE, SUBADMIN_ROLE],
        default: "user",
    },
    createdAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    otp: { type: Number, default: null },
    otpExpiry: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
});

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Generate JWT token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
