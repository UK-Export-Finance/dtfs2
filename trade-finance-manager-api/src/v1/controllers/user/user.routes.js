const { createUser, removeTfmUserById } = require('./user.controller');

// This route is used for mock data loader.
module.exports.createTfmUser = async (req, res) => {
  const userToCreate = req.body;

  const user = await createUser(userToCreate);
  return res.json({
    success: true,
    user,
  });
};

// This route is used for mock data loader.
module.exports.removeTfmUserById = (req, res, next) => {
  removeTfmUserById(req.params.user, (error, status) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json(status);
    }
  });
};