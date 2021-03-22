const request = require('supertest');

module.exports = (app) => ({
  get: async (url) => request(app).get(url),
  post: (data) => ({
    to: async (url) => request(app)
      .post(url)
      .send(data),
  }),
});
