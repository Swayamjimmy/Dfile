const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const {isAuthenticated} = require('../middleware/authMiddleware');

router.get('/register',authController.renderRegisterPage);

router.post('/register', authController.registerUser);

router.get('/login', authController.renderLoginPage);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/logout', authController.logoutUser);

module.exports = router;