const request = require('supertest');

module.exports = (app) => {

  return {

    post: (data) => {
      return {
        to: async (url) => {

          return request(app)
                   .post(url)
                   .send(data)

        }
      }
    },

    put: (data) => {
      return {
        to: async (url) => {

          return request(app)
                   .put(url)
                   .send(data)

        }
      }
    },

    get: async (url, token) => {
      return new Promise( (resolve, reject) => {

        request(app)
            .get(url)
            .set({ Authorization: token?token:'' })
            .then(response => {
              resolve(response);
            })

      });
    },
    remove: async (url) => {
      return new Promise( (resolve, reject) => {

        request(app)
            .delete(url)
            .send()
            .then(response => {
              resolve(response);
            })

      });
    }

  }
}
