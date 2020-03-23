const mongoose = require('mongoose');
const router = require('express').Router();

const User = mongoose.model('User');
const passport = require('passport');
const utils = require('../lib/utils');


router.post('/login', (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        res.status(401).json({ success: false, msg: 'could not find user' });
      }

      const isValid = utils.validPassword(req.body.password, user.hash, user.salt);

      if (isValid) {
        const tokenObject = utils.issueJWT(user);
        res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });
      } else {
        res.status(401).json({ success: false, msg: 'you entered the wrong password' });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/register', (req, res, next) => {
  const saltHash = utils.genPassword(req.body.password);

  const { salt } = saltHash;
  const { hash } = saltHash;

  const newUser = new User({
    username: req.body.username,
    hash,
    salt,
    roles: req.body.roles,
  });

  newUser.save()
    .then((user) => {
      const userDataForClient = {
        _id: user._id, // eslint-disable-line no-underscore-dangle
        roles: user.roles,
        username: user.username,
      };

      res.json({ success: true, user: userDataForClient });
    })
    .catch((err) => next(err));
});

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

router.get('/protected/maker', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user.roles.includes('maker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

router.get('/protected/checker', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user.roles.includes('checker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

module.exports = router;
