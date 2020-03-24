const request = require('supertest');

module.exports = (app) => {

  return {

    post: (data, token) => {
      return {
        to: async (url) => {

          return request(app)
                   .post(url)
                   .set({ Authorization: token?token:'' })
                   .send(data)

        }
      }
    },

    put: (data, token) => {
      return {
        to: async (url) => {

          return request(app)
                   .put(url)
                   .set({ Authorization: token?token:'' })
                   .send(data)

        }
      }
    },

    get: async (url, token) => {
      return request(app)
        .get(url)
        .set({ Authorization: token?token:'' })
    },

    remove: async (url, token) => {
      return request(app)
          .delete(url)
          .set({ Authorization: token?token:'' })
          .send()
    }

  }
}
