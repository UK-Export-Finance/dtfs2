const utils = require('../../../utils/crypto.util');
const { userNotFound, incorrectPassword, userIsDisabled } = require('../../../constants/login-results.constant');
const {
  create, update, removeTfmUserById, findOne,
} = require('./user.controller');

const { mapUserData } = require('./helpers/mapUserData.helper');
const { loginCallback } = require('./helpers/loginCallback.helper');
const { applyCreateRules, applyUpdateRules } = require('./validation');

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

module.exports.createTfmUser = (req, res, next) => {
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

module.exports.findTfmUserById = (req, res, next) => {
  findOne(req.params._id, (err, user) => {
    if (err) {
      next(err);
    } else if (user) {
      res.status(200).json({ user: mapUserData(user), status: 200 });
    } else {
      res.status(404).json({ user: {}, status: 404, message: 'User does not exist' });
    }
  });
};

module.exports.updateTfmUserById = (req, res, next) => {
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
            res.status(200).json(mapUserData(updatedUser));
          }
        });
      }
    } else {
      res.status(404).json({});
    }
  });
};

module.exports.removeTfmUserById = (req, res, next) => {
  removeTfmUserById(req.params._id, (err, status) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  const loginResult = await loginCallback(username, password);

  if (loginResult.err) {
    // pick out the specific cases we understand and could treat differently
    if (userNotFound === loginResult.err) {
      return res.status(401).json({
        success: false,
        msg: `Could not find the ${username} user`,
      });
    }
    if (incorrectPassword === loginResult.err) {
      return res.status(401).json({
        success: false,
        msg: 'You entered the wrong password',
      });
    }
    if (userIsDisabled === loginResult.err) {
      return res.status(401).json({
        success: false,
        msg: 'User is disabled',
      });
    }

    // otherwise this is a technical failure during the lookup
    return next(loginResult.err);
  }
  const { tokenObject, user } = loginResult;

  return res.status(200).json({
    success: true,
    token: tokenObject.token,
    user: mapUserData(user),
    expiresIn: tokenObject.expires,
  });
};
