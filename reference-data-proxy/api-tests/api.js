const request = require('supertest');

module.exports = (app) => ({
  get: async (url) => request(app)
    .get(url),
});
