const dotenv = require('dotenv');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const fs = require('fs');

const { findOne } = require('./controller');

dotenv.config();

const pathToKey = process.env.JWT_VALIDATING_CERT;
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

const sanitize = (user) => ({
  username: user.username,
  roles: user.roles,
  bank: user.bank,
  _id: user._id, // eslint-disable-line no-underscore-dangle
});

module.exports = (passport) => {
  passport.use(new JwtStrategy(options, ((jwtPayload, done) => {
    findOne(jwtPayload.username, (err, user) => {
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
