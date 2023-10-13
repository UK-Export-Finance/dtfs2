/* eslint-disable */
const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();

const { TFM_API_KEY } = process.env;

const headers = (token) => ({
  'content-type': 'application/json',
  'x-api-key': TFM_API_KEY,
  Authorization: token,
});

module.exports = (app) => ({
  as: (user) => {
    const token = user?.token ? user.token : '';

    return {
      post: (data) => ({
        to: async (url) => request(app).post(url).send(data).set(headers(token)),
      }),

      postEach: (list) => ({
        to: async (url) => {
          const results = [];

          for (const data of list) {
            const result = await request(app).post(url).send(data).set(headers(token));

            results.push(result);
          }

          return results;
        },
      }),

      put: (data) => ({
        to: async (url) => request(app).put(url).send(data).set(headers(token)),
      }),

      putMultipartForm: (data, files = []) => ({
        to: async (url) => {
          const apiRequest = request(app).put(url).set(headers(token));

          if (files.length) {
            files.forEach((file) => apiRequest.attach(file.fieldname, file.filepath));
          }

          Object.entries(data).forEach(([fieldname, value]) => {
            apiRequest.field(fieldname, value);
          });

          return apiRequest;
        },
      }),

      get: async (url) => request(app).get(url).set(headers(token)),

      remove: (data) => ({
        to: async (url) => request(app).delete(url).send(data).set(headers(token)),
      }),
    };
  },
  post: (data) => ({
    to: async (url) => request(app).post(url).send(data).set(headers(null)),
  }),
  get: (url, { headers, query } = {}) => {
    const requestInProgress = request(app).get(url);
    if (headers) {
      requestInProgress.set(headers);
    }
    if (query) {
      requestInProgress.query(query);
    }
    return requestInProgress;
  },
  put: (url, data, { headers } = {}) => {
    const requestInProgress = request(app).put(url);
    if (headers) {
      requestInProgress.set(headers);
    }
    return requestInProgress.send(data);
  },
});

/* eslint-enable */
