const {
  generateAuditDatabaseRecordFromAuditDetails,
  generatePortalAuditDetails,
  generateNoUserLoggedInAuditDetails,
} = require('@ukef/dtfs2-common/change-stream');
const { PORTAL_LOGIN_STATUS, generatePasswordHash } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { login } = require('./login.controller');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { create, update, remove, list, findOne, disable } = require('./controller');
const { resetPassword, getUserByPasswordToken } = require('./reset-password.controller');
const { sanitizeUser, sanitizeUsers } = require('./sanitizeUserData');
const { applyCreateRules, applyUpdateRules } = require('./validation');
const { SignInLinkController } = require('./sign-in-link.controller');
const { SignInLinkService } = require('./sign-in-link.service');
const { Pbkdf2Sha512HashStrategy } = require('../../crypto/pbkdf2-sha512-hash-strategy');
const { CryptographicallyStrongGenerator } = require('../../crypto/cryptographically-strong-generator');
const { Hasher } = require('../../crypto/hasher');
const { UserRepository } = require('./repository');
const { UserService } = require('./user.service');
const { ADMIN } = require('../roles/roles');

const randomGenerator = new CryptographicallyStrongGenerator();

const hashStrategy = new Pbkdf2Sha512HashStrategy(randomGenerator);
const hasher = new Hasher(hashStrategy);

const userRepository = new UserRepository();
const userService = new UserService();

const signInLinkService = new SignInLinkService(randomGenerator, hasher, userRepository, userService);
const signInLinkController = new SignInLinkController(signInLinkService);

module.exports.list = (req, res, next) => {
  list((error, users) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({
        success: true,
        count: users.length,
        users: sanitizeUsers(users),
      });
    }
  });
};

const combineErrors = (listOfErrors) =>
  listOfErrors.reduce((obj, error) => {
    const response = { ...obj };
    const field = Object.keys(error)[0];
    const value = error[field];

    if (field === 'password') {
      // we have all the details but no sensible way to convey a list..
      // quickest hack to get through review: one error message to rule them all..
      response[field] = {
        text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.',
      };
    } else {
      response[field] = value;
    }
    return response;
  }, {});

module.exports.create = async (req, res, next) => {
  const userToCreate = req.body;
  const errors = await applyCreateRules(userToCreate);

  if (errors.length) {
    return res.status(400).json({
      success: false,
      errors: {
        count: errors.length,
        errorList: combineErrors(errors),
      },
    });
  }

  // generate password hash from a random MongoDB ObjectId
  const randomMongoId = new ObjectId().toHexString();
  const { salt, hash } = generatePasswordHash(randomMongoId);

  const newUser = {
    ...userToCreate,
    salt,
    hash,
  };

  // This is called on the open and auth router ('v1/user' and 'v1/users') endpoints so req.user may be undefined
  const auditDetails = req.user?._id ? generatePortalAuditDetails(req.user._id) : generateNoUserLoggedInAuditDetails();

  return create(newUser, userService, auditDetails, (e, user) => {
    if (e) {
      return next(e);
    }
    return res.json({ success: true, user });
  });
};

module.exports.findById = (req, res, next) => {
  findOne(req.params._id, (error, user) => {
    if (error) {
      next(error);
    } else if (user) {
      res.status(200).json(sanitizeUser(user));
    } else {
      res.status(200).json({});
    }
  });
};

module.exports.updateById = async (req, res, next) => {
  try {
    const userIsAdmin = req.user?.roles?.includes(ADMIN);

    // TODO: DTFS2-7031 - update password changing rules
    const requestOnlyHasPasswordFields = Object.keys(req.body).every((property) => ['password', 'passwordConfirm', 'currentPassword'].includes(property));
    const userIsChangingTheirOwnPassword = req.user?._id?.toString() === req.params._id && requestOnlyHasPasswordFields;

    if (!userIsAdmin && !userIsChangingTheirOwnPassword) {
      return res.status(403).send();
    }

    return findOne(req.params._id, async (error, user) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        console.error('Failed to find user with _id', req.params._id);
        return res.status(404).send();
      }
      const errors = await applyUpdateRules(user, req.body);

      if (errors.length) {
        return res.status(400).json({
          success: false,
          errors: {
            count: errors.length,
            errorList: combineErrors(errors),
          },
        });
      }

      return update(req.params._id, req.body, generatePortalAuditDetails(req.user._id), (updateErr, updatedUser) => {
        if (updateErr) {
          return next(updateErr);
        }
        return res.status(200).json(sanitizeUser(updatedUser));
      });
    });
  } catch (error) {
    console.error('Error updating user %o', error);
    return res.status(500).send();
  }
};

module.exports.disable = (req, res, next) => {
  disable(req.params._id, generatePortalAuditDetails(req.user._id), (error, status) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.remove = (req, res) => {
  const auditDetails = generatePortalAuditDetails(req.user._id);
  remove(req.params._id, auditDetails, (error, status) => {
    if (error) {
      return res.status(status).send({ status, error });
    }
    return res.sendStatus(status);
  });
};

module.exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  const auditDetails = generateNoUserLoggedInAuditDetails();

  const loginResult = await login(username, password, userService, auditDetails);

  if (loginResult.error) {
    // pick out the specific cases we understand and could treat differently
    if (usernameOrPasswordIncorrect === loginResult.error) {
      return res.status(401).json({ success: false, msg: 'email or password is incorrect' });
    }

    if (userIsBlocked === loginResult.error) {
      return res.status(403).json({ success: false, msg: 'user is blocked' });
    }

    if (userIsDisabled === loginResult.error) {
      return res.status(401).json({ success: false, msg: 'user is disabled' });
    }

    // otherwise this is a technical failure during the lookup
    return next(loginResult.error);
  }

  const { tokenObject, userEmail, userId } = loginResult;
  return res.status(200).json({
    success: true,
    token: tokenObject.token,
    loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
    user: { email: userEmail, userId },
    expiresIn: tokenObject.expires,
  });
};

module.exports.createAndEmailSignInLink = (req, res) => signInLinkController.createAndEmailSignInLink(req, res);

/**
 * Creates and emails a sign-in OTP to the user associated with the provided email address.
 */
module.exports.createAndEmailSignInOTP = (req, res) => signInLinkController.createAndEmailSignInOTP(req, res);

module.exports.loginWithSignInLink = (req, res) => signInLinkController.loginWithSignInLink(req, res);

/**
 * Verifies and logs in a user using a sign-in OTP.
 */
module.exports.loginWithOTP = (req, res) => signInLinkController.loginWithOTP(req, res);

module.exports.resetPassword = async (req, res) => {
  const { email } = req.body;
  const auditDetails = generateNoUserLoggedInAuditDetails();
  await resetPassword(email, userService, auditDetails);

  return res.status(200).send();
};

/**
 * Portal reset password route caters for following user scenarios:
 * 1. User initiated password reset
 * 2. Administrator adds a new user, where user need to specify the password.
 */
module.exports.resetPasswordWithToken = async (req, res, next) => {
  const { resetPwdToken } = req.params;
  const { currentPassword, password, passwordConfirm } = req.body;

  // Only valid for user initiated password reset operation
  if (Object.prototype.hasOwnProperty.call(req.body, 'currentPassword')) {
    if (currentPassword.trim() === '') {
      return res.status(400).json({
        success: false,
        errors: {
          count: 1,
          errorList: {
            currentPassword: {
              text: 'Empty password',
            },
          },
        },
      });
    }
  }

  // First password
  if (password.trim() === '') {
    return res.status(400).json({
      success: false,
      errors: {
        count: 1,
        errorList: {
          password: {
            text: 'Empty password',
          },
        },
      },
    });
  }

  // Second password
  if (passwordConfirm.trim() === '') {
    return res.status(400).json({
      success: false,
      errors: {
        count: 1,
        errorList: {
          passwordConfirm: {
            text: 'Empty password',
          },
        },
      },
    });
  }

  // Match passwords
  if (password.trim() !== passwordConfirm.trim()) {
    return res.status(400).json({
      success: false,
      errors: {
        count: 1,
        errorList: {
          password: {
            text: 'Your passwords must match.',
          },
          passwordConfirm: {
            text: 'Your passwords must match.',
          },
        },
      },
    });
  }

  // Invalid token - Token expired
  const user = await getUserByPasswordToken(resetPwdToken);
  // Stale token - Generated over 24 hours ago
  const hoursSincePasswordResetRequest = user.resetPwdTimestamp ? (Date.now() - user.resetPwdTimestamp) / 1000 / 60 / 60 : 9999;

  // Token check
  if (!user || hoursSincePasswordResetRequest > 24) {
    return res.status(400).json({
      success: false,
      errors: {
        count: 1,
        errorList: {
          password: {
            text: 'Password reset link is not valid',
          },
        },
      },
    });
  }

  const errors = await applyUpdateRules(user, {
    password,
    passwordConfirm,
    currentPassword,
  });

  if (errors.length) {
    return res.status(400).json({
      success: false,
      errors: {
        count: errors.length,
        errorList: combineErrors(errors),
      },
    });
  }
  const auditDetails = generatePortalAuditDetails(user._id);
  const updateData = {
    password,
    passwordConfirm,
    resetPwdToken: '',
    resetPwdTimestamp: '',
    currentPassword: '',
    loginFailureCount: 0,
    passwordUpdatedAt: `${Date.now()}`,
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  return update(user._id, updateData, generatePortalAuditDetails(user._id), (updateErr) => {
    if (updateErr) {
      next(updateErr);
    } else {
      res.status(200).json({
        success: true,
      });
    }
  });
};
