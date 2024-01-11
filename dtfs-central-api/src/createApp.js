const { generateApp } = require('./generateApp');
const { setupChangeStream } = require('./setupChangeStream');

const app = generateApp();

setupChangeStream();

module.exports = app;
