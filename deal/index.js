const express = require("express");
const MOCKS = require("./mocks");

const app = express();
const mongoose = require("mongoose");

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 5000;

const deals = require("./controllers/deal.controller");

mongoose.Promise = global.Promise;

app.get("/api/deals", deals.findAll);
app.put("/api/deals", deals.create);

app.get("/api/deals/:id", deals.findOne);
app.put("/api/deals/:id", deals.update);

console.log(PORT);

const getMockContractById = id =>
  MOCKS.CONTRACTS.find(c => c.id === id) || MOCKS.CONTRACTS[0];

  app.use(bodyParser.json()); // lets us get at posted data

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
app.get("/mocks/contract/:id/comments", (req, res) => {
  res.status(200).send(getMockContractById(req.params.id));
});

  app.post('/deal', (req, res) => {
    // prove we're receiving something..
    console.log(JSON.stringify(req.body,null,2));

    res.status(200).send();
  });

app.listen(PORT, () => console.log(`Deals API listening on port ${PORT}`))
