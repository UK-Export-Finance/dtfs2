const express = require('express');
const passport = require('passport');

const multer = require('multer');
const validate = require('../role-validator');

const deals = require('./controllers/deal.controller');
const dealStatus = require('./controllers/deal-status.controller');
const dealIntegration = require('./controllers/deal-integration.controller');
const banks = require('./controllers/banks.controller');
const bondCurrencies = require('./controllers/bondCurrencies.controller');
const countries = require('./controllers/countries.controller');
const industrySectors = require('./controllers/industrySectors.controller');
const mandatoryCriteria = require('./controllers/mandatoryCriteria.controller');
const transactions = require('./controllers/transactions.controller');
const eligibilityCriteria = require('./controllers/eligibility-criteria.controller');
const bonds = require('./controllers/bonds.controller');
const eligibilityDocumentation = require('./controllers/eligibility-documentation.controller');
const fileshare = require('./controllers/fileshare.controller');

const users = require('./users/routes');

const authRouter = express.Router();
const openRouter = express.Router();

const upload = multer();

authRouter.use(passport.authenticate('jwt', { session: false }));

authRouter.route('/deals')
  .get(
    validate({ role: ['maker', 'checker'] }),
    deals.findAll,
  )
  .post(
    validate({ role: ['maker'] }),
    deals.create,
  );

authRouter.route('/deals/:id/status')
  .get(
    validate({ role: ['maker', 'checker'] }),
    dealStatus.findOne,
  )
  .put(
    validate({ role: ['maker', 'checker'] }),
    dealStatus.update,
  );

authRouter.route('/deals/:id/integration/type-a')
  .get(
    validate({ role: ['checker'] }),
    dealIntegration.findOne,
  );

authRouter.route('/deals/:start/:pagesize')
  .get(
    validate({ role: ['maker', 'checker'] }),
    deals.findPage,
  );

authRouter.route('/deals/:start/:pagesize/:filters')
  .get(
    validate({ role: ['maker', 'checker'] }),
    deals.findPage,
  );

authRouter.route('/deals/:id')
  .get(
    validate({ role: ['maker', 'checker'] }),
    deals.findOne,
  )
  .put(
    validate({ role: ['maker'] }),
    deals.update,
  )
  .delete(
    validate({ role: ['maker'] }),
    deals.delete,
  );

authRouter.route('/deals/:id/clone')
  .post(
    validate({ role: ['maker'] }),
    deals.clone,
  );

authRouter.route('/deals/:id/eligibility-criteria')
  .put(
    validate({ role: ['maker'] }),
    eligibilityCriteria.update,
  );

authRouter.route('/deals/:id/eligibility-documentation')
  .put(
    validate({ role: ['maker'] }),
    upload.any(),
    eligibilityDocumentation.update,
  );

authRouter.route('/deals/:id/bond/create')
  .put(
    validate({ role: ['maker'] }),
    bonds.create,
  );

authRouter.route('/deals/:id/bond/:bondId')
  .put(
    validate({ role: ['maker'] }),
    bonds.updateBond,
  );

authRouter.route('/fileshare/url')
  .get(
    validate({ role: ['maker', 'checker'] }),
    fileshare.getFileshareUrl,
  );

authRouter.route('/banks')
  .get(
    banks.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    banks.create,
  );

authRouter.route('/banks/:id')
  .get(
    banks.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    banks.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    banks.delete,
  );

authRouter.route('/bond-currencies')
  .get(
    bondCurrencies.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    bondCurrencies.create,
  );

authRouter.route('/bond-currencies/:id')
  .get(
    bondCurrencies.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    bondCurrencies.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    bondCurrencies.delete,
  );

authRouter.route('/countries')
  .get(
    countries.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    countries.create,
  );

authRouter.route('/countries/:code')
  .get(
    countries.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    countries.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    countries.delete,
  );

authRouter.route('/industry-sectors')
  .get(
    industrySectors.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    industrySectors.create,
  );

authRouter.route('/industry-sectors/:code')
  .get(
    industrySectors.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    industrySectors.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    industrySectors.delete,
  );

authRouter.route('/mandatory-criteria')
  .get(
    mandatoryCriteria.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    mandatoryCriteria.create,
  );

authRouter.route('/mandatory-criteria/:id')
  .get(
    mandatoryCriteria.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    mandatoryCriteria.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    mandatoryCriteria.delete,
  );

authRouter.route('/transactions')
  .get(
    transactions.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    transactions.create,
  );

authRouter.route('/transactions/:bankFacilityId')
  .get(
    transactions.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    transactions.update,
  )
  .delete(
    validate({ role: ['editor'] }),
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

// simplest token-validator
authRouter.get(
  '/validate',
  validate(),
  (req, res) => {
    res.status(200).send();
  },
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
