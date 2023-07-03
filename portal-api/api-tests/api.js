// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();

const { API_KEY } = process.env;

const headers = (token) => ({
  'x-api-key': API_KEY,
  Authorization: token || '',
});

module.exports = (app) => ({
  as: (user) => {
    const token = (user && user.token) ? user.token : '';

    return {
      post: (data) => ({
        to: async (url) => request(app)
          .post(url)
          .set(headers(token))
          .send(data),
      }),

      postMultipartForm: (data, files = []) => ({
        to: async (url) => {
          const apiRequest = request(app)
            .post(url)
            .set(headers(token));

          if (files.length) {
            files.forEach((file) => apiRequest.attach(file.fieldname, file.filepath));
          }

          Object.entries(data).forEach(([fieldname, value]) => {
            apiRequest.field(fieldname, value);
          });

          return apiRequest;
        },
      }),

      postEach: (list) => ({
        to: async (url) => {
          const results = list.map((data) => request(app)
            .post(url)
            .set(headers(token))
            .send(data));

          return Promise.all(results);
        },
      }),

      put: (data) => ({
        to: async (url) => request(app)
          .put(url)
          .set(headers(token))
          .send(data),
      }),

      putMultipartForm: (data, files = []) => ({
        to: async (url) => {
          const apiRequest = request(app)
            .put(url)
            .set(headers(token));

          if (files.length) {
            files.forEach((file) => apiRequest.attach(file.fieldname, file.filepath));
          }

          Object.entries(data).forEach(([fieldname, value]) => {
            apiRequest.field(fieldname, value);
          });

          return apiRequest;
        },
      }),

      get: async (url, query = {}) => request(app)
        .get(url)
        .set(headers(token))
        .query(query),

      remove: async (url) => request(app)
        .delete(url)
        .set(headers(token))
        .send(),
    };
  },
});
