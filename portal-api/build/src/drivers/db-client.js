"use strict";
const tslib_1 = require("tslib");
const { MongoClient } = require('mongodb');
const { dbName, url } = require('../config/database.config');
let client;
let connection = null;
const dbConnect = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    client = yield MongoClient.connect(url);
    connection = yield client.db(dbName);
    return connection;
});
const getConnection = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!connection) {
        connection = yield dbConnect();
    }
    return connection;
});
module.exports.get = getConnection;
module.exports.getCollection = (collectionName) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!connection) {
        yield getConnection();
    }
    const collection = yield connection.collection(collectionName);
    return collection;
});
module.exports.close = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (client) {
        yield client.close();
    }
});
