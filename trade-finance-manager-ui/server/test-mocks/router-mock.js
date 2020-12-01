const get = jest.fn();
const post = jest.fn();
const use = jest.fn();

jest.doMock('express', () => ({
  Router: () => ({
    get,
    post,
    use,
  }),
}));

module.exports = {
  get,
  post,
  use,
};
