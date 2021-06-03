/* eslint-disable */
const request = require('supertest');

module.exports = (app) => ({
  post: (data) => ({
    to: async (url) => request(app)
      .post(url)
      .send(data),
  }),

  postEach: (list) => ({
    to: async (url) => {
      const results = [];

      for (const data of list) {
        const result = await request(app)
          .post(url)
          .send(data);

        results.push(result);
      }

      return results;
    },
  }),

  put: (data) => ({
    to: async (url) => request(app)
      .put(url)
      .send(data),
  }),

  putMultipartForm: (data, files = []) => ({
    to: async (url) => {
      const apiRequest = request(app)
        .put(url);

      if (files.length) {
        files.forEach((file) => apiRequest.attach(file.fieldname, file.filepath));
      }

      Object.entries(data).forEach(([fieldname, value]) => {
        apiRequest.field(fieldname, value);
      });

      return apiRequest;
    },
  }),

  get: async (url) => request(app)
    .get(url),

  remove: (data) => ({
    to: async (url) =>
      request(app)
        .delete(url)
        .send(data),
  }),
});

/* eslint-enable */
