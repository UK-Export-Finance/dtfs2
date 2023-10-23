const utils = require('../../crypto/utils');
const { login, sendSignInLinkEmail } = require('./login.controller');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { create, update, remove, list, findOne, disable, findByEmail, findByUsername } = require('./controller');
const { resetPassword, getUserByPasswordToken } = require('./reset-password.controller');
const { sanitizeUser, sanitizeUsers } = require('./sanitizeUserData');
const { applyCreateRules, applyUpdateRules } = require('./validation');
const { isValidEmail } = require('../../utils/string');
const { FEATURE_FLAGS } = require('../../config/feature-flag.config');

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
  if (!isValidEmail(req.body?.email)) {
    // Empty email address
    const invalidEmail = {
      email: {
        order: '1',
        text: 'Enter an email address in the correct format, for example, name@example.com',
      },
    };

    return res.status(400).json({
      success: false,
      errors: {
        count: invalidEmail.length,
        errorList: invalidEmail,
      },
    });
  }

  await findByEmail(req.body.email, (error, account) => {
    let userExists = {};
    if (account) {
      // User exists with same email address
      userExists = {
        email: {
          order: '1',
          text: 'User already exists.',
        },
      };
    }

    if (Object.keys(userExists).length) {
      return res.status(400).json({
        success: false,
        errors: {
          count: userExists.length,
          errorList: userExists,
        },
      });
    }

    const userToCreate = req.body;
    const errors = applyCreateRules(userToCreate);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        errors: {
          count: errors.length,
          errorList: combineErrors(errors),
        },
      });
    }

    const { password } = userToCreate;

    let salt = '';
    let hash = '';

    if (password) {
      const saltHash = utils.genPassword(password);
      ({ salt, hash } = saltHash);
    }

    userToCreate.password = '';
    userToCreate.passwordConfirm = '';

    const newUser = {
      ...userToCreate,
      salt,
      hash,
    };

    // Defined `e` since `error` is defined on a higher scope
    return create(newUser, (e, user) => {
      if (e) {
        return next(e);
      }
      return res.json({ success: true, user });
    });
  });

  return null;
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

module.exports.updateById = (req, res, next) => {
  findOne(req.params._id, (error, user) => {
    if (error) {
      next(error);
    } else if (user) {
      const errors = applyUpdateRules(user, req.body);
      if (errors.length) {
        res.status(400).json({
          success: false,
          errors: {
            count: errors.length,
            errorList: combineErrors(errors),
          },
        });
      } else {
        update(req.params._id, req.body, (updateErr, updatedUser) => {
          if (updateErr) {
            next(updateErr);
          } else {
            res.status(200).json(sanitizeUser(updatedUser));
          }
        });
      }
    } else {
      res.status(200).json({});
    }
  });
};

module.exports.disable = (req, res, next) => {
  disable(req.params._id, (error, status) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.remove = (req, res, next) => {
  remove(req.params._id, (error, status) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.login = async (req, res, next) => {
  // TODO DTFS2-6680: Remove old login functionality
  const { username, password } = req.body;

  const loginResult = await login(username, password);

  if (loginResult.error) {
    // pick out the specific cases we understand and could treat differently
    if (usernameOrPasswordIncorrect === loginResult.error) {
      return res.status(401).json({ success: false, msg: 'email or password is incorrect' });
    }
    if (userIsBlocked === loginResult.error) {
      return res.status(401).json({ success: false, msg: 'user is blocked' });
    }
    if (userIsDisabled === loginResult.error) {
      return res.status(401).json({ success: false, msg: 'user is disabled' });
    }

    // otherwise this is a technical failure during the lookup
    return next(loginResult.error);
  }

  if (FEATURE_FLAGS.MAGIC_LINK) {
    findByUsername(username, async (error, user) => {
      if (error) {
        next(error);
      } else if (user) {
        const { status } = await sendSignInLinkEmail(user.email, user.firstname, 'placeholderSignInLink');
        if (status === 201) {
          // TODO DTFS2-6680: Add success logic here.
        } else {
          // TODO DTFS2-6680: Add failure logic here.
        }
      } else {
        next(usernameOrPasswordIncorrect);
      }
    });
  }

  const { tokenObject, user } = loginResult;

  return res.status(200).json({
    success: true,
    token: tokenObject.token,
    user: sanitizeUser(user),
    expiresIn: tokenObject.expires,
  });
};

module.exports.resetPassword = async (req, res) => {
  const { email } = req.body;
  await resetPassword(email);

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
            text: 'Password do not match',
          },
          passwordConfirm: {
            text: 'Password do not match',
          },
        },
      },
    });
  }

  // Void token - Token expired
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

  const errors = applyUpdateRules(user, {
    password,
    passwordConfirm,
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
  const updateData = {
    password,
    passwordConfirm,
    resetPwdToken: '',
    resetPwdTimestamp: '',
    currentPassword: '',
    loginFailureCount: 0,
    passwordUpdatedAt: `${Date.now()}`,
  };

  return update(user._id, updateData, (updateErr) => {
    if (updateErr) {
      next(updateErr);
    } else {
      res.status(200).json({
        success: true,
      });
    }
  });
};
