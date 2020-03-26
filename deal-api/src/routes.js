const express = require('express');
const passport = require('passport');

const validate = require('./role-validator');

const deals = require('./controllers/deal.controller');
const banks = require('./controllers/banks.controller');
const bondCurrencies = require('./controllers/bondCurrencies.controller');
const countries = require('./controllers/countries.controller');
const industrySectors = require('./controllers/industrySectors.controller');
const mandatoryCriteria = require('./controllers/mandatoryCriteria.controller');
const transactions = require('./controllers/transactions.controller');

const users = require('./users/routes');

const router = express.Router();

router.get('/api/deals',
  passport.authenticate('jwt', { session: false }),
  deals.findAll);

router.get('/api/deals/:_id',
  passport.authenticate('jwt', { session: false }),
  deals.findOne);

router.post('/api/deals',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  deals.create);

router.put('/api/deals/:_id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  deals.update);

router.delete('/api/deals/:_id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  deals.delete);


router.get('/api/banks',
  passport.authenticate('jwt', { session: false }),
  banks.findAll);

router.get('/api/banks/:id',
  passport.authenticate('jwt', { session: false }),
  banks.findOne);

router.post('/api/banks',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  banks.create);

router.put('/api/banks/:id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  banks.update);

router.delete('/api/banks/:id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  banks.delete);


router.get('/api/bond-currencies',
  passport.authenticate('jwt', { session: false }),
  bondCurrencies.findAll);

router.get('/api/bond-currencies/:id',
  passport.authenticate('jwt', { session: false }),
  bondCurrencies.findOne);

router.post('/api/bond-currencies',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  bondCurrencies.create);

router.put('/api/bond-currencies/:id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  bondCurrencies.update);

router.delete('/api/bond-currencies/:id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  bondCurrencies.delete);


router.get('/api/countries',
  passport.authenticate('jwt', { session: false }),
  countries.findAll);

router.get('/api/countries/:code',
  passport.authenticate('jwt', { session: false }),
  countries.findOne);

router.post('/api/countries',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  countries.create);

router.put('/api/countries/:code',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  countries.update);

router.delete('/api/countries/:code',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  countries.delete);

router.get('/api/industry-sectors',
  passport.authenticate('jwt', { session: false }),
  industrySectors.findAll);

router.get('/api/industry-sectors/:code',
  passport.authenticate('jwt', { session: false }),
  industrySectors.findOne);

router.post('/api/industry-sectors',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  industrySectors.create);

router.put('/api/industry-sectors/:code',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  industrySectors.update);

router.delete('/api/industry-sectors/:code',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  industrySectors.delete);


router.get('/api/mandatory-criteria',
  passport.authenticate('jwt', { session: false }),
  mandatoryCriteria.findAll);

router.get('/api/mandatory-criteria/:id',
  passport.authenticate('jwt', { session: false }),
  mandatoryCriteria.findOne);

router.post('/api/mandatory-criteria',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  mandatoryCriteria.create);

router.put('/api/mandatory-criteria/:id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  mandatoryCriteria.update);

router.delete('/api/mandatory-criteria/:id',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  mandatoryCriteria.delete);

router.get('/api/transactions',
  passport.authenticate('jwt', { session: false }),
  transactions.findAll);

router.get('/api/transactions/:bankFacilityId',
  passport.authenticate('jwt', { session: false }),
  transactions.findOne);

router.post('/api/transactions',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  transactions.create);

router.put('/api/transactions/:bankFacilityId',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  transactions.update);

router.delete('/api/transactions/:bankFacilityId',
  passport.authenticate('jwt', { session: false }),
  validate({ role: 'editor' }),
  transactions.delete);


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
