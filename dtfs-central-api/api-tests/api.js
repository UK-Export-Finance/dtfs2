const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();

const { DTFS_CENTRAL_API_KEY } = process.env;

const headers = {
  'x-api-key': DTFS_CENTRAL_API_KEY,
  'content-type': 'application/json',
};

module.exports = (app) => ({
  post: (data) => ({
    to: async (url) => request(app).post(url).send(data).set(headers),
  }),

  postEach: (list) => ({
    to: async (url) => {
      const results = [];

      for (const data of list) {
        const result = await request(app).post(url).send(data).set(headers);

        results.push(result);
      }

      return results;
    },
  }),

  put: (data) => ({
    to: async (url) => request(app).put(url).send(data).set(headers),
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

  get: async (url, data) => request(app).get(url).send(data).set(headers),

  remove: (data) => ({
    to: async (url) => request(app).delete(url).send(data).set(headers),
  }),

  as: (user) => {
    const token = user && user.token ? user.token : '';

    return {
      post: (data) => ({
        to: async (url) =>
          request(app)
            .post(url)
            .set({ Authorization: token || '' })
            .send(data)
            .set(headers),
      }),

      postEach: (list) => ({
        to: async (url) => {
          const results = list.map((data) =>
            request(app)
              .post(url)
              .set({ Authorization: token || '' })
              .send(data)
              .set(headers),
          );

          return Promise.all(results);
        },
      }),

      put: (data) => ({
        to: async (url) =>
          request(app)
            .put(url)
            .set({ Authorization: token || '' })
            .send(data)
            .set(headers),
      }),

      get: async (url, query = {}) =>
        request(app)
          .get(url)
          .set({ Authorization: token || '' })
          .query(query)
          .set(headers),

      remove: async (url) =>
        request(app)
          .delete(url)
          .set({ Authorization: token || '' })
          .send()
          .set(headers),
    };
  },
});
