const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();

const createApi = (app) => ({
  get: async (url, query = {}, headers = {}) => request(app).get(url).set(headers).query(query),

  post: (data, headers = {}) => ({
    to: async (url) => request(app).post(url).set(headers).send(data),
  }),
});

module.exports = {
  createApi,
};
