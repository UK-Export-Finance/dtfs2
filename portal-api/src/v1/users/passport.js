const dotenv = require('dotenv');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const { findByUsername } = require('./controller');

dotenv.config();

const PUB_KEY = Buffer.from(process.env.JWT_VALIDATING_KEY, 'base64').toString('ascii');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

const sanitize = (user) => ({
  username: user.username,
  roles: user.roles,
  bank: user.bank,
  lastLogin: user.lastLogin,
  firstname: user.firstname,
  surname: user.surname,
  email: user.email,
  timezone: user.timezone,
  'user-status': user['user-status'],
  _id: user._id,
});

module.exports = (passport) => {
  passport.use(new JwtStrategy(options, ((jwtPayload, done) => {
    findByUsername(jwtPayload.username, (err, user) => {
      if (err) {
        return done(err, false);
      }

      if (user && user.sessionIdentifier === jwtPayload.sessionIdentifier) {
        return done(null, sanitize(user));
      }
      return done(null, false);
    });
  })));
};
