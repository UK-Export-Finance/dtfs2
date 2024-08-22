const dotenv = require('dotenv');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const { findByUsername } = require('./controller');
const { PASSPORT_VALIDATION_RESULTS } = require('../../constants');

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
  disabled: user.disabled,
  _id: user._id,
  isTrusted: user.isTrusted,
});

const sessionIdentifierValidation = (user, jwtPayload) =>
  user && user.sessionIdentifier === jwtPayload.sessionIdentifier ? PASSPORT_VALIDATION_RESULTS.PASSED : PASSPORT_VALIDATION_RESULTS.FAILED;

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

        if (sessionIdentifierValidation(user, jwtPayload) === PASSPORT_VALIDATION_RESULTS.FAILED) {
          console.error("Failed JWT validation for '%s' strategy", name);
          return done(null, false);
        }

        if (additionalUserValidation && additionalUserValidation(user, jwtPayload) === PASSPORT_VALIDATION_RESULTS.FAILED) {
          console.error("Failed user validation for '%s' strategy", name);
          return done(null, false);
        }

        if (additionalPayloadValidation && additionalPayloadValidation(jwtPayload) === PASSPORT_VALIDATION_RESULTS.FAILED) {
          console.error("Failed additional payload validation for '%s' strategy", name);
          return done(null, false);
        }

        const additionalFields = getAdditionalReturnedFields(user);
        return done(null, { ...sanitize(user), ...additionalFields });
      });
    }),
  );
};

const loginCompleteAuth = (passport, userService) => {
  const name = 'login-complete';
  const additionalPayloadValidation = (jwtPayload) =>
    jwtPayload.loginStatus === PORTAL_LOGIN_STATUS.VALID_2FA ? PASSPORT_VALIDATION_RESULTS.PASSED : PASSPORT_VALIDATION_RESULTS.FAILED;
  const additionalUserValidation = (user, jwtPayload) => {
    if (userService.isUserBlockedOrDisabled(user)) {
      console.error("User with username %s is blocked or disabled for '%s' strategy", jwtPayload.username, name);
      return PASSPORT_VALIDATION_RESULTS.FAILED;
    }
    return PASSPORT_VALIDATION_RESULTS.PASSED;
  };
  baseAuthenticationConfiguration({ name, passport, additionalPayloadValidation, additionalUserValidation });
};

const loginInProgressAuth = (passport) => {
  const additionalPayloadValidation = (jwtPayload) =>
    jwtPayload.loginStatus === PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD ? PASSPORT_VALIDATION_RESULTS.PASSED : PASSPORT_VALIDATION_RESULTS.FAILED;
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
  loginInProgressAuth,
};
