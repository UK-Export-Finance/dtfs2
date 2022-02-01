import { agent as request } from 'supertest';

module.exports = (app: any) => ({
   get: async (url: string) => request(app).get(url),
   post: (data: any) => ({
      to: async (url: string) => request(app).post(url).send(data),
   }),
});
