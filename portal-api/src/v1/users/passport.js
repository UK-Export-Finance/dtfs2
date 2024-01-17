const dotenv = require('dotenv');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const { findByUsername } = require('./controller');
const { LOGIN_STATUSES } = require('../../constants');

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

const baseAuthenticationConfiguration = ({
  name,
  passport,
  additionalPayloadValidation,
  additionalUserValidation = null,
  getAdditionalReturnedFields = () => {},
}) => {
  passport.use(
    name,
    new JwtStrategy(options, async (jwtPayload, done) => {
      findByUsername(jwtPayload.username, (error, user) => {
        if (error) {
          console.error("Failed when finding username %s in database during '%s' JWT strategy", jwtPayload.username, name);
          return done(error, false);
        }

        if (additionalUserValidation && additionalUserValidation(user, jwtPayload)) {
          return done(null, false);
        }

        const validation = additionalPayloadValidation
          ? user && user.sessionIdentifier === jwtPayload.sessionIdentifier && additionalPayloadValidation(jwtPayload)
          : user && user.sessionIdentifier === jwtPayload.sessionIdentifier;

        if (validation) {
          const additionalFields = getAdditionalReturnedFields(user);
          return done(null, { ...sanitize(user), ...additionalFields });
        }
        console.error("Failed JWT validation for '%s' strategy", name);
        return done(null, false);
      });
    }),
  );
};

const loginCompleteAuth = (passport, userService) => {
  const name = 'login-complete';
  const additionalPayloadValidation = (jwtPayload) => jwtPayload.loginStatus === LOGIN_STATUSES.VALID_2FA;
  const additionalUserValidation = (user, jwtPayload) => {
    if (userService.isUserBlockedOrDisabled(user)) {
      console.error("User with username %s is blocked or disabled for '%s' strategy", jwtPayload.username, name);
      return true;
    }
    return false;
  };
  baseAuthenticationConfiguration({ name, passport, additionalPayloadValidation, additionalUserValidation });
};

const loginInProcessAuth = (passport) => {
  const additionalPayloadValidation = (jwtPayload) => jwtPayload.loginStatus === LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD;
  const getAdditionalReturnedFields = (user) => ({
    sessionIdentifier: user.sessionIdentifier,
    signInLinkSendDate: user.signInLinkSendDate,
    signInLinkSendCount: user.signInLinkSendCount,
  });
  baseAuthenticationConfiguration({
    name: 'login-in-progress',
    passport,
    additionalPayloadValidation,
    getAdditionalReturnedFields,
  });
};

module.exports = {
  loginCompleteAuth,
  loginInProcessAuth,
};
