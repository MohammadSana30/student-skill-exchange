import exp from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {UserModel} from "../models/userModel.js";
import {verifyToken} from "../middleware/authMiddleware.js";

export const userRouter = exp.Router();


// ================= REGISTER =================

userRouter.post('/register', async (req, res, next) => {

    try {

        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (name.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const existingUser = await UserModel.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {

        next(err);

    }

});


// ================= LOGIN =================

userRouter.post('/login', async (req, res, next) => {

    try {

        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await UserModel.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {

        next(err);

    }

});


// ================= LOGOUT =================

userRouter.post('/logout', (req, res) => {

    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });

});


// ================= GET MY PROFILE =================

userRouter.get('/profile', verifyToken, async (req, res, next) => {

    try {

        const user = await UserModel.findById(req.user.userId)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (err) {

        next(err);

    }

});


// ================= UPDATE MY PROFILE =================

userRouter.put('/profile', verifyToken, async (req, res, next) => {

    try {

        const {name, email} = req.body;

        if (!name && !email) {
            return res.status(400).json({
                success: false,
                message: "Name or email is required"
            });
        }

        const user = await UserModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) {
            if (name.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name must contain at least 2 characters"
                });
            }

            user.name = name;
        }

        if (email) {

            const existingUser = await UserModel.findOne({
                email: email.toLowerCase(),
                _id: {$ne: req.user.userId}
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists"
                });
            }

            user.email = email.toLowerCase();
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {

        next(err);

    }

});


// ================= CHANGE PASSWORD =================

userRouter.put('/change-password', verifyToken, async (req, res, next) => {

    try {

        const {oldPassword, newPassword} = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 6 characters"
            });
        }

        const user = await UserModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const passwordMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {

        next(err);

    }

});