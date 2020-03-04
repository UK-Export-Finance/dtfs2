const MOCKS = require("../mocks");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const dbName = "<todo>";
const user = encodeURIComponent("<todo>");
const password = encodeURIComponent("<todo>");
const authMechanism = "DEFAULT";
const url = `mongodb://${user}:${password}@localhost:27017/?authMechanism=${authMechanism}`;

const client = new MongoClient(url, { useNewUrlParser: true });

const getDealById = id => {
  return MOCKS.CONTRACTS.find(c => c.id === id) || MOCKS.CONTRACTS[0];
};

const findDeals = (db, callback) => {
  const collection = db.collection("deals");

  collection.find({}).toArray(function(err, result) {
    assert.equal(err, null);
    console.log("Found deals:");
    console.log(result);
    callback(result);
  });
};

exports.create = (req, res) => {};

exports.findAll = (req, res) => {
  client.connect(function(err) {
    const db = client.db(dbName);

    findDeals(db, deals => {
      client.close();
      console.log({ deals });
      res.status(200).send(deals);
    });
  });
};

exports.findOne = (req, res) => {
  res.status(200).send(getDealById(req.params.id));
};

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
