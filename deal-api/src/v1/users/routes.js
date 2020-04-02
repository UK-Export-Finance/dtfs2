const utils = require('../../crypto/utils');

const {
  create, update, remove, list, findOne,
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
    username, password, roles, bank,
  } = req.body;
  const saltHash = utils.genPassword(password);

  const { salt, hash } = saltHash;

  const newUser = {
    username,
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

module.exports.findByUsername = (req, res, next) => {
  findOne(req.params.username, (err, user) => {
    if (err) {
      next(err);
    } else if (user) {
      res.status(200).json(sanitizeUser(user));
    } else {
      res.status(200).json({}); // TODO - this should 404- rethink tests?
    }
  });
};

module.exports.updateByUsername = (req, res, next) => {
  update(req.params.username, req.body, (err, user) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json(sanitizeUser(user));
    }
  });
};

module.exports.remove = (req, res, next) => {
  remove(req.params.username, (err, status) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json(status);
    }
  });
};

module.exports.login = (req, res, next) => {
  const { username, password } = req.body;

  findOne(username, (err, user) => {
    if (err) {
      next(err);
    } else if (user === null) {
      res.status(401).json({ success: false, msg: 'could not find user' });
    } else {
      const isValid = utils.validPassword(password, user.hash, user.salt);

      if (isValid) {
        const tokenObject = utils.issueJWT(user);
        res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });
      } else {
        res.status(401).json({ success: false, msg: 'you entered the wrong password' });
      }
    }
  });
};
