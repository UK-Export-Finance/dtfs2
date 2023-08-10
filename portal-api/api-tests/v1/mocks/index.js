const mockReq = () => ({
  headers: {},
});

const mockReqWithCsrf = () => ({
  headers: {},
  body: { _csrf: '123' },
});

const mockRes = () => {
  const res = {};

  res.send = jest.fn();
  res.status = jest.fn(() => res);

  return res;
};

const mockNext = jest.fn();

module.exports = { mockReq, mockRes, mockNext, mockReqWithCsrf };
