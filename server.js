// USE THE WES BOS TUTORIAL ON GENERATING AN ID

// will load all environment variables and save it to process.env
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const users = [];
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

// Setting up the view engine for this app
app.set('view-engine', 'ejs');

//gets information from forms using req method instead of res method
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({

    //secret will keep the key that will encrypt all information
    secret: process.env.SESSION_SECRET,

    // asks if resave session variables if nothing is changed
    resave: false,

    // save an empty value in the session if there is no value
    saveUninitialized: false

}));

app.use(passport.initialize());

// stores the variables to persisted across the entire session of the user
app.use(passport.session());
app.use(methodOverride('_method'));

// Home Page
app.get('/', checkAuthenticated, (req, res) => {

    // The name of the user is being passed to index.ejs
    res.render('index.ejs', { name: req.user.name })
})

//Login Page
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
});

//Route for handling the login form
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: './',
    failureRedirect: '/login',
    // will load the error messages from express-flash
    failureFlash: true,
}));

//Register Page
app.get('/register', checkNotAuthenticated, async (req, res) => {
    res.render('register.ejs')
});

//Route for handling the register form
//Make sure to use async in order to use try-catch
app.post('/register', checkNotAuthenticated, async (req, res) => {

    try {

        //hashes the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        //pushes the new object inside the users array
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        // If successful, redirect the user to the Login Page
        res.redirect('/login');

    } catch {

        // If not, redirect to the Register Page
        res.redirect('/register');
    }

});

//Route that will handle the logout action
app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

// Middleware function that will check if the user is authenticated
function checkAuthenticated(req, res, next) {

    // will return true if the user is authenticated
    if (req.isAuthenticated()) {
        return next();
    }

    // if not, redirect the user to Login Page
    res.redirect('/login');
};

// Middleware function that will check if the user is NOT authenticated
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
};

app.listen(3000);