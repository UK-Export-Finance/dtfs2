const { generateTfmAuditDetails, generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
// <<<<<<< HEAD
const { createUser, removeTfmUserById, findOne } = require('./user.controller');
// ======= TODO: cleanup.
// const utils = require('../../../utils/crypto.util');
// const { userIsDisabled, usernameOrPasswordIncorrect, userIsBlocked } = require('../../../constants/login-results.constant');
// const { create, update, removeTfmUserById, findOne, findByUsername } = require('./user.controller');

// >>>>>>> origin/main
const { mapUserData } = require('./helpers/mapUserData.helper');

// This route is used for mock data loader.
module.exports.createTfmUser = async (req, res) => {
  const userToCreate = req.body;
  // <<<<<<< HEAD
  // =======
  // const errors = applyCreateRules(userToCreate);
  const auditDetails = req.user?._id ? generateTfmAuditDetails(req.user._id) : generateNoUserLoggedInAuditDetails();
  // >>>>>>> origin/main

  const user = await createUser(userToCreate, auditDetails);

  if (user === false) {
    return res.status(400).json({
      success: false,
      errors: {
        count: 1,
        errorList: ['User creation failed'],
      },
    });
  }
  // <<<<<<< HEAD
  return res.json({
    success: true,
    user,
    // =======

    //   const { password } = userToCreate;
    //   const saltHash = utils.genPassword(password);

    //   const { salt, hash } = saltHash;

    //   const newUser = { ...userToCreate, salt, hash };

    //   // This is called on the open and auth router ('v1/user' and 'v1/users') endpoints so req.user may be undefined
    //   return create(newUser, auditDetails, (error, user) => {
    //     if (error) {
    //       return next(error);
    //     }
    //     return res.json({
    //       success: true,
    //       user,
    //     });
    // >>>>>>> origin/main
  });
};

module.exports.findTfmUser = (req, res, next) => {
  if (!ObjectId.isValid(req.params.user)) {
    res.status(400).json({ user: {}, status: 400, message: 'User id is not valid' });
    return;
  }
  findOne(req.params.user, (error, user) => {
    if (error) {
      next(error);
    } else if (user) {
      res.status(200).json({ user: mapUserData(user), status: 200 });
    } else {
      res.status(404).json({ user: {}, status: 404, message: 'User does not exist' });
    }
  });
};

// This route is used for mock data loader.
module.exports.removeTfmUserById = (req, res, next) => {
  removeTfmUserById(req.params.user, generateTfmAuditDetails(req.user._id), (error, status) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(status);
    }
  });
};
