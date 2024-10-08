const mockProvide = () => {
  jest.mock('../../server/routes/api-data-provider', () => ({
    ...jest.requireActual('../../server/routes/api-data-provider'),
    provide: () => (req, res, next) => next(),
  }));
};

module.exports = mockProvide;
