const bodyParser = require('body-parser');
const express = require('express');

const deals = require('./controllers/deal.controller');

const banks = require('./controllers/banks.controller');
const bondCurrencies = require('./controllers/bondCurrencies.controller');
const countries = require('./controllers/countries.controller');
const industrySectors = require('./controllers/industrySectors.controller');
const mandatoryCriteria = require('./controllers/mandatoryCriteria.controller');
const transactions = require('./controllers/transactions.controller');

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

app.get ('/api/banks', banks.findAll);
app.post('/api/banks', banks.create);

app.get ('/api/bond-currencies', bondCurrencies.findAll);
app.post('/api/bond-currencies', bondCurrencies.create);

app.get ('/api/countries', countries.findAll);
app.post('/api/countries', countries.create);

app.get ('/api/industry-sectors', industrySectors.findAll);
app.post('/api/industry-sectors', industrySectors.create);

app.get ('/api/mandatory-criteria', mandatoryCriteria.findAll);
app.post('/api/mandatory-criteria', mandatoryCriteria.create);

app.get ('/api/transactions', transactions.findAll);
app.post('/api/transactions', transactions.create);

module.exports = app
