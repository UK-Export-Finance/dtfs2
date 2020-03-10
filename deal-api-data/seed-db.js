const fs = require("fs");
const xml2js = require("xml2js");
const util = require("util");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const dbName = "<todo>";
const user = encodeURIComponent("<todo>");
const password = encodeURIComponent("<todo>");
const authMechanism = "DEFAULT";

const url = `mongodb://${user}:${password}@localhost:27017/?authMechanism=${authMechanism}`;

const xml2jsOptions = {
  attrkey: "@"
};

const insertDeals = function(deals, db, callback) {
  // Get the documents collection
  const collection = db.collection("deals");
  console.log(`Inserting ${deals.length} deals into db`);

  // Insert some documents
  collection.insertMany(deals, function(err, result) {
    if (err) {
      console.log(err);
    }

    callback(result);
  });
};

async function insertIntoDb(deals) {
  const client = new MongoClient(url, { useNewUrlParser: true });

  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection("deals");

    collection.remove({});

    collection.insertMany(deals, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Inserted ${deals.length} deals into db`);
      }

      client.close();
    });
  });
}

async function loadSeedFiles(path) {
  const deals = [];

  const dir = await fs.promises.opendir(path);

  for await (const dirent of dir) {
    const parser = new xml2js.Parser(xml2jsOptions);
    const xmlData = fs.readFileSync(`${path}/${dirent.name}`);

    parser.parseString(xmlData, function(err, data) {
      deals.push({
        id: `${deals.length + 1}`,
        status: "submitted",
        deal: data.Deal
      });
    });

    console.log(`${path}/${dirent.name} imported`);
  }

  insertIntoDb(deals);
}

loadSeedFiles("./initData");
