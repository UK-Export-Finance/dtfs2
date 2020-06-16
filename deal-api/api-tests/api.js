const request = require('supertest');

module.exports = (app) => ({
  as: (user) => {
    const token = (user && user.token) ? user.token : '';

    return {
      post: (data) => ({
        to: async (url) => request(app)
          .post(url)
          .set({ Authorization: token || '' })
          .send(data),
      }),

      postEach: (list) => ({
        to: async (url) => {
          const results = [];

          for (const data of list) {
            const result = await request(app)
              .post(url)
              .set({ Authorization: token || '' })
              .send(data);

            results.push(result);
          }

          return results;
        },
      }),

      put: (data) => ({
        to: async (url) => request(app)
          .put(url)
          .set({ Authorization: token || '' })
          .send(data),
      }),

      putMultipartForm: (data, files = []) => ({
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

      get: async (url) => request(app)
        .get(url)
        .set({ Authorization: token || '' }),

      remove: async (url) => request(app)
        .delete(url)
        .set({ Authorization: token || '' })
        .send(),
    };
  },
});
