const { mockUser } = require('./mock-user');

const mockReq = () => ({
  session: {},
  flash: jest.fn(),
});

const mockRes = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();

  return res;
};

module.exports = {
  mockReq,
  mockRes,
  mockUser,
};
