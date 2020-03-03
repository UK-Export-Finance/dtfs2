const express = require('express')
const MOCKS = require('./mocks')

const app = express()

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000

console.log(PORT)

const getMockContractById = id =>
  MOCKS.CONTRACTS.find(c => c.id === id) || MOCKS.CONTRACTS[0];

  app.get('/mocks/mandatoryCriteria', (req, res) => {
    res.status(200).send(MOCKS.MANDATORY_CRITERIA);
  });

  app.get('/mocks/contracts', (req, res) => {
    res.status(200).send(MOCKS.CONTRACTS)
  });

  app.get('/mocks/banks', (req, res) => {
    res.status(200).send(MOCKS.BANKS)
  });

  app.get('/mocks/transactions', (req, res) => {
    res.status(200).send(MOCKS.TRANSACTIONS)
  });

  app.get('/mocks/contract/:id', (req, res) => {
    res.status(200).send(getMockContractById(req.params.id))
  });

//TODO feels like this should send back getMockContractsById(x).comments but just copying from original service for now..
  app.get('/mocks/contract/:id/comments', (req, res) => {
    res.status(200).send(getMockContractById(req.params.id))
  });

app.listen(PORT, () => console.log(`Deals API listening on port ${PORT}`))
