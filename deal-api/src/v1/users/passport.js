const dotenv = require('dotenv');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const { findByUsername } = require('./controller');

const util = require('util')
console.log("Before config: " + util.inspect(process.env));
dotenv.config();
console.log("After config: " + util.inspect(process.env));

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
  timezone: user.timezone,
  _id: user._id, // eslint-disable-line no-underscore-dangle
});

module.exports = (passport) => {
  passport.use(new JwtStrategy(options, ((jwtPayload, done) => {
    findByUsername(jwtPayload.username, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, sanitize(user));
      }
      return done(null, false);
    });
  })));
};
