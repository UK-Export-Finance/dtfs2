const api = require("./api");

module.exports = app => {
  const { get, post, put, remove } = api(app);

  return async user => {
    const { username, password } = user;
    await post(user).to("/v1/users");

    const { body } = await post({ username, password }).to("/v1/login");
    const { token } = body;

    return token;
  };
};
