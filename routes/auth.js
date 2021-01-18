const express = require('express');

const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', [
    check('email')
    .isEmail()
    .withMessage('Enter a valid E-mail.')
    .normalizeEmail()
    .custom((value, { req }) => {
        User.findOne({ email: value })
            .then(user => {
                if (!user) {
                    return Promise.reject('Invalid email  or password');
                }
            })
    }),
    body('password')
    .isLength({ min: 5, max: 24 })
    .withMessage('password should at least 8 Characters')
    .trim()
], authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup', [
    check('email')
    .isEmail()
    .withMessage('Please Enter a valid email.')
    .normalizeEmail(),
    body('password')
    .isLength({ min: 5, max: 24 })
    .withMessage('Please enter a password with at least 8 charatres')
    .isAlphanumeric()
    .trim(),
    body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password have to match!');
        }
        return true;
    })
], authController.postSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;