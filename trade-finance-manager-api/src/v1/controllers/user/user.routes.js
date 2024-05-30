const { generateTfmAuditDetails, generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const { createUser, removeTfmUserById, findOne } = require('./user.controller');
const { mapUserData } = require('./helpers/mapUserData.helper');

// This route is used for mock data loader.
module.exports.createTfmUser = async (req, res) => {
  const userToCreate = req.body;
  const auditDetails = req.user?._id ? generateTfmAuditDetails(req.user._id) : generateNoUserLoggedInAuditDetails();

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
  return res.json({
    success: true,
    user,
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
