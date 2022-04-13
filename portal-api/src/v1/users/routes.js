const utils = require('../../crypto/utils');
const login = require('./login.controller');
const {
  userNotFound,
  userIsBlocked,
  incorrectPassword,
  userIsDisabled,
} = require('../../constants/login-results');
const {
  create,
  update,
  remove,
  list,
  findOne,
  disable,
  findByEmail,
} = require('./controller');
const { resetPassword, getUserByPasswordToken } = require('./reset-password.controller');
const { sanitizeUser, sanitizeUsers } = require('./sanitizeUserData');
const { applyCreateRules, applyUpdateRules } = require('./validation');

module.exports.list = (req, res, next) => {
  list((err, users) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({
        success: true,
        count: users.length,
        users: sanitizeUsers(users),
      });
    }
  });
};

const combineErrors = (listOfErrors) => listOfErrors.reduce((obj, error) => {
  const response = { ...obj };
  const field = Object.keys(error)[0];
  const value = error[field];

  if (field === 'password') {
    // we have all the details but no sensible way to convey a list..
    // quickest hack to get through review: one error message to rule them all..
    response[field] = { text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.' };
  } else {
    response[field] = value;
  }
  return response;
}, {});

module.exports.create = async (req, res, next) => {
  if (req?.body?._csrf) {
    delete req.body._csrf;
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
    const saltHash = utils.genPassword(password);

    userToCreate.password = '';
    userToCreate.passwordConfirm = '';

    const { salt, hash } = saltHash;
    const newUser = {
      ...userToCreate,
      salt,
      hash,
    };

    return create(newUser, (err, user) => {
      if (err) {
        return next(err);
      }
      return res.json({ success: true, user });
    });
  });
};

module.exports.findById = (req, res, next) => {
  findOne(req.params._id, (err, user) => {
    if (err) {
      next(err);
    } else if (user) {
      res.status(200).json(sanitizeUser(user));
    } else {
      res.status(200).json({});
    }
  });
};

module.exports.updateById = (req, res, next) => {
  if (req?.body?._csrf) {
    delete req.body._csrf;
  }

  findOne(req.params._id, (err, user) => {
    if (err) {
      next(err);
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
  disable(req.params._id, (err, status) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.remove = (req, res, next) => {
  remove(req.params._id, (err, status) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  const loginResult = await login(username, password);

  if (loginResult.err) {
    // pick out the specific cases we understand and could treat differently
    if (userNotFound === loginResult.err) {
      return res.status(401).json({ success: false, msg: 'could not find user' });
    }
    if (userIsBlocked === loginResult.err) {
      return res.status(401).json({ success: false, msg: 'account is blocked' });
    }
    if (incorrectPassword === loginResult.err) {
      return res.status(401).json({ success: false, msg: 'you entered the wrong password' });
    }
    if (userIsDisabled === loginResult.err) {
      return res.status(401).json({ success: false, msg: 'user is disabled' });
    }

    // otherwise this is a technical failure during the lookup
    return next(loginResult.err);
  }
  const { tokenObject, user } = loginResult;

  return res.status(200).json({
    success: true, token: tokenObject.token, user: sanitizeUser(user), expiresIn: tokenObject.expires,
  });
};

module.exports.resetPassword = async (req, res) => {
  const { email } = req.body;
  const { success } = await resetPassword(email);

  return res.status(200).json({
    success,
  });
};

/**
 * Portal reset password route caters for following user scenarios:
 * 1. User initiated password reset
 * 2. Adminstrator adds a new user, where user need to specify the password.
 */
module.exports.resetPasswordWithToken = async (req, res, next) => {
  const { resetPwdToken } = req.params;
  const { currentPassword, password, passwordConfirm } = req.body;

  // Only valid for user initiated password reset operation
  if (currentPassword) {
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
  const user = await getUserByPasswordToken(resetPwdToken, req.body);
  // Stale token - Generated over 24 hours ago
  const hoursSincePasswordResetRequest = user.resetPwdTimestamp
    ? (Date.now() - user.resetPwdTimestamp) / 1000 / 60 / 60
    : 9999;

  // Token check
  if (!user || (hoursSincePasswordResetRequest > 24)) {
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
    resetPwdToken,
    ...req.body,
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
    ...req.body,
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
