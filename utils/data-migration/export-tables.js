/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const dotenv = require('dotenv');
const dateFns = require('date-fns');
const { MongoClient } = require('mongodb');

dotenv.config();

const dbName = process.env.MONGO_INITDB_DATABASE;
const url = process.env.MONGODB_URI;

let client;

let connection = null;

const dbConnect = async () => {
  client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connection = await client.db(dbName);
  return connection;
};

const getConnection = async () => {
  if (!connection) {
    connection = await dbConnect();
  }

  return connection;
};

const getCollection = async (collectionName) => {
  if (!connection) {
    await getConnection();
  }
  const collection = await connection.collection(collectionName);

  return collection;
};

const close = async () => {
  if (client) {
    await client.close();
  }
};

const exportAllCollections = async (collections) => {
  const exportDirectory = './exports';

  const obj = { files: [] };

  // create the ./exports directory if it doesn't exist
  if (!fs.existsSync(exportDirectory)) {
    fs.mkdirSync(exportDirectory);
  }
  // loop through the array of collections to export
  for (const table of collections.sort()) {
    const collection = await getCollection(table);
    await collection.find({}).toArray((err, result) => {
      if (err) throw err;
      const todayDate = new Date();
      const date = dateFns.format(todayDate, 'dd-LLL-yyyy @ hh mm aaa');

      // create the folder for the current time & date if it doesn't exist
      if (!fs.existsSync(`${exportDirectory}/${date}`)) {
        fs.mkdirSync(`${exportDirectory}/${date}`);
        obj.folder = {
          name: date,
        };
      }

      for (const item of result) {
        // all `_id` properties should be converted to MongoDb ObjectId
        item._id = { $oid: item._id };
        // delete the `_csrf`
        if (item._csrf) {
          delete item._csrf;
        }
        if (table === 'tfm-deals') {
          // override the item.dealSnapshot._id to be a MongoDb ObjectId
          item.dealSnapshot._id = { $oid: item.dealSnapshot._id };
          for (const val2 of item.dealSnapshot.facilities) {
            val2._id = { $oid: val2._id };
            if (val2._csrf) {
              delete val2._csrf;
            }
          }
        }
        if (table === 'tfm-facilities') {
          item.facilitySnapshot._id = { $oid: item.facilitySnapshot._id };
          item.facilitySnapshot.dealId = { $oid: item.facilitySnapshot.dealId };
          if (item.facilitySnapshot._csrf) {
            delete item.facilitySnapshot._csrf;
          }
        }
        if (table === 'facilities') {
          item.dealId = { $oid: item.dealId };
        }
      }

      obj.files.push(table);
      // write the file to the ./exports directory
      fs.writeFile(`${exportDirectory}/${date}/${table}.json`, JSON.stringify(result, null, 2), (error) => {
        if (error) throw error;
      });

      // check if all collections have been exported
      if (obj.files.length === collections.length) {
        let text = `The following collections have been exported to '${exportDirectory}/${date}' folder: \n`;
        let count = 0;
        // loop through the array of files that have been exported
        for (const file of obj.files) {
          count += 1;
          text += `\n ${count}: ${file}`;
        }
        console.info(text);
        // close the connection
        close();
      }
    });
  }
};

// a list of collections that we want to export
const collections = [
  'deals',
  'facilities',
  'tfm-deals',
  'tfm-facilities',
  'tfm-feedback',
  'tfm-teams',
  'tfm-users',
  'users',
  'banks',
  'mandatoryCriteria',
  'eligibilityCriteria',
  'gef-eligibilityCriteria',
  'gef-mandatoryCriteriaVersioned',
  'cron-job-logs',
  'files',
  'durable-functions-log',
  'feedback'
];
exportAllCollections(collections);
