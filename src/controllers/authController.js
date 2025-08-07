const prisma = require('../db');
const bcrypt = require('bcrypt');

const renderRegisterPage = (req,res) => {
    res.render('register');
};

const registerUser = async (req, res) => {
    try {
        const {email, password, confirm_password} = req.body;

        if (password !== confirm_password){
            req.flash('error_msg', 'Passwords do not match.');
            return res.redirect('/register');
        }

        const existingUser = await prisma.user.findUnique({ where: {email}});
        if(existingUser){
            req.flash('error_msg', 'Email is already registered.');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password,10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        req.flash('success_msg', 'You are now registered and can log in.');
        res.redirect('/login');
    } catch (error){
        console.error(error);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/register');
    }
};

const renderLoginPage = (req, res) => {
    res.render('login');
};

const logoutUser = (req,res,next) => {
    req.logout((err) => {
        if(err) { return next(err);}
        req.flash('success_msg', 'You are logged out.');
        res.redirect('/login');
    });
};

module.exports = {
    renderRegisterPage,
    registerUser,
    renderLoginPage,
    logoutUser,
};