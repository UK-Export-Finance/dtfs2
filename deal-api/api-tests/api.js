const request = require('supertest');

module.exports = (app) => ({

  post: (data, token) => ({
    to: async (url) => request(app)
      .post(url)
      .set({ Authorization: token || '' })
      .send(data),
  }),

  put: (data, token) => ({
    to: async (url) => request(app)
      .put(url)
      .set({ Authorization: token || '' })
      .send(data),
  }),

  putMultipartForm: (data, token, files = []) => ({
    to: async (url) => {
      const apiRequest = request(app)
        .put(url)
        .set({ Authorization: token || '' });

      if (files.length) {
        files.forEach((file) => apiRequest.attach(file.fieldname, file.filepath));
      }

      Object.entries(data).forEach(([fieldname, value]) => {
        apiRequest.field(fieldname, value);
      });

      return apiRequest;
    },
  }),

  get: async (url, token) => request(app)
    .get(url)
    .set({ Authorization: token || '' }),

  remove: async (url, token) => request(app)
    .delete(url)
    .set({ Authorization: token || '' })
    .send(),

});
