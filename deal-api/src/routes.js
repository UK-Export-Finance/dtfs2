const express = require('express');
const passport = require('passport');

const deals = require('./controllers/deal.controller');
const banks = require('./controllers/banks.controller');
const bondCurrencies = require('./controllers/bondCurrencies.controller');
const countries = require('./controllers/countries.controller');
const industrySectors = require('./controllers/industrySectors.controller');
const mandatoryCriteria = require('./controllers/mandatoryCriteria.controller');
const transactions = require('./controllers/transactions.controller');

const users = require('./users/routes');

const router = express.Router();

//----
// things that should be in this file

router.get('/api/deals', deals.findAll);
router.post('/api/deals', deals.create);

router.get('/api/deals/:id', deals.findOne);
router.put('/api/deals/:id', deals.update);
router.delete('/api/deals/:id', deals.delete);

//-----
// things that feel like candidates to move to another service

router.get('/api/banks', passport.authenticate('jwt', { session: false }), banks.findAll);
router.post('/api/banks', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user.roles.includes('editor')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  } else {
    banks.create(req, res);
  }
});

router.get('/api/banks/:id', passport.authenticate('jwt', { session: false }), banks.findOne);

router.put('/api/banks/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user.roles.includes('editor')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  } else {
    banks.update(req, res);
  }
});

router.delete('/api/banks/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user.roles.includes('editor')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  } else {
    banks.delete(req, res);
  }
});

router.get('/api/bond-currencies', bondCurrencies.findAll);
router.post('/api/bond-currencies', bondCurrencies.create);
router.get('/api/bond-currencies/:id', bondCurrencies.findOne);
router.put('/api/bond-currencies/:id', bondCurrencies.update);
router.delete('/api/bond-currencies/:id', bondCurrencies.delete);

router.get('/api/countries', countries.findAll);
router.post('/api/countries', countries.create);
router.get('/api/countries/:code', countries.findOne);
router.put('/api/countries/:code', countries.update);
router.delete('/api/countries/:code', countries.delete);

router.get('/api/industry-sectors', industrySectors.findAll);
router.post('/api/industry-sectors', industrySectors.create);
router.get('/api/industry-sectors/:code', industrySectors.findOne);
router.put('/api/industry-sectors/:code', industrySectors.update);
router.delete('/api/industry-sectors/:code', industrySectors.delete);

router.get('/api/mandatory-criteria', mandatoryCriteria.findAll);
router.post('/api/mandatory-criteria', mandatoryCriteria.create);
router.get('/api/mandatory-criteria/:id', mandatoryCriteria.findOne);
router.put('/api/mandatory-criteria/:id', mandatoryCriteria.update);
router.delete('/api/mandatory-criteria/:id', mandatoryCriteria.delete);

router.get('/api/transactions', transactions.findAll);
router.post('/api/transactions', transactions.create);
router.get('/api/transactions/:bankFacilityId', transactions.findOne);
router.put('/api/transactions/:bankFacilityId', transactions.update);
router.delete('/api/transactions/:bankFacilityId', transactions.delete);

router.get('/api/users', users.list);
router.post('/api/users', users.create);
router.get('/api/users/:username', users.findByUsername);
router.put('/api/users/:username', users.updateByUsername);
router.delete('/api/users/:username', users.remove);
router.post('/api/login', users.login);

router.get('/test/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

router.get('/test/protected/maker', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user.roles.includes('maker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

router.get('/test/protected/checker', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user.roles.includes('checker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

module.exports = router;
