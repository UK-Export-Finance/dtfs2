const api = require('./api');

module.exports = (app) => {
  const { get, post, put, remove } = api(app);

  return async (user) => {
    const {username, password} = user;
    await post(user).to('/api/users');

    const {body} = await post({username, password}).to('/api/login');
    const {token} = body;

    return token;
  }
}
