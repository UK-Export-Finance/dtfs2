const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();

const createApi = (app) => ({
  get: (url, query = {}) => request(app).get(url).query(query),
});

module.exports = {
  createApi,
};
