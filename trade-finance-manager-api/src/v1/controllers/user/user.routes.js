const { ObjectId } = require('mongodb');
const { generateTfmAuditDetails, generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const utils = require('../../../utils/crypto.util');
const { userIsDisabled, usernameOrPasswordIncorrect, userIsBlocked } = require('../../../constants/login-results.constant');
const { create, update, removeTfmUserById, findOne, findByUsername } = require('./user.controller');

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

// TODO: DTFS2-6892 - Deprecate this function
module.exports.createTfmUser = (req, res, next) => {
  const userToCreate = req.body;
  const errors = applyCreateRules(userToCreate);
  // This is called on the open and auth router ('v1/user' and 'v1/users') endpoints so req.user may be undefined
  const auditDetails = req.user?._id ? generateTfmAuditDetails(req.user._id) : generateNoUserLoggedInAuditDetails();

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

  return create(newUser, auditDetails, (error, user) => {
    if (error) {
      return next(error);
    }
    return res.json({
      success: true,
      user,
    });
  });
};

module.exports.findTfmUser = (req, res, next) => {
  if (ObjectId.isValid(req.params.user)) {
    findOne(req.params.user, (error, user) => {
      if (error) {
        next(error);
      } else if (user) {
        res.status(200).json({ user: mapUserData(user), status: 200 });
      } else {
        res.status(404).json({ user: {}, status: 404, message: 'User does not exist' });
      }
    });
  } else {
    findByUsername(req.params.user, (error, user) => {
      if (error) {
        next(error);
      } else if (user) {
        res.status(200).json({ user: mapUserData(user), status: 200 });
      } else {
        res.status(404).json({ user: {}, status: 404, message: 'User does not exist' });
      }
    });
  }
};

// TODO: DTFS2-6892 - Deprecate this function
module.exports.updateTfmUserById = (req, res, next) => {
  findOne(req.params.user, (error, user) => {
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
        const auditDetails = generateTfmAuditDetails(req.user._id);
        update(req.params.user, req.body, auditDetails, (updateErr, updatedUser) => {
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

// TODO: DTFS2-6892 - Deprecate this function
module.exports.removeTfmUserById = (req, res) => {
  const auditDetails = generateTfmAuditDetails(req.user._id);
  removeTfmUserById(req.params.user, auditDetails, (error, status) => {
    if (error) {
      return res.status(status).send({ status, error });
    }
    return res.sendStatus(status);
  });
};

// TODO: DTFS2-6892 - Deprecate this function
module.exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  const loginResult = await loginCallback(username, password, generateNoUserLoggedInAuditDetails());

  if (loginResult.error) {
    // pick out the specific cases we understand and could treat differently
    if (usernameOrPasswordIncorrect === loginResult.error) {
      return res.status(401).json({
        success: false,
        msg: 'Username or password is incorrect',
      });
    }
    if (userIsDisabled === loginResult.error) {
      return res.status(401).json({
        success: false,
        msg: 'User is disabled',
      });
    }
    if (userIsBlocked === loginResult.error) {
      return res.status(401).json({
        success: false,
        msg: 'User is blocked',
      });
    }

    // otherwise this is a technical failure during the lookup
    return next(loginResult.error);
  }

  const { tokenObject, user } = loginResult;

  return res.status(200).json({
    success: true,
    token: tokenObject.token,
    user: mapUserData(user),
    expiresIn: tokenObject.expires,
  });
};
