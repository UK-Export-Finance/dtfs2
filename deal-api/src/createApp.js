const bodyParser = require('body-parser');
const express = require('express');

const deals = require('./controllers/deal.controller');

const banks = require('./controllers/banks.controller');
const bondCurrencies = require('./controllers/bondCurrencies.controller');

const MOCKS = require('./mocks/index');

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));

//----
// things that should be in this file

app.get('/api/deals', deals.findAll);
app.post('/api/deals', deals.create);

app.get('/api/deals/:id', deals.findOne);
app.put('/api/deals/:id', deals.update);

//-----
// things that feel like candidates to move to another service

app.get('/api/banks', banks.findAll);
app.post('/api/banks', banks.create);

app.get('/api/bondCurrencies', bondCurrencies.findAll);
app.post('/api/bondCurrencies', bondCurrencies.create);

//-----
// mocks we should be working our way through, moving them into a mongo instance

app.get('/mocks/contract/:id/comments', (req, res) => {
  res.status(200).send(getMockContractById(req.params.id));
});

app.get('/mocks/countries', (req, res) => {
  res.status(200).send(MOCKS.COUNTRIES);
});

app.get('/mocks/industry-sectors', (req, res) => {
  res.status(200).send(MOCKS.INDUSTRY_SECTORS);
});

app.get('/mocks/mandatoryCriteria', (req, res) => {
  res.status(200).send(MOCKS.MANDATORY_CRITERIA);
});

app.get('/mocks/transactions', (req, res) => {
  res.status(200).send(MOCKS.TRANSACTIONS);
});

module.exports = app
