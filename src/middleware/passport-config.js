const passport = require('passport');
const prisma = require('../db');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport){
    const authenticateUser = async (email, password, done) => {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            return done(null, false, {message: 'No user with that email'});
        }
        try {
            if (await bcrypt.compare(password, user.password)){
                return done(null,user);
            } else {
                return done(null, false, {message: 'Password incorrect.'});
        }
    } catch(e){
        return done(e);
    }

};

passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));

passport.serializeUser((user,done) => done(null,user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({where: {id:id}});
        done(null,user);
    } catch(e){
        done(e);
    }
});

}

module.exports = initialize;