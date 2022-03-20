const utils = require('../../../utils/crypto.util');
const login = require('./login.controller');
const {
  userNotFound, userIsBlocked, incorrectPassword, userIsDisabled,
} = require('../../../constants/login-results.constant');
const {
  create, update, remove, findOne, disable,
} = require('./controller');

const { sanitizeUser } = require('./sanitizeUserData');
const { applyCreateRules, applyUpdateRules } = require('./validation');

const combineErrors = (listOfErrors) =>
  listOfErrors.reduce((obj, error) => {
    const response = {
      ...obj,
    };
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

module.exports.create = (req, res, next) => {
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

  const { salt, hash } = saltHash;

  const newUser = { ...userToCreate, salt, hash };

  return create(newUser, (err, user) => {
    if (err) {
      return next(err);
    }
    return res.json({
      success: true,
      user,
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
      return res.status(401).json({
        success: false,
        msg: 'could not find user',
      });
    }
    if (userIsBlocked === loginResult.err) {
      return res.status(401).json({
        success: false,
        msg: 'account is blocked',
      });
    }
    if (incorrectPassword === loginResult.err) {
      return res.status(401).json({
        success: false,
        msg: 'you entered the wrong password',
      });
    }
    if (userIsDisabled === loginResult.err) {
      return res.status(401).json({
        success: false,
        msg: 'user is disabled',
      });
    }

    // otherwise this is a technical failure during the lookup
    return next(loginResult.err);
  }
  const { tokenObject, user } = loginResult;

  return res.status(200).json({
    success: true,
    token: tokenObject.token,
    user: sanitizeUser(user),
    expiresIn: tokenObject.expires,
  });
};
