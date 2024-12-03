const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();

const { PORTAL_API_KEY } = process.env;

const authHeaders = (token) => ({
  'x-api-key': PORTAL_API_KEY,
  Authorization: token,
});

const postMultipartForm = (app, { url, data, files, headers }) => {
  const requestInProgress = request(app).post(url);

  if (headers) {
    requestInProgress.set(headers);
  }

  if (files.length) {
    files.forEach((file) => requestInProgress.attach(file.fieldname, file.filepath));
  }

  Object.entries(data).forEach(([fieldname, value]) => {
    const valueToAdd = typeof value === 'object' ? JSON.stringify(value) : value;
    requestInProgress.field(fieldname, valueToAdd);
  });

  return requestInProgress;
};

module.exports = (app) => ({
  as: (user) => {
    const token = user && user.token ? user.token : '';
    const headers = authHeaders(token);

    return {
      post: (data) => ({
        to: async (url) => request(app).post(url).set(headers).send(data),
      }),

      postMultipartForm: (data, files = []) => ({
        to: (url) => postMultipartForm(app, { url, data, files, headers }),
      }),

      postEach: (list) => ({
        to: async (url) => {
          const results = list.map((data) => request(app).post(url).set(headers).send(data));

          return Promise.all(results);
        },
      }),

      put: (data) => ({
        to: async (url) => request(app).put(url).set(headers).send(data),
      }),

      putMultipartForm: (data, files = []) => ({
        to: async (url) => {
          const apiRequest = request(app).put(url).set(headers);

          if (files.length) {
            files.forEach((file) => apiRequest.attach(file.fieldname, file.filepath));
          }

          Object.entries(data).forEach(([fieldname, value]) => {
            apiRequest.field(fieldname, value);
          });

          return apiRequest;
        },
      }),

      get: async (url, query = {}) => request(app).get(url).set(headers).query(query),

      remove: async (url) => request(app).delete(url).set(headers).send(),
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
  postMultipartForm: (...args) => postMultipartForm(app, ...args),
  remove: (url, { headers } = {}) => {
    const requestInProgress = request(app).delete(url);
    if (headers) {
      requestInProgress.set(headers);
    }
    return requestInProgress.send();
  },
});
