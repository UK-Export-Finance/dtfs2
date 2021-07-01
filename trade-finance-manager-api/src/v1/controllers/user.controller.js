const api = require('../api');

const findUser = async (username) => api.findUser(username);

exports.findUser = findUser;

const findUserGET = async (req, res) => {
  const { username } = req.params;
  const user = await findUser(username);

  const status = user ? '200' : '404';
  return res.status(status).send({ user });
};
exports.findUserGET = findUserGET;

const findUserById = async (userId) => {
  const user = await api.findUserById(userId);

  return user;
};
exports.findUserById = findUserById;
