const all = jest.fn();
const get = jest.fn();
const post = jest.fn();
const use = jest.fn();

const routeObj = {
  all: jest.fn(() => routeObj),
  get: jest.fn(() => routeObj),
  post: jest.fn(() => routeObj),
};

const route = jest.fn(() => routeObj);

jest.doMock('express', () => ({
  Router: () => ({
    get,
    post,
    use,
    route,
  }),
}));

module.exports = {
  all,
  get,
  post,
  use,
  route,
};
