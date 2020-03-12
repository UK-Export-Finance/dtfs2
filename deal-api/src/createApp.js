const bodyParser = require('body-parser');
const express = require('express');

const deals = require('./controllers/deal.controller');
const MOCKS = require('./mocks/index');

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));

app.get('/api/deals', deals.findAll);
app.post('/api/deals', deals.create);

app.get('/api/deals/:id', deals.findOne);
app.put('/api/deals/:id', deals.update);

const getMockContractById = (id) => MOCKS.CONTRACTS.find((c) => c.id === id) || MOCKS.CONTRACTS[0];

app.get('/mocks/banks', (req, res) => {
  res.status(200).send(MOCKS.BANKS);
});

app.get('/mocks/bondCurrencies', (req, res) => {
  res.status(200).send(MOCKS.BOND_CURRENCIES);
});

app.get('/mocks/contracts', (req, res) => {
  res.status(200).send(MOCKS.CONTRACTS);
});

app.get('/mocks/transactions', (req, res) => {
  res.status(200).send(MOCKS.TRANSACTIONS);
});

app.get('/mocks/contract/:id', (req, res) => {
  res.status(200).send(getMockContractById(req.params.id));
});

app.get('/mocks/contracts', (req, res) => {
  res.status(200).send(MOCKS.CONTRACTS);
});

app.get('/mocks/contract/:id/comments', (req, res) => {
  res.status(200).send(getMockContractById(req.params.id));
});

app.get('/mocks/countries', (req, res) => {
  res.status(200).send(MOCKS.COUNTRIES);
});

app.get('/mocks/mandatoryCriteria', (req, res) => {
  res.status(200).send(MOCKS.MANDATORY_CRITERIA);
});

module.exports = app
