const utils = require('../../crypto/utils');

const {
  create, update, remove, list, findOne, findByUsername, updateLastLogin,
} = require('./controller');

const { sanitizeUser, sanitizeUsers } = require('./sanitizeUserData');

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

module.exports.create = (req, res, next) => {
  const {
    username, password, roles, bank, firstname, surname,
  } = req.body;
  const saltHash = utils.genPassword(password);

  const { salt, hash } = saltHash;

  const newUser = {
    username,
    firstname,
    surname,
    hash,
    salt,
    roles,
    bank,
  };

  create(newUser, (err, user) => {
    if (err) {
      next(err);
    } else {
      res.json({ success: true, user: sanitizeUser(user) });
    }
  });
};

module.exports.findById = (req, res, next) => {
  findOne(req.params._id, (err, user) => { // eslint-disable-line no-underscore-dangle
    if (err) {
      next(err);
    } else if (user) {
      res.status(200).json(sanitizeUser(user));
    } else {
      res.status(200).json({}); // TODO - this should 404- rethink tests?
    }
  });
};

module.exports.updateById = (req, res, next) => {
  update(req.params._id, req.body, (err, user) => { // eslint-disable-line no-underscore-dangle
    if (err) {
      next(err);
    } else {
      res.status(200).json(sanitizeUser(user));
    }
  });
};

module.exports.remove = (req, res, next) => {
  remove(req.params._id, (err, status) => { // eslint-disable-line no-underscore-dangle
    if (err) {
      next(err);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.login = (req, res, next) => {
  const { username, password } = req.body;

  findByUsername(username, (err, user) => {
    if (err) {
      next(err);
    } else if (user === null) {
      res.status(401).json({ success: false, msg: 'could not find user' });
    } else {
      const isValid = utils.validPassword(password, user.hash, user.salt);

      if (isValid) {
        const tokenObject = utils.issueJWT(user);

        updateLastLogin(user, () => {
          res.status(200).json({
            success: true, token: tokenObject.token, user: sanitizeUser(user), expiresIn: tokenObject.expires,
          });
        });
      } else {
        res.status(401).json({ success: false, msg: 'you entered the wrong password' });
      }
    }
  });
};
