const request = require('supertest');

module.exports = (app) => {

  return {

    post: (data) => {
      return {
        to: async (url) => {

          return request(app)
                   .post(url)
                   .send(data)
                   .expect(200)

        }
      }
    },

    put: (data) => {
      return {
        to: async (url) => {

          return request(app)
                   .put(url)
                   .send(data)
                   .expect(200)

        }
      }
    },

    get: async (url) => {
      return new Promise( (resolve, reject) => {

        request(app)
            .get(url)
            .expect(200)
            .then(response => {
              resolve(response.text);
              //resolve(response.body);
            })

      });
    }

  }
}
