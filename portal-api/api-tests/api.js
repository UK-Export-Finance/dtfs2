// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();

const { PORTAL_API_KEY } = process.env;

const authHeaders = (token) => ({
  'x-api-key': PORTAL_API_KEY,
  Authorization: token,
});

module.exports = (app) => ({
  as: (user) => {
    const token = (user && user.token) ? user.token : '';

    return {
      post: (data) => ({
        to: async (url) => request(app)
          .post(url)
          .set(authHeaders(token))
          .send(data),
      }),

      postMultipartForm: (data, files = []) => ({
        to: async (url) => {
          const apiRequest = request(app)
            .post(url)
            .set(authHeaders(token));

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
            .set(authHeaders(token))
            .send(data));

          return Promise.all(results);
        },
      }),

      put: (data) => ({
        to: async (url) => request(app)
          .put(url)
          .set(authHeaders(token))
          .send(data),
      }),

      putMultipartForm: (data, files = []) => ({
        to: async (url) => {
          const apiRequest = request(app)
            .put(url)
            .set(authHeaders(token));

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
        .set(authHeaders(token))
        .query(query),

      remove: async (url) => request(app)
        .delete(url)
        .set(authHeaders(token))
        .send(),
    };
  },
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
  post: (url, data, { headers } = {}) => {
    const requestInProgress = request(app).post(url);
    if (headers) {
      requestInProgress.set(headers);
    }
    return requestInProgress.send(data);
  },
  remove: (url, { headers } = {}) => {
    const requestInProgress = request(app).delete(url);
    if (headers) {
      requestInProgress.set(headers);
    }
    return requestInProgress.send();
  },
});
