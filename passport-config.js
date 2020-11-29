const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {

    // email is actually the usernameField
    // done will be called once the authentication is complete
    const authenticateUser = async (email, password, done) => {

        // returns the user by email
        const user = getUserByEmail(email);

        // if user is null, this if-statement will return an express-flash messsage 
        // that there is no user with that email 
        if (user == null) {

            // null means there is no error
            // false means no user is found
            // finally, the message
            return done(null, false, { message: 'No user with that email' });
        }

        try {

            // compares pasword with user.password
            if (await bcrypt.compare(password, user.password)) {

                // no error and pass the user
                return done(null, user)
            } else {

                // null means no error, false means no user, 
                return done(null, false, { message: 'Password incorrect' })
            }
        } catch (e) {
            return done(e)
        }

    }

    // Sets the usernameField as email because by default it's username
    // Password is also passed but there is no need to indicate it here because the default is password
    // authenticateUser function is passed to authenticate the user
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    // null is for error
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    });
};

module.exports = initialize;