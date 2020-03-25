const express = require('express');
const passport = require('passport');

const validate = require('../role-validator');

const deals = require('./controllers/deal.controller');
const banks = require('./controllers/banks.controller');
const bondCurrencies = require('./controllers/bondCurrencies.controller');
const countries = require('./controllers/countries.controller');
const industrySectors = require('./controllers/industrySectors.controller');
const mandatoryCriteria = require('./controllers/mandatoryCriteria.controller');
const transactions = require('./controllers/transactions.controller');

const users = require('./users/routes');

const authRouter = express.Router();
const openRouter = express.Router();

authRouter.use(passport.authenticate('jwt', { session: false }));

authRouter.post('*',
  validate({ role: 'editor' }));

authRouter.put('*',
  validate({ role: 'editor' }));

authRouter.delete('*',
  validate({ role: 'editor' }));


authRouter.route('/deals')
  .get(
    deals.findAll,
  )
  .post(
    deals.create,
  );

authRouter.route('/deals/:id')
  .get(
    deals.findOne,
  )
  .put(
    deals.update,
  )
  .delete(
    deals.delete,
  );

authRouter.route('/banks')
  .get(
    banks.findAll,
  )
  .post(
    banks.create,
  );

authRouter.route('/banks/:id')
  .get(
    banks.findOne,
  )
  .put(
    banks.update,
  )
  .delete(
    banks.delete,
  );

authRouter.route('/bond-currencies')
  .get(
    bondCurrencies.findAll,
  )
  .post(
    bondCurrencies.create,
  );

authRouter.route('/bond-currencies/:id')
  .get(
    bondCurrencies.findOne,
  )
  .put(
    bondCurrencies.update,
  )
  .delete(
    bondCurrencies.delete,
  );

authRouter.route('/countries')
  .get(
    countries.findAll,
  )
  .post(
    countries.create,
  );

authRouter.route('/countries/:code')
  .get(
    countries.findOne,
  )
  .put(
    countries.update,
  )
  .delete(
    countries.delete,
  );

authRouter.route('/industry-sectors')
  .get(
    industrySectors.findAll,
  )
  .post(
    industrySectors.create,
  );

authRouter.route('/industry-sectors/:code')
  .get(
    industrySectors.findOne,
  )
  .put(
    industrySectors.update,
  )
  .delete(
    industrySectors.delete,
  );

authRouter.route('/mandatory-criteria')
  .get(
    mandatoryCriteria.findAll,
  )
  .post(
    mandatoryCriteria.create,
  );

authRouter.route('/mandatory-criteria/:id')
  .get(
    mandatoryCriteria.findOne,
  )
  .put(
    mandatoryCriteria.update,
  )
  .delete(
    mandatoryCriteria.delete,
  );

authRouter.route('/transactions')
  .get(
    transactions.findAll,
  )
  .post(
    transactions.create,
  );

authRouter.route('/transactions/:bankFacilityId')
  .get(
    transactions.findOne,
  )
  .put(
    transactions.update,
  )
  .delete(
    transactions.delete,
  );


openRouter.route('/users')
  .get(
    users.list,
  )
  .post(
    users.create,
  );

openRouter.route('/users/:username')
  .get(
    users.findByUsername,
  )
  .put(
    users.updateByUsername,
  ).delete(
    users.remove,
  );

openRouter.route('/login')
  .post(
    users.login,
  );

authRouter.get('/test/protected', (req, res) => {
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

authRouter.get('/test/protected/maker', (req, res) => {
  if (!req.user.roles.includes('maker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

authRouter.get('/test/protected/checker', (req, res) => {
  if (!req.user.roles.includes('checker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

module.exports = { authRouter, openRouter };
