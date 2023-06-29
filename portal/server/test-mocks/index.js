const mockReq = () => ({
  session: {},
});

const mockRes = () => {
  const res = {};

  res.redirect = jest.fn();
  res.render = jest.fn();
  res.locals = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);

  return res;
};

const mockNext = jest.fn();

module.exports = {
  mockReq,
  mockRes,
  mockNext,
};
