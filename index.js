const express = require('express');
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./src/db');

const initializePassport = require('./src/middleware/passport-config');
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const publicRoutes = require('./src/routes/publicRoutes');

initializePassport(passport);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views','src/views');

app.use(express.static('src/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(flash());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore( prisma, {
            checkPeriod: 2*60*1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
    res.locals.user = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', publicRoutes);

app.get('/' , (req, res) => {
    res.render('index');
});

app.listen(PORT, ()=> {
    console.log('Server is running at http://localhost:${PORT}');
});