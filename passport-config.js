const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email);

    // console.log("baba")
    // console.log(user);


    if (user == null) {
      console.log("No user with that email");
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      // console.log(user.password)
      // console.log(password)
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        return done(null, user);
      } else {
        console.log("Password incorrect");
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      console.error("Error comparing passwords:", e);
      return done(e);
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initialize;
