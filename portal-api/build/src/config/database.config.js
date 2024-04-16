"use strict";
const dotenv = require('dotenv');
dotenv.config();
const dbName = process.env.MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI;
module.exports = {
    dbName,
    url: connectionString,
};
