const mockResponse = () => {
  const res = {};
  res.locals = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = mockResponse;
